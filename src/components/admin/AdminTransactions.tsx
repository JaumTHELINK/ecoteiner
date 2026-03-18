import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminTransactions = () => {
  const [search, setSearch] = useState("");

  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      
      // Fetch user names separately
      const userIds = [...new Set((data ?? []).map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);
      
      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]));
      return (data ?? []).map(t => ({ ...t, profile: profileMap.get(t.user_id) }));
    },
  });

  const filtered = transactions.filter((t: any) =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.profile?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por descrição ou usuário..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
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
