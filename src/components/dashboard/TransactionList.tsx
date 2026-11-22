import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Smartphone,
  Utensils,
  Briefcase,
  Gift,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  shopping: ShoppingCart,
  food: Coffee,
  transport: Car,
  housing: Home,
  tech: Smartphone,
  restaurant: Utensils,
  work: Briefcase,
  gift: Gift,
};

const transactions = [
  {
    id: 1,
    description: "Mercado Livre",
    category: "shopping",
    amount: -259.9,
    date: "Hoje, 14:32",
    type: "pix",
    account: "Nubank",
  },
  {
    id: 2,
    description: "Salário - Empresa XYZ",
    category: "work",
    amount: 8500.0,
    date: "Hoje, 09:00",
    type: "ted",
    account: "Itaú",
  },
  {
    id: 3,
    description: "Uber",
    category: "transport",
    amount: -32.5,
    date: "Ontem, 22:15",
    type: "debito",
    account: "Nubank",
  },
  {
    id: 4,
    description: "iFood - Restaurante",
    category: "restaurant",
    amount: -89.9,
    date: "Ontem, 20:45",
    type: "credito",
    account: "Inter",
  },
  {
    id: 5,
    description: "Freelance - Design",
    category: "work",
    amount: 2500.0,
    date: "18 Dez, 15:00",
    type: "pix",
    account: "Nubank",
  },
  {
    id: 6,
    description: "Netflix",
    category: "tech",
    amount: -55.9,
    date: "17 Dez, 08:00",
    type: "debito",
    account: "Inter",
  },
];

export function TransactionList() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Transações Recentes</h3>
        <button 
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => navigate("/transactions")}
        >
          Ver todas
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction, index) => {
          const Icon = categoryIcons[transaction.category] || ShoppingCart;
          const isIncome = transaction.amount > 0;

          return (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-secondary/50 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${300 + index * 50}ms` }}
              onClick={() => navigate("/transactions")}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  isIncome ? "bg-success/10" : "bg-secondary"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isIncome ? "text-success" : "text-muted-foreground"
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{transaction.description}</p>
                  <span className="flex-shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                    {transaction.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{transaction.account}</span>
                  <span>•</span>
                  <span>{transaction.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isIncome ? (
                  <ArrowDownLeft className="h-4 w-4 text-success" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    isIncome ? "text-success" : "text-foreground"
                  )}
                >
                  {isIncome ? "+" : ""}
                  {transaction.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
