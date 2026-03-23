import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { Search, ArrowUpCircle, ArrowDownCircle, Plus, CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TxMode = "reciclagem" | "debito" | "ajuste";

const AdminTransactions = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const [open, setOpen] = useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedPoint, setSelectedPoint] = useState("");
  const [description, setDescription] = useState("");
  const [txMode, setTxMode] = useState<TxMode>("reciclagem");
  const [manualAmount, setManualAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      const userIds = [...new Set((data ?? []).map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]));
      return (data ?? []).map(t => ({ ...t, profile: profileMap.get(t.user_id) }));
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles-list"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, email, balance");
      return data ?? [];
    },
  });

  const { data: materials = [] } = useQuery({
    queryKey: ["admin-materials"],
    queryFn: async () => {
      const { data } = await supabase.from("material_rates").select("*").eq("active", true);
      return data ?? [];
    },
  });

  const { data: points = [] } = useQuery({
    queryKey: ["admin-collection-points"],
    queryFn: async () => {
      const { data } = await supabase.from("collection_points").select("id, name").eq("active", true);
      return data ?? [];
    },
  });

  const selectedMaterialData = materials.find(m => m.id === selectedMaterial);
  const selectedProfile = profiles.find(p => p.user_id === selectedUser);
  const calculatedFC = selectedMaterialData && quantity
    ? (Number(quantity) / selectedMaterialData.quantity_per_fenix) * selectedMaterialData.fenix_per_unit
    : 0;

  const effectiveAmount = txMode === "reciclagem"
    ? Math.round(calculatedFC * 100) / 100
    : Number(manualAmount) || 0;

  const createTransaction = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("Selecione um usuário.");

      if (txMode === "reciclagem") {
        if (!selectedMaterial || !quantity || Number(quantity) <= 0) {
          throw new Error("Preencha material e quantidade.");
        }
      } else {
        if (!manualAmount || Number(manualAmount) <= 0) {
          throw new Error("Informe um valor válido.");
        }
      }

      // Check balance for debits
      if (txMode === "debito") {
        const profile = profiles.find(p => p.user_id === selectedUser);
        if ((profile?.balance ?? 0) < effectiveAmount) {
          throw new Error(`Saldo insuficiente. Saldo atual: ${profile?.balance ?? 0} FC.`);
        }
      }

      const isCredit = txMode !== "debito";
      const category = txMode === "reciclagem" ? "reciclagem" : txMode === "debito" ? "troca" : "bonus";

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: selectedUser,
        type: isCredit ? "credit" : "debit",
        category,
        material: txMode === "reciclagem" ? selectedMaterialData!.material : null,
        weight_kg: txMode === "reciclagem" ? Number(quantity) : null,
        amount: effectiveAmount,
        collection_point_id: selectedPoint || null,
        description: description || (txMode === "reciclagem"
          ? `Reciclagem de ${selectedMaterialData!.material}`
          : txMode === "debito" ? "Débito/Resgate" : "Ajuste administrativo"),
      });
      if (txError) throw txError;

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, total_recycled_kg")
        .eq("user_id", selectedUser)
        .single();

      const currentBalance = profile?.balance ?? 0;
      const newBalance = isCredit ? currentBalance + effectiveAmount : currentBalance - effectiveAmount;

      const updatePayload: Record<string, number> = { balance: Math.max(0, newBalance) };
      if (txMode === "reciclagem" && quantity) {
        updatePayload.total_recycled_kg = (profile?.total_recycled_kg ?? 0) + Number(quantity);
      }

      const { error: balanceError } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("user_id", selectedUser);
      if (balanceError) throw balanceError;
    },
    onSuccess: () => {
      toast.success("Transação registrada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-profiles-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      resetForm();
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao registrar transação.");
    },
  });

  const resetForm = () => {
    setSelectedUser("");
    setSelectedMaterial("");
    setQuantity("");
    setSelectedPoint("");
    setDescription("");
    setTxMode("reciclagem");
    setManualAmount("");
  };

  const filtered = useMemo(() => {
    return transactions.filter((t: any) => {
      const matchesSearch =
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.profile?.email?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const txDate = new Date(t.created_at);
      const matchesFrom = !dateFrom || !isBefore(txDate, startOfDay(dateFrom));
      const matchesTo = !dateTo || !isAfter(txDate, endOfDay(dateTo));
      return matchesSearch && matchesType && matchesFrom && matchesTo;
    });
  }, [transactions, search, typeFilter, dateFrom, dateTo]);

  const hasActiveFilters = typeFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por descrição ou usuário..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Transação</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Transaction type */}
              <div className="space-y-2">
                <Label>Tipo de Transação *</Label>
                <Select value={txMode} onValueChange={(v) => setTxMode(v as TxMode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reciclagem">Crédito — Reciclagem</SelectItem>
                    <SelectItem value="debito">Débito — Resgate</SelectItem>
                    <SelectItem value="ajuste">Ajuste Administrativo (crédito)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User combobox */}
              <div className="space-y-2">
                <Label>Usuário *</Label>
                <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                      {selectedProfile
                        ? `${selectedProfile.full_name || selectedProfile.email} (${selectedProfile.balance} FC)`
                        : "Buscar usuário..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Digite o nome ou email..." />
                      <CommandList>
                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        <CommandGroup>
                          {profiles.map(p => (
                            <CommandItem
                              key={p.user_id}
                              value={`${p.full_name} ${p.email}`}
                              onSelect={() => { setSelectedUser(p.user_id); setUserPopoverOpen(false); }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedUser === p.user_id ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col">
                                <span>{p.full_name || "Sem nome"}</span>
                                <span className="text-xs text-muted-foreground">{p.email} — {p.balance} FC</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Recycling-specific fields */}
              {txMode === "reciclagem" && (
                <>
                  <div className="space-y-2">
                    <Label>Material *</Label>
                    <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                      <SelectTrigger><SelectValue placeholder="Selecione o material" /></SelectTrigger>
                      <SelectContent>
                        {materials.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.material} ({m.unit})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade ({selectedMaterialData?.unit || "kg"}) *</Label>
                    <Input type="number" min="0" step="0.1" placeholder="Ex: 5.0" value={quantity} onChange={e => setQuantity(e.target.value)} />
                  </div>
                  {calculatedFC > 0 && (
                    <div className="rounded-lg bg-primary/10 p-3 text-center">
                      <span className="text-sm text-muted-foreground">Valor calculado:</span>
                      <p className="text-xl font-bold text-primary">+{Math.round(calculatedFC * 100) / 100} FC</p>
                    </div>
                  )}
                </>
              )}

              {/* Manual amount for debit/adjustment */}
              {txMode !== "reciclagem" && (
                <div className="space-y-2">
                  <Label>Valor (FC) *</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={manualAmount} onChange={e => setManualAmount(e.target.value)} />
                  {txMode === "debito" && selectedProfile && Number(manualAmount) > (selectedProfile.balance ?? 0) && (
                    <p className="text-xs text-destructive">
                      Saldo insuficiente. Saldo atual: {selectedProfile.balance} FC
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Ponto de Coleta (opcional)</Label>
                <Select value={selectedPoint} onValueChange={setSelectedPoint}>
                  <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {points.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea placeholder="Observações..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <Button
                className="w-full"
                onClick={() => createTransaction.mutate()}
                disabled={createTransaction.isPending || !selectedUser || (txMode === "reciclagem" ? (!selectedMaterial || !quantity) : !manualAmount)}
              >
                {createTransaction.isPending ? "Registrando..." : "Confirmar Transação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="credit">Crédito</SelectItem>
            <SelectItem value="debit">Débito</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Data início"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "dd/MM/yyyy") : "Data fim"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setTypeFilter("all"); setDateFrom(undefined); setDateTo(undefined); }}>Limpar filtros</Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuário</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t: any) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {format(new Date(t.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-foreground">{t.profile?.full_name || t.profile?.email || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.description}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{t.category}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 tabular-nums font-medium ${t.type === "credit" ? "text-primary" : "text-destructive"}`}>
                      {t.type === "credit" ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                      {t.type === "credit" ? "+" : "-"}{Number(t.amount)} FC
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhuma transação encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
