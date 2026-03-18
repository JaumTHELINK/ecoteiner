import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, MapPin, Receipt, LogOut, Recycle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Loja", icon: ShoppingBag, path: "/loja" },
  { label: "Pontos de Coleta", icon: MapPin, path: "/pontos" },
  { label: "Extrato", icon: Receipt, path: "/extrato" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Recycle className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">Ecoteiner</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            J
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Jeferson Iure</p>
            <p className="text-xs text-muted-foreground tabular-nums">0 Fenix Coins</p>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Link>
      </div>
    </aside>
  );
};

export default AppSidebar;
