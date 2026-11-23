import { NavLink } from "react-router-dom";
import { ArrowLeftRight, CreditCard, LayoutGrid, Menu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const NEW_TX_EVENT = "syncbank:new-transaction";

const items = [
  { icon: LayoutGrid, label: "Início", path: "/" },
  { icon: ArrowLeftRight, label: "Transações", path: "/transactions" },
  null, // botão central
  { icon: CreditCard, label: "Cartões", path: "/cards" },
] as const;

/** Navegação estilo app — só no celular/tablet (abaixo de lg). */
export function BottomNav({ onMore }: { onMore: () => void }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {items.map((it, i) =>
          it === null ? (
            <div key="add" className="flex justify-center">
              <button
                onClick={() => window.dispatchEvent(new Event(NEW_TX_EVENT))}
                aria-label="Novo lançamento"
                className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow ring-4 ring-background transition-transform active:scale-95"
              >
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <NavLink
              key={it.path}
              to={it.path}
              end={it.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <it.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.3 : 1.8} />
                  {it.label}
                </>
              )}
            </NavLink>
          )
        )}
        <button
          onClick={onMore}
          className="flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground"
        >
          <Menu className="h-[22px] w-[22px]" strokeWidth={1.8} />
          Mais
        </button>
      </div>
    </nav>
  );
}
