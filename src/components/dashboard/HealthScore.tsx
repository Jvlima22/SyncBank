import { brl } from "@/lib/finance";

/**
 * Nota 0–10: 70% taxa de poupança (meta 20%+), 30% uso do limite dos cartões (ideal < 30%).
 */
export function computeHealth(income: number, expense: number, limitUsedPct: number | null) {
  const savingsRate = income > 0 ? (income - expense) / income : expense > 0 ? -1 : 0;
  const savingsScore = Math.max(0, Math.min(1, savingsRate / 0.2));
  const creditScore = limitUsedPct === null ? 1 : Math.max(0, Math.min(1, 1 - (limitUsedPct - 30) / 70));
  const score = income === 0 && expense === 0 ? null : (savingsScore * 0.7 + creditScore * 0.3) * 10;
  return { score, savingsRate };
}

export function HealthScore({ income, expense, limitUsedPct }: { income: number; expense: number; limitUsedPct: number | null }) {
  const { score, savingsRate } = computeHealth(income, expense, limitUsedPct);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.78; // open gauge
  const filled = score === null ? 0 : (score / 10) * arc;
  const label =
    score === null ? "Sem dados no mês" : score >= 7.5 ? "Finanças saudáveis" : score >= 5 ? "Atenção aos gastos" : "Gastos acima do ideal";

  return (
    <div className="panel flex items-center justify-between gap-4 p-5">
      <div className="min-w-0 space-y-3">
        <div>
          <h3 className="text-base font-bold">Saúde financeira</h3>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground">
            Poupança: <span className="tabular font-semibold text-foreground">{(savingsRate * 100).toFixed(0)}%</span>
            <span className="text-muted-foreground"> · meta 20%</span>
          </p>
          <p className="text-muted-foreground">
            Sobra do mês: <span className="tabular font-semibold text-foreground">{brl(income - expense)}</span>
          </p>
        </div>
      </div>
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full rotate-[130deg]">
          <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${arc} ${circ}`} />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            style={{ transition: "stroke-dasharray 800ms ease", filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.45))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-2xl font-extrabold">{score === null ? "–" : score.toFixed(1)}</span>
          <span className="text-[10px] font-medium text-muted-foreground">de 10</span>
        </div>
      </div>
    </div>
  );
}
