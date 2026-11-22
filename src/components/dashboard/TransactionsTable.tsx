import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { brl, parseDate } from "@/lib/finance";
import { ActivityItem, CategoryIcon } from "./ActivityList";

type Filter = "all" | "income" | "expense";

export function TransactionsTable({ items }: { items: ActivityItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = useMemo(
    () => items.filter((i) => (filter === "all" ? true : filter === "income" ? i.amount > 0 : i.amount < 0)).slice(0, 8),
    [items, filter]
  );

  return (
    <div className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold">Histórico de transações</h3>
        <div className="flex rounded-full border border-border p-1 text-xs font-semibold">
          {(
            [
              ["all", "Todas"],
              ["income", "Entradas"],
              ["expense", "Saídas"],
            ] as [Filter, string][]
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "rounded-full px-3 py-1.5 transition-colors",
                filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {["Descrição", "Data", "Valor", "Forma"].map((h, i) => (
                <th key={h} className={cn("pb-3 font-medium", i >= 2 && "text-right")}>
                  <span className="inline-flex items-center gap-1">
                    {h} <ChevronDown className="h-3 w-3" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma transação {filter !== "all" && "nesse filtro"}.
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr key={t.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={t.category} positive={t.amount > 0} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{t.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="tabular py-3 text-muted-foreground">{parseDate(t.date).toLocaleDateString("pt-BR")}</td>
                  <td className={cn("tabular py-3 text-right font-bold", t.amount > 0 ? "text-income" : "text-expense")}>
                    {brl(t.amount, { sign: true })}
                  </td>
                  <td className="py-3 text-right font-medium">{t.method || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
