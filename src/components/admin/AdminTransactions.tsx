import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, ArrowUpCircle, ArrowDownCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const AdminTransactions = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedPoint, setSelectedPoint] = useState("");
  const [description, setDescription] = useState("");
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
      const { data } = await supabase.from("profiles").select("user_id, full_name, email");
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
  const calculatedFC = selectedMaterialData && quantity
    ? (Number(quantity) / selectedMaterialData.quantity_per_fenix) * selectedMaterialData.fenix_per_unit
    : 0;

  const createTransaction = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !selectedMaterial || !quantity || Number(quantity) <= 0) {
        throw new Error("Preencha usuário, material e quantidade.");
      }

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: selectedUser,
        type: "credit",
        category: "reciclagem",
        material: selectedMaterialData!.material,
        weight_kg: Number(quantity),
        amount: Math.round(calculatedFC * 100) / 100,
        collection_point_id: selectedPoint || null,
        description: description || `Reciclagem de ${selectedMaterialData!.material}`,
      });
      if (txError) throw txError;

      // Update user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("user_id", selectedUser)
        .single();

      const newBalance = (profile?.balance ?? 0) + Math.round(calculatedFC * 100) / 100;
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("user_id", selectedUser);
      if (balanceError) throw balanceError;
    },
    onSuccess: () => {
      toast.success("Transação registrada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
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
  };

  const filtered = transactions.filter((t: any) =>
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.profile?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por descrição ou usuário..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Reciclagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Usuário *</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger><SelectValue placeholder="Selecione um usuário" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.full_name || p.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Material *</Label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger><SelectValue placeholder="Selecione o material" /></SelectTrigger>
                  <SelectContent>
                    {materials.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.material} ({m.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade ({selectedMaterialData?.unit || "kg"}) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Ex: 5.0"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
              </div>

              {calculatedFC > 0 && (
                <div className="rounded-lg bg-primary/10 p-3 text-center">
                  <span className="text-sm text-muted-foreground">Valor calculado:</span>
                  <p className="text-xl font-bold text-primary">
                    +{Math.round(calculatedFC * 100) / 100} FC
                  </p>
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
                <Textarea
                  placeholder="Observações..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => createTransaction.mutate()}
                disabled={createTransaction.isPending || !selectedUser || !selectedMaterial || !quantity}
              >
                {createTransaction.isPending ? "Registrando..." : "Confirmar Transação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
