import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Wallet,
  ArrowLeftRight,
  HandCoins,
  CreditCard,
  Target,
  BarChart3,
  Bell,
  Settings,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const mainItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/" },
  { icon: Wallet, label: "Contas", path: "/accounts" },
  { icon: CreditCard, label: "Cartões", path: "/cards" },
  { icon: ArrowLeftRight, label: "Transações", path: "/transactions" },
  { icon: HandCoins, label: "Receitas", path: "/income" },
  { icon: Target, label: "Metas", path: "/goals" },
  { icon: BarChart3, label: "Relatórios", path: "/reports" },
];

const settingItems = [
  { icon: Bell, label: "Notificações", path: "/notifications" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M5 9a7 7 0 0 1 12-3l2 2M19 15a7 7 0 0 1-12 3l-2-2" />
          <path d="M19 4v4h-4M5 20v-4h4" />
        </svg>
      </div>
      {!collapsed && (
        <span className="text-lg font-extrabold tracking-tight">
          SYNC<span className="text-primary">BANK</span>
        </span>
      )}
    </div>
  );
}

function NavGroup({
  title,
  items,
  collapsed,
  onNavigate,
}: {
  title: string;
  items: typeof mainItems;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
              {!collapsed && <span>{item.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const name = profile?.full_name || user?.email?.split("@")[0] || "Você";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const content = (mini: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-[72px] items-center px-5", mini ? "justify-center px-0" : "justify-between")}>
        <Logo collapsed={mini} />
        <button
          onClick={mobileOpen ? onMobileClose : onToggle}
          className={cn(
            "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
            mini && "hidden"
          )}
          aria-label="Recolher menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className={cn("flex-1 space-y-7 overflow-y-auto py-4", mini ? "px-3" : "px-4")}>
        <NavGroup title="Menu principal" items={mainItems} collapsed={mini} onNavigate={onMobileClose} />
        <NavGroup title="Ajustes" items={settingItems} collapsed={mini} onNavigate={onMobileClose} />
      </nav>

      <div className={cn("space-y-3 border-t border-sidebar-border py-4", mini ? "px-3" : "px-4")}>
        {mini ? (
          <>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex w-full justify-center rounded-xl py-2.5 text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label="Alternar tema"
            >
              <Moon className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={onToggle}
              className="flex w-full justify-center rounded-xl py-2.5 text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label="Expandir menu"
            >
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            </button>
          </>
        ) : (
          <>
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground">
              <span className="flex items-center gap-3">
                <Moon className="h-[18px] w-[18px]" />
                Modo escuro
              </span>
              <Switch checked={isDark} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-2.5">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                <p className="truncate text-xs text-primary">Conta pessoal</p>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  navigate("/auth");
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-destructive"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:block dark:bg-sidebar/80 dark:backdrop-blur-xl",
          collapsed ? "w-[84px]" : "w-64"
        )}
      >
        {content(collapsed)}
      </aside>

      {/* Mobile */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onMobileClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {content(false)}
      </aside>
    </>
  );
}
