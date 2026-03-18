import { useState } from "react";
import { Search, Download, ArrowUpCircle, ArrowDownCircle, Wallet, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";

const Extrato = () => {
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [categoria, setCategoria] = useState("Todas");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Extrato de Transações</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe todas as suas movimentações de Fênix Coins
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Recebido</p>
            <p className="text-xl font-bold text-primary tabular-nums">+0 FC</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <ArrowDownCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Gasto</p>
            <p className="text-xl font-bold text-destructive tabular-nums">-0 FC</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo Atual</p>
            <p className="text-xl font-bold text-foreground tabular-nums">0 FC</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-card p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <span className="text-muted-foreground">🔍</span> Filtros
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tipo</label>
            <select
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option>Todos</option>
              <option>Recebido</option>
              <option>Gasto</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Categoria</label>
            <select
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option>Todas</option>
              <option>Reciclagem</option>
              <option>Troca</option>
              <option>Bônus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Histórico de Transações</h2>
            <p className="text-xs text-muted-foreground">0 transação(ões) encontrada(s)</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhuma transação encontrada</p>
          <p className="text-xs text-muted-foreground">Você ainda não possui transações registradas.</p>
        </div>
      </div>
    </div>
  );
};

export default Extrato;
