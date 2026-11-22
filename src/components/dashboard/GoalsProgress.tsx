import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { brl } from "@/lib/finance";

interface G {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  status: string;
}

export function GoalsProgress({ goals }: { goals: G[] }) {
  const active = goals.filter((g) => g.status === "active").slice(0, 3);
  return (
    <div className="panel flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold">Metas</h3>
        <Link to="/goals" className="text-xs font-semibold text-primary hover:underline">
          Gerenciar
        </Link>
      </div>
      {active.length === 0 ? (
        <Link to="/goals" className="flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center text-muted-foreground hover:text-primary">
          <Target className="h-7 w-7 opacity-60" />
          <span className="text-sm font-medium">Crie sua primeira meta</span>
        </Link>
      ) : (
        <ul className="space-y-4">
          {active.map((g) => {
            const pct = g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0;
            return (
              <li key={g.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-semibold">{g.name}</span>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span className="tabular">{brl(g.current_amount)}</span>
                  <span className="tabular">{brl(g.target_amount)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
