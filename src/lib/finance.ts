export const brl = (v: number, opts: { compact?: boolean; sign?: boolean } = {}) => {
  const abs = Math.abs(v);
  const s = abs.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: opts.compact && abs >= 10000 ? "compact" : "standard",
    maximumFractionDigits: opts.compact && abs >= 10000 ? 1 : 2,
  });
  if (opts.sign) return `${v < 0 ? "−" : "+"} ${s}`;
  return v < 0 ? `−${s}` : s;
};

export const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export interface Flow {
  date: string;
  amount: number;
  kind: "income" | "expense";
}

/** Parse YYYY-MM-DD as local date (avoids UTC shift). */
export const parseDate = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, day || 1);
};

export function sumMonth(flows: Flow[], kind: Flow["kind"], year: number, month: number) {
  return flows
    .filter((f) => f.kind === kind)
    .filter((f) => {
      const d = parseDate(f.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((a, f) => a + Math.abs(f.amount), 0);
}

/** Last 12 months totals, oldest first. */
export function last12(flows: Flow[], kind: Flow["kind"], ref = new Date()) {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(ref.getFullYear(), ref.getMonth() - 11 + i, 1);
    return { label: MONTHS[d.getMonth()], value: sumMonth(flows, kind, d.getFullYear(), d.getMonth()) };
  });
}

/** Daily cumulative series for current month (sparkline). */
export function dailySeries(flows: Flow[], kind: Flow["kind"], ref = new Date()) {
  const days = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const today = ref.getDate();
  const buckets = Array(days).fill(0);
  flows
    .filter((f) => f.kind === kind)
    .forEach((f) => {
      const d = parseDate(f.date);
      if (d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()) buckets[d.getDate() - 1] += Math.abs(f.amount);
    });
  return buckets.slice(0, today).map((v, i) => ({ day: i + 1, value: v }));
}

export const pctChange = (cur: number, prev: number) => (prev === 0 ? null : ((cur - prev) / prev) * 100);
