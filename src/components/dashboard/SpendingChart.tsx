import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", receitas: 12500, despesas: 8200 },
  { name: "Fev", receitas: 11800, despesas: 9100 },
  { name: "Mar", receitas: 14200, despesas: 8800 },
  { name: "Abr", receitas: 13500, despesas: 9500 },
  { name: "Mai", receitas: 15800, despesas: 10200 },
  { name: "Jun", receitas: 14200, despesas: 9800 },
  { name: "Jul", receitas: 16500, despesas: 11000 },
  { name: "Ago", receitas: 15200, despesas: 10500 },
  { name: "Set", receitas: 17800, despesas: 11200 },
  { name: "Out", receitas: 16500, despesas: 10800 },
  { name: "Nov", receitas: 18200, despesas: 12500 },
  { name: "Dez", receitas: 19500, despesas: 13200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name === "receitas" ? "Receitas" : "Despesas"}:{" "}
            {entry.value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SpendingChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Fluxo de Caixa</h3>
          <p className="text-sm text-muted-foreground">Receitas vs Despesas em 2024</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <span className="text-sm text-muted-foreground">Despesas</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="receitas"
              stroke="hsl(160, 84%, 39%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReceitas)"
            />
            <Area
              type="monotone"
              dataKey="despesas"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDespesas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
