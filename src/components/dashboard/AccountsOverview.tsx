import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const accounts = [
  {
    id: 1,
    name: "Nubank",
    type: "Conta Corrente",
    balance: 12450.8,
    color: "bg-purple-500",
    logo: "💜",
  },
  {
    id: 2,
    name: "Inter",
    type: "Conta Corrente",
    balance: 5230.45,
    color: "bg-orange-500",
    logo: "🧡",
  },
  {
    id: 3,
    name: "Itaú",
    type: "Conta Corrente",
    balance: 8920.0,
    color: "bg-blue-600",
    logo: "💙",
  },
  {
    id: 4,
    name: "C6 Bank",
    type: "Conta Corrente",
    balance: 3150.2,
    color: "bg-gray-800",
    logo: "🖤",
  },
];

export function AccountsOverview() {
  const navigate = useNavigate();
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-slide-up" style={{ animationDelay: "250ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Minhas Contas</h3>
          <p className="text-sm text-muted-foreground">
            Saldo total:{" "}
            <span className="font-semibold text-foreground">
              {totalBalance.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/accounts")}>
          <Plus className="h-4 w-4" />
          Conectar
        </Button>
      </div>

      <div className="space-y-3">
        {accounts.map((account, index) => (
          <div
            key={account.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in cursor-pointer"
            style={{ animationDelay: `${350 + index * 50}ms` }}
            onClick={() => navigate("/accounts")}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-xl",
                account.color
              )}
            >
              {account.logo}
            </div>

            <div className="flex-1">
              <p className="font-medium">{account.name}</p>
              <p className="text-sm text-muted-foreground">{account.type}</p>
            </div>

            <p className="font-semibold tabular-nums">
              {account.balance.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button 
          className="flex items-center gap-2 w-full justify-center py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          onClick={() => navigate("/accounts")}
        >
          <Building2 className="h-4 w-4" />
          Conectar via Open Finance
        </button>
      </div>
    </div>
  );
}
