import { Coins, Scale, TrendingUp, Award, ShoppingBag, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const statsCards = [
  {
    label: "Saldo Atual",
    value: "0",
    subtitle: "Fênix Coins",
    icon: Coins,
    highlight: true,
  },
  {
    label: "Total Reciclado",
    value: "0 kg",
    subtitle: "Desde o início",
    icon: Scale,
  },
  {
    label: "Este Mês",
    value: "29 kg",
    subtitle: "+12% vs mês anterior",
    icon: TrendingUp,
  },
  {
    label: "Nível",
    value: "Iniciante",
    subtitle: "Continue reciclando!",
    icon: Award,
  },
];

const featuredProducts = [
  { name: "Desconto 10% Supermercado", price: "50 FC", tag: "Informativo" },
  { name: "Vale Combustível R$ 20", price: "100 FC", tag: "Informativo" },
  { name: "Cashback R$ 15", price: "75 FC", tag: "Informativo" },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Olá, Jeferson! 👋
        </h1>
        <p className="text-sm text-muted-foreground">Bem-vindo ao seu painel do Ecoteiner</p>
      </div>

      {/* Stats */}
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
        {/* Featured Products */}
        <div className="lg:col-span-2 rounded-xl bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="font-semibold text-foreground">Produtos em Destaque</h2>
                <p className="text-xs text-muted-foreground">Conheça os produtos disponíveis na loja</p>
              </div>
            </div>
            <Link
              to="/loja"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredProducts.map((product) => (
              <div
                key={product.name}
                className="rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-card"
              >
                <div className="mb-3 flex h-28 items-center justify-center rounded-md bg-muted">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary tabular-nums">{product.price}</span>
                  <span className="text-xs text-muted-foreground">{product.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Eco Tip */}
        <div className="space-y-4">
          <div className="rounded-xl bg-card p-6 shadow-card">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <span className="text-muted-foreground">⚡</span> Ações Rápidas
            </h3>
            <div className="space-y-2">
              <Link
                to="/loja"
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                Ver Loja
              </Link>
              <Link
                to="/pontos"
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Pontos de Coleta
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
