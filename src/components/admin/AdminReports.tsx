import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShoppingBag, MapPin, Coins } from "lucide-react";

const AdminReports = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const [profiles, products, points, transactions] = await Promise.all([
        supabase.from("profiles").select("id, balance, total_recycled_kg", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact" }).eq("active", true),
        supabase.from("collection_points").select("id", { count: "exact" }).eq("active", true),
        supabase.from("transactions").select("type, amount"),
      ]);

      const totalBalance = (profiles.data ?? []).reduce((s, p) => s + Number(p.balance), 0);
      const totalRecycled = (profiles.data ?? []).reduce((s, p) => s + Number(p.total_recycled_kg), 0);
      const totalCredits = (transactions.data ?? []).filter(t => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
      const totalDebits = (transactions.data ?? []).filter(t => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);

      return {
        userCount: profiles.count ?? 0,
        productCount: products.count ?? 0,
        pointCount: points.count ?? 0,
        transactionCount: (transactions.data ?? []).length,
        totalBalance,
        totalRecycled,
        totalCredits,
        totalDebits,
      };
    },
  });

  const cards = [
    { label: "Usuários Cadastrados", value: stats?.userCount ?? 0, icon: Users },
    { label: "Produtos Ativos", value: stats?.productCount ?? 0, icon: ShoppingBag },
    { label: "Pontos de Coleta", value: stats?.pointCount ?? 0, icon: MapPin },
    { label: "Total Transações", value: stats?.transactionCount ?? 0, icon: Coins },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-card">
          <h3 className="mb-4 font-semibold text-foreground">Fênix Coins em Circulação</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Creditado</span>
              <span className="font-medium text-primary tabular-nums">+{stats?.totalCredits ?? 0} FC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Debitado</span>
              <span className="font-medium text-destructive tabular-nums">-{stats?.totalDebits ?? 0} FC</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm">
              <span className="font-medium text-foreground">Saldo Total (todos usuários)</span>
              <span className="font-bold text-foreground tabular-nums">{stats?.totalBalance ?? 0} FC</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-card">
          <h3 className="mb-4 font-semibold text-foreground">Reciclagem</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Reciclado (todos)</span>
              <span className="font-medium text-foreground tabular-nums">{stats?.totalRecycled ?? 0} kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
