import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  HeartPulse,
  Home,
  Popcorn,
  ShoppingBag,
  Utensils,
  Briefcase,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { brl, parseDate } from "@/lib/finance";

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  amount: number; // signed
  category: string | null;
  method?: string | null;
}

const catIcon: Record<string, typeof Receipt> = {
  Alimentação: Utensils,
  Transporte: Car,
  Moradia: Home,
  Saúde: HeartPulse,
  Entretenimento: Popcorn,
  Lazer: Popcorn,
  Compras: ShoppingBag,
  Salário: Briefcase,
  Freelance: Briefcase,
};

export function CategoryIcon({ category, positive }: { category: string | null; positive: boolean }) {
  const Icon = (category && catIcon[category]) || (positive ? ArrowDownLeft : ArrowUpRight);
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        positive ? "bg-income/10 text-income" : "bg-secondary text-foreground/70"
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
  );
}

export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <div className="panel flex h-full flex-col p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold">Últimas movimentações</h3>
        <Link to="/transactions" className="text-xs font-semibold text-primary hover:underline">
          Ver tudo
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nada por aqui ainda</p>
          <p className="max-w-[220px] text-xs text-muted-foreground">Use “Novo lançamento” no topo para registrar sua primeira movimentação.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <CategoryIcon category={t.category} positive={t.amount > 0} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.subtitle} · {parseDate(t.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <span className={cn("tabular text-sm font-bold", t.amount > 0 ? "text-income" : "text-expense")}>
                {brl(t.amount, { sign: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
