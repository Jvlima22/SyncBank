import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { brl, parseDate } from "@/lib/finance";
import { CategoryIcon } from "@/components/dashboard/ActivityList";

export interface SheetAccount {
  id: string;
  name: string;
  bank_name: string;
  balance: number;
}

interface Tx {
  id: string;
  description: string | null;
  category: string | null;
  amount: number;
  type: string;
  date: string;
  status: string | null;
}

export function AccountTransactionsSheet({
  account,
  onOpenChange,
}: {
  account: SheetAccount | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    setQ("");
    supabase
      .from("transactions")
      .select("id,description,category,amount,type,date,status")
      .eq("account_id", account.id)
      .order("date", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setRows((data as Tx[]) ?? []);
        setLoading(false);
      });
  }, [account]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s
      ? rows.filter((r) => `${r.description ?? ""} ${r.category ?? ""}`.toLowerCase().includes(s))
      : rows;
  }, [rows, q]);

  // agrupa por mês
  const groups = useMemo(() => {
    const m = new Map<string, Tx[]>();
    filtered.forEach((t) => {
      const k = parseDate(t.date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    });
    return [...m.entries()];
  }, [filtered]);

  const signed = (t: Tx) => (t.type === "income" ? Math.abs(t.amount) : -Math.abs(t.amount));
  const inSum = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
  const outSum = filtered.filter((t) => t.type !== "income").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <Sheet open={!!account} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col gap-0 p-0",
          isMobile ? "h-[90dvh] rounded-t-3xl" : "w-full sm:max-w-lg"
        )}
      >
        <SheetHeader className="space-y-3 border-b border-border p-5 pb-4 text-left">
          <div>
            <SheetTitle className="text-xl">{account?.bank_name}</SheetTitle>
            <SheetDescription className="truncate">{account?.name}</SheetDescription>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-secondary p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Saldo</p>
              <p className="tabular text-sm font-bold">{brl(account?.balance ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-secondary p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Entradas</p>
              <p className="tabular text-sm font-bold text-income">{brl(inSum)}</p>
            </div>
            <div className="rounded-xl bg-secondary p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Saídas</p>
              <p className="tabular text-sm font-bold text-expense">{brl(outSum)}</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar neste extrato…"
              className="h-10 rounded-full pl-9"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {rows.length === 0 ? "Nenhuma transação nesta conta ainda." : "Nada encontrado para essa busca."}
            </p>
          ) : (
            groups.map(([month, list]) => (
              <section key={month}>
                <h4 className="sticky top-0 z-10 bg-background/95 py-2 text-xs font-semibold capitalize text-muted-foreground backdrop-blur">
                  {month}
                </h4>
                <ul className="divide-y divide-border">
                  {list.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 py-3">
                      <CategoryIcon category={t.category} positive={t.type === "income"} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{t.description || "Sem descrição"}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {t.category || "Sem categoria"} ·{" "}
                          {parseDate(t.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          {t.status === "pending" && " · pendente"}
                        </p>
                      </div>
                      <span className={cn("tabular text-sm font-bold", t.type === "income" ? "text-income" : "text-expense")}>
                        {brl(signed(t), { sign: true })}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
