import { useRef, useState } from "react";
import { usePrivacy } from "@/hooks/usePrivacy";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { brl } from "@/lib/finance";

export interface BankCardData {
  id: string;
  name: string;
  brand: string | null;
  last_four_digits: string | null;
  credit_limit: number;
  current_balance: number;
  due_day: number | null;
}

const brandLabel: Record<string, string> = {
  visa: "VISA",
  mastercard: "mastercard",
  elo: "elo",
  amex: "AMEX",
  hipercard: "Hipercard",
  other: "",
};

function Chip() {
  return (
    <div className="h-8 w-11 rounded-md bg-gradient-to-br from-white/70 to-white/30 p-[3px] shadow-inner">
      <div className="grid h-full w-full grid-cols-3 gap-[2px] rounded-[4px] border border-black/10">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="rounded-[1px] bg-black/5" />
        ))}
      </div>
    </div>
  );
}

export function BankCardVisual({ cards, holder }: { cards: BankCardData[]; holder: string }) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const { mask } = usePrivacy();

  if (cards.length === 0) {
    return (
      <Link
        to="/cards"
        className="group flex aspect-[1.7/1] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Plus className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold">Adicionar cartão</span>
      </Link>
    );
  }

  const c = cards[Math.min(idx, cards.length - 1)];
  const used = Math.abs(c.current_balance || 0);
  const limit = c.credit_limit || 0;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div className="space-y-3">
      <div
        className="bank-card relative aspect-[1.7/1] w-full touch-pan-y select-none overflow-hidden rounded-2xl p-5 text-white shadow-glow sm:p-6"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || cards.length < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < 40) return;
          setIdx((i) => (dx < 0 ? (i + 1) % cards.length : (i - 1 + cards.length) % cards.length));
        }}
      >
        {/* decorative shapes */}
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rotate-12 rounded-[2.5rem] bg-white/10" />
        <div className="pointer-events-none absolute -left-12 bottom-[-4.5rem] h-44 w-64 -rotate-12 rounded-[2.5rem] bg-white/10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(255,255,255,0.18),transparent_60%)]" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <Chip />
            <span className="text-xl font-black italic tracking-tight">{brandLabel[c.brand || "other"] || c.name}</span>
          </div>

          <p className="tabular text-lg font-semibold tracking-[0.18em] sm:text-xl">
            <span className="opacity-80">••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;</span>
            {c.last_four_digits || "0000"}
          </p>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] opacity-70">Titular</p>
              <p className="truncate text-base font-bold sm:text-lg">
                {holder} <span className="text-xs font-medium opacity-75">· {c.name}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] opacity-70">Vence dia</p>
              <p className="tabular text-base font-bold sm:text-lg">{c.due_day ? String(c.due_day).padStart(2, "0") : "--"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-1">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">Limite usado</span>
            <span className="tabular font-semibold">
              {mask(brl(used))} <span className="text-muted-foreground">/ {mask(brl(limit))}</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full rounded-full", pct > 80 ? "bg-expense" : "bg-primary")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {cards.length > 1 && (
          <div className="flex gap-1.5">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => setIdx(i)}
                aria-label={`Cartão ${card.name}`}
                className={cn("h-1.5 rounded-full transition-all touch:h-2", i === idx ? "w-5 bg-primary" : "w-1.5 bg-border")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
