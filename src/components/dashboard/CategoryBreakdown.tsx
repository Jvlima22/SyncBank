import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Moradia", value: 3500, color: "hsl(160, 84%, 39%)" },
  { name: "Alimentação", value: 1800, color: "hsl(200, 70%, 50%)" },
  { name: "Transporte", value: 1200, color: "hsl(38, 92%, 50%)" },
  { name: "Lazer", value: 800, color: "hsl(280, 70%, 50%)" },
  { name: "Saúde", value: 600, color: "hsl(0, 84%, 60%)" },
  { name: "Outros", value: 1300, color: "hsl(220, 10%, 60%)" },
];

const total = data.reduce((acc, item) => acc + item.value, 0);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {((item.value / total) * 100).toFixed(1)}% do total
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryBreakdown() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Despesas por Categoria</h3>
          <p className="text-sm text-muted-foreground">Este mês</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between animate-fade-in"
              style={{ animationDelay: `${400 + index * 50}ms` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium tabular-nums">
                  {item.value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((item.value / total) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
