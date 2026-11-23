import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { brl } from "@/lib/finance";

const shades = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export function MonthlyBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  const empty = max === 0;

  return (
    <div className="panel flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold">Gastos por mês</h3>
          <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          Máx. {brl(max, { compact: true })}
        </span>
      </div>

      <div className="-mx-5 mt-4 flex-1 overflow-x-auto px-5 [scrollbar-width:none]">
      <div className="relative h-full min-h-[240px] min-w-[520px]">
        {empty && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <p className="rounded-full bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground">
              Sem despesas registradas ainda
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barCategoryGap="22%">
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={52}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--secondary))", radius: 8 }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number) => [brl(v), "Gastos"]}
            />
            {!empty && (
              <ReferenceLine
                y={max}
                stroke="hsl(var(--expense))"
                strokeDasharray="5 5"
                label={{ value: "MÁX", position: "insideTopRight", fontSize: 10, fontWeight: 700, fill: "hsl(var(--foreground))" }}
              />
            )}
            <Bar dataKey="value" radius={[10, 10, 6, 6]} maxBarSize={36}>
              {data.map((d, i) => (
                <Cell key={i} fill={shades[i % 3]} fillOpacity={d.value === max && !empty ? 1 : 0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
}
