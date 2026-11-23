import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/finance";
import { usePrivacy } from "@/hooks/usePrivacy";

interface KpiCardProps {
  label: string;
  value: number;
  series: { day: number; value: number }[];
  change: number | null;
  tone: "income" | "expense" | "primary";
  /** For expenses, going up is bad */
  invert?: boolean;
}

export function KpiCard({ label, value, series, change, tone, invert }: KpiCardProps) {
  const id = useId().replace(/:/g, "");
  const { mask } = usePrivacy();
  const color = `hsl(var(--${tone}))`;
  const data = series.length > 1 ? series : [{ day: 0, value: 0 }, { day: 1, value: 0 }];
  const good = change === null ? null : invert ? change <= 0 : change >= 0;

  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          Este mês
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="tabular text-xl font-extrabold tracking-tight sm:text-2xl">{mask(brl(value))}</p>
        {change !== null && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold",
              good ? "text-income" : "text-expense"
            )}
          >
            {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(change).toFixed(0)}%
          </span>
        )}
      </div>
      <div className="-mx-1 mt-3 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#g${id})`}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
