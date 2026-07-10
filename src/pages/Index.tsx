import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { AccountsOverview } from "@/components/dashboard/AccountsOverview";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";

const Index = () => {
  const { profile } = useProfile();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { goals } = useGoals();

  // Calcular saldo total das contas
  const totalBalance = accounts
    .filter((acc) => acc.account_type !== "credit")
    .reduce((acc, curr) => acc + (curr.balance || 0), 0);

  // Calcular receitas do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyIncome = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        t.type === "income"
      );
    })
    .reduce((acc, t) => acc + t.amount, 0);

  // Calcular despesas do mês atual
  const monthlyExpense = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        t.type === "expense"
      );
    })
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Calcular economia (receita - despesa)
  const savings = monthlyIncome - monthlyExpense;

  // Nome do mês atual
  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

  // Nome do usuário (dinâmico)
  const displayName = profile?.full_name?.split(" ")[0] || "Usuário";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold">Olá, {displayName}! 👋</h1>
          <p className="text-muted-foreground">
            Aqui está o resumo das suas finanças em {monthName}.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Saldo Total"
            value={`R$ ${totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            change={{ value: 12.5, type: "increase" }}
            icon={<Wallet className="h-6 w-6" />}
            variant="primary"
            delay={0}
          />
          <StatCard
            title={`Receitas (${monthName.charAt(0).toUpperCase() + monthName.slice(1, 3)})`}
            value={`R$ ${monthlyIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            change={{ value: 8.2, type: "increase" }}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
            delay={50}
          />
          <StatCard
            title={`Despesas (${monthName.charAt(0).toUpperCase() + monthName.slice(1, 3)})`}
            value={`R$ ${monthlyExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            change={{ value: 3.1, type: "decrease" }}
            icon={<TrendingDown className="h-6 w-6" />}
            variant="warning"
            delay={100}
          />
          <StatCard
            title="Economia"
            value={`R$ ${savings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            change={{ value: 15.3, type: savings >= 0 ? "increase" : "decrease" }}
            icon={<PiggyBank className="h-6 w-6" />}
            variant="default"
            delay={150}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SpendingChart />
          </div>
          <CategoryBreakdown />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionList />
          </div>
          <AccountsOverview />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
