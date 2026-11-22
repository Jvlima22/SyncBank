import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BankCardVisual } from "@/components/dashboard/BankCardVisual";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MonthlyBars } from "@/components/dashboard/MonthlyBars";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { ActivityList, ActivityItem } from "@/components/dashboard/ActivityList";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { useProfile } from "@/hooks/useProfile";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useCards } from "@/hooks/useCards";
import { useIncomes } from "@/hooks/useIncomes";
import { useAuth } from "@/contexts/AuthContext";
import { brl, dailySeries, Flow, last12, parseDate, pctChange, sumMonth } from "@/lib/finance";

const incomeLabel: Record<string, string> = {
  salary: "Salário",
  freelance: "Freelance",
  service: "Serviço",
  product_sale: "Venda",
  commission: "Comissão",
  refund: "Reembolso",
  investment: "Investimento",
  other: "Outros",
};

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { incomes } = useIncomes();
  const { goals } = useGoals();
  const { cards } = useCards();

  const now = new Date();
  const fullName = profile?.full_name || user?.email?.split("@")[0] || "você";
  const firstName = fullName.split(" ")[0];

  const { flows, activity } = useMemo(() => {
    const flows: Flow[] = [];
    const activity: ActivityItem[] = [];
    transactions.forEach((t) => {
      if (t.type === "transfer") return;
      const amt = Math.abs(t.amount);
      flows.push({ date: t.date, amount: amt, kind: t.type });
      activity.push({
        id: `t-${t.id}`,
        title: t.description || t.category || "Transação",
        subtitle: t.category || t.account || "Sem categoria",
        date: t.date,
        amount: t.type === "income" ? amt : -amt,
        category: t.category,
        method: t.method,
      });
    });
    incomes
      .filter((i: any) => i.status !== "pending")
      .forEach((i: any) => {
        const amt = Math.abs(i.amount);
        flows.push({ date: i.date, amount: amt, kind: "income" });
        activity.push({
          id: `i-${i.id}`,
          title: i.description || i.client_source || incomeLabel[i.income_type] || "Receita",
          subtitle: incomeLabel[i.income_type] || "Receita",
          date: i.date,
          amount: amt,
          category: incomeLabel[i.income_type] || null,
          method: "Receita",
        });
      });
    activity.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
    return { flows, activity };
  }, [transactions, incomes]);

  const y = now.getFullYear();
  const m = now.getMonth();
  const prev = new Date(y, m - 1, 1);
  const income = sumMonth(flows, "income", y, m);
  const expense = sumMonth(flows, "expense", y, m);
  const incomePrev = sumMonth(flows, "income", prev.getFullYear(), prev.getMonth());
  const expensePrev = sumMonth(flows, "expense", prev.getFullYear(), prev.getMonth());

  const balance = accounts.filter((a) => a.account_type !== "credit").reduce((s, a) => s + (a.balance || 0), 0);
  const activeCards = cards.filter((c) => c.is_active);
  const totalLimit = activeCards.reduce((s, c) => s + (c.credit_limit || 0), 0);
  const totalUsed = activeCards.reduce((s, c) => s + Math.abs(c.current_balance || 0), 0);
  const limitUsedPct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : null;

  const hour = now.getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Greeting */}
        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in">
          <div>
            <p className="text-sm text-muted-foreground">
              {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {greet}, {firstName} <span className="inline-block origin-[70%_70%] animate-[wave_2s_ease-in-out_1]">👋</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Saldo em contas</p>
            <p className="tabular text-2xl font-extrabold tracking-tight sm:text-3xl">{brl(balance)}</p>
          </div>
        </div>

        {/* Main grid — ref 01 */}
        <div className="grid gap-5 xl:grid-cols-[minmax(320px,380px)_1fr]">
          <div className="flex flex-col gap-5">
            <BankCardVisual cards={activeCards} holder={fullName} />
            <ActivityList items={activity.slice(0, 5)} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <KpiCard
                label="Gasto do mês"
                value={expense}
                series={dailySeries(flows, "expense", now)}
                change={pctChange(expense, expensePrev)}
                tone="expense"
                invert
              />
              <KpiCard
                label="Receita do mês"
                value={income}
                series={dailySeries(flows, "income", now)}
                change={pctChange(income, incomePrev)}
                tone="income"
              />
            </div>
            <div className="flex-1">
              <MonthlyBars data={last12(flows, "expense", now)} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <HealthScore income={income} expense={expense} limitUsedPct={limitUsedPct} />
          <GoalsProgress goals={goals} />
        </div>

        <TransactionsTable items={activity} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
