import { useState } from "react";
import { Search, ShoppingBag, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categories = ["Todos", "Descontos", "Vales", "Produtos Físicos"];

const products = [
  { id: 1, name: "Papelão", description: "", price: 52, tag: "Informativo", featured: true },
  { id: 2, name: "Desconto 10% Supermercado", description: "Descontos de 10% em compras acima de R$ 50", price: 50, tag: "Informativo", featured: true },
  { id: 3, name: "Vale Combustível R$ 20", description: "Vale combustível para postos parceiros", price: 100, tag: "Informativo", featured: true },
  { id: 4, name: "Ecobag Sustentável", description: "Ecobag feita com material reciclado", price: 30, tag: "Informativo", featured: true },
  { id: 5, name: "Cashback R$ 15", description: "Cashback em dinheiro", price: 75, tag: "Informativo", featured: false },
  { id: 6, name: "Kit Limpeza Eco", description: "Kit de limpeza sustentável", price: 45, tag: "Informativo", featured: false },
];

const Loja = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const featured = filtered.filter((p) => p.featured);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Loja Ecoteiner</h1>
        <p className="text-sm text-muted-foreground">
          Conheça os produtos e benefícios disponíveis. As trocas são realizadas nos pontos de coleta.
        </p>
      </div>

      {/* Balance banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-primary-foreground">
        <p className="text-sm font-medium text-primary-foreground/80">Seu saldo atual</p>
        <p className="text-2xl font-bold tabular-nums">0 Fênix Coins</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Produtos em Destaque</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Todos os Produtos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Info */}
      <div className="rounded-xl bg-accent p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-accent-foreground" />
          <div>
            <p className="font-semibold text-accent-foreground">Como funciona?</p>
            <p className="text-sm text-accent-foreground/80">
              Os produtos mostrados aqui são informativos. Para realizar trocas e ganhar Fênix Coins, visite um dos nossos pontos de coleta com seus materiais recicláveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: typeof products[0] }) => (
  <div className="group rounded-xl bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover">
    <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted">
      <ShoppingBag className="h-8 w-8 text-muted-foreground transition-transform group-hover:scale-110" />
    </div>
    <p className="text-sm font-medium text-foreground">{product.name}</p>
    {product.description && (
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
    )}
    <div className="mt-3 flex items-center justify-between">
      <span className="text-sm font-bold text-primary tabular-nums">{product.price} FC</span>
      <span className="text-xs text-muted-foreground">{product.tag}</span>
    </div>
  </div>
);

export default Loja;
