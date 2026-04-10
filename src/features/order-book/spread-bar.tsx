import { cn } from "@/lib/utils";
import { usePricePrecision } from "@/stores/market-data";

interface SpreadBarProps {
  spread: { amount: number; percent: number };
  lastPrice: number;
  tickDirection?: "up" | "down" | "neutral";
}

export function SpreadBar({ spread, lastPrice, tickDirection = "neutral" }: SpreadBarProps) {
  const pricePrecision = usePricePrecision();
  const tickIcon = tickDirection === "up" ? "↑" : tickDirection === "down" ? "↓" : "–";
  const tickColor = {
    up: "text-trading-tick-up",
    down: "text-trading-tick-down",
    neutral: "text-muted-foreground",
  }[tickDirection];

  return (
    <div
      className={cn(
        `
          flex items-center justify-between px-2 py-1 text-xs font-mono text-muted-foreground
          bg-muted/40 border-y border-border
        `,
      )}
    >
      <span>
        Spread: {spread.amount.toFixed(pricePrecision)} ({spread.percent.toFixed(4)}%)
      </span>
      <span className={cn("text-foreground font-medium", tickColor)}>
        <span>{tickIcon}</span> {lastPrice.toFixed(pricePrecision)}
      </span>
    </div>
  );
}
