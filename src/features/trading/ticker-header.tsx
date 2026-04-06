import { cn } from "@/lib/utils";
import { SymbolSelector } from "@/ui/symbol-selector";

interface TickerHeaderProps {
  price: number;
  changePct: number;
}

const OHLV = [
  { label: "O", value: "66,420.00" },
  { label: "H", value: "68,240.00" },
  { label: "L", value: "65,920.00" },
  { label: "Vol", value: "24,831 BTC" },
];

export function TickerHeader({ price, changePct }: TickerHeaderProps) {
  const isPositive = changePct >= 0;
  return (
    <div className="flex items-center gap-6 h-full">
      <SymbolSelector triggerClassName="font-mono text-base font-bold text-primary hover:text-primary/80" />
      <span className="font-mono text-xl tabular-nums font-semibold text-trading-tick-up">
        {price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </span>
      <span
        className={cn(
          "font-mono text-xs tabular-nums px-1.5 py-0.5 rounded",
          isPositive
            ? "text-trading-profit bg-trading-bid-muted"
            : "text-trading-loss bg-trading-ask-muted",
        )}
      >
        {isPositive ? "+" : ""}
        {Math.abs(changePct).toFixed(2)}%
      </span>
      <div className="flex gap-5 text-xs font-mono tabular-nums text-muted-foreground ml-2">
        {OHLV.map(({ label, value }) => (
          <span key={label}>
            {label} <span className="text-foreground">{value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
