import { Coins, Scale, TrendingUp, Award, ShoppingBag, MapPin, ArrowRight, Receipt, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const getLevel = (totalKg: number) => {
  if (totalKg >= 500) return "Mestre Eco";
  if (totalKg >= 200) return "Especialista";
  if (totalKg >= 100) return "Avançado";
  if (totalKg >= 50) return "Intermediário";
  if (totalKg >= 10) return "Aprendiz";
  return "Iniciante";
};

const Dashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["user-transactions", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: products } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(3);
      return data ?? [];
    },
    enabled: !!user,
  });

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";
  const balance = Number(profile?.balance ?? 0);

  const totalKg = transactions
    .filter(t => t.weight_kg)
    .reduce((sum, t) => sum + Number(t.weight_kg), 0);

  const now = new Date();
  const monthKg = transactions
    .filter(t => {
      if (!t.weight_kg) return false;
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + Number(t.weight_kg), 0);

  const totalTransactions = transactions.length;
  const level = getLevel(totalKg);

  const statsCards = [
    { label: "Saldo Atual", value: `${balance}`, subtitle: "Fênix Coins", icon: Coins, highlight: true },
    { label: "Total Reciclado", value: `${totalKg.toFixed(1)} kg`, subtitle: `${totalTransactions} transações`, icon: Scale },
    { label: "Este Mês", value: `${monthKg.toFixed(1)} kg`, subtitle: new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" }), icon: TrendingUp },
    { label: "Nível", value: level, subtitle: "Continue reciclando!", icon: Award },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Olá, {displayName}! 👋
        </h1>
        <p className="text-sm text-muted-foreground">Bem-vindo ao seu painel do Ecoteiner</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl p-5 shadow-card transition-shadow hover:shadow-card-hover ${
              card.highlight
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                : "bg-card text-card-foreground"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${card.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {card.label}
              </span>
              <card.icon className={`h-4 w-4 ${card.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`} />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">{card.value}</p>
            <p className={`mt-1 text-xs ${card.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="font-semibold text-foreground">Produtos em Destaque</h2>
                <p className="text-xs text-muted-foreground">Conheça os produtos disponíveis na loja</p>
              </div>
            </div>
            <Link to="/loja" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {(products ?? []).map((product) => (
              <div key={product.id} className="rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-card">
                <div className="mb-3 flex h-28 items-center justify-center rounded-md bg-muted">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary tabular-nums">{Number(product.price_fc)} FC</span>
                  <span className="text-xs text-muted-foreground">Informativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-card p-6 shadow-card">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <span className="text-muted-foreground">⚡</span> Ações Rápidas
            </h3>
            <div className="space-y-2">
              <Link to="/loja" className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" /> Ver Loja
              </Link>
              <Link to="/pontos" className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Pontos de Coleta
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-accent p-6">
            <h3 className="mb-2 font-semibold text-accent-foreground">Dica Eco</h3>
            <p className="text-sm text-accent-foreground/80">
              🌿 Leve seus materiais recicláveis aos pontos de coleta para ganhar Fênix Coins!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
