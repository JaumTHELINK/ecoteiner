import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [creditUser, setCreditUser] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDesc, setCreditDesc] = useState("");
  const [creditType, setCreditType] = useState<"credit" | "debit">("credit");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const adjustBalance = useMutation({
    mutationFn: async ({ userId, amount, type, description }: { userId: string; amount: number; type: "credit" | "debit"; description: string }) => {
      // Insert transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: userId,
        type,
        amount,
        description: description || (type === "credit" ? "Crédito manual (admin)" : "Débito manual (admin)"),
        category: type === "credit" ? "bonus" : "troca",
      });
      if (txError) throw txError;

      // Update balance
      const profile = profiles.find(p => p.user_id === userId);
      const currentBalance = Number(profile?.balance ?? 0);
      const newBalance = type === "credit" ? currentBalance + amount : currentBalance - amount;

      const { error: profError } = await supabase.from("profiles").update({
        balance: Math.max(0, newBalance),
      }).eq("user_id", userId);
      if (profError) throw profError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      setCreditUser(null);
      setCreditAmount("");
      setCreditDesc("");
      toast({ title: "Saldo atualizado com sucesso!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const filtered = profiles.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou email..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">CPF</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Saldo (FC)</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Reciclado</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(profile => (
                <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{profile.full_name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{profile.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{profile.cpf || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{Number(profile.balance)} FC</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{Number(profile.total_recycled_kg)} kg</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setCreditUser(profile.user_id); setCreditType("credit"); }}
                      >
                        <Plus className="h-3 w-3" /> Crédito
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setCreditUser(profile.user_id); setCreditType("debit"); }}
                      >
                        <Minus className="h-3 w-3" /> Débito
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit/Debit Modal */}
      {creditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20" onClick={() => setCreditUser(null)}>
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-card-hover" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              {creditType === "credit" ? "Adicionar Crédito" : "Realizar Débito"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Valor (FC)</label>
                <Input type="number" min="0" step="0.01" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Descrição</label>
                <Input value={creditDesc} onChange={e => setCreditDesc(e.target.value)} placeholder="Motivo do ajuste..." />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setCreditUser(null)}>Cancelar</Button>
                <Button
                  className="flex-1"
                  disabled={!creditAmount || Number(creditAmount) <= 0}
                  onClick={() => adjustBalance.mutate({
                    userId: creditUser,
                    amount: Number(creditAmount),
                    type: creditType,
                    description: creditDesc,
                  })}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
