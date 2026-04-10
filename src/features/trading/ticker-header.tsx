import { cn } from "@/lib/utils";
import { useLastPrice, usePriceChangePct, useTicker } from "@/stores/market-data";
import { SymbolSelector } from "@/ui/symbol-selector";

export function TickerHeader() {
  const lastPrice = useLastPrice();
  const changePct = usePriceChangePct();
  const ticker = useTicker();
  const isPositive = (changePct ?? 0) >= 0;

  const ohlv = ticker
    ? [
        {
          label: "O",
          value: Number(ticker.openPrice).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        },
        {
          label: "H",
          value: Number(ticker.highPrice).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        },
        {
          label: "L",
          value: Number(ticker.lowPrice).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        },
        {
          label: "Vol",
          value: `${Number(ticker.volume).toLocaleString("en-US", { maximumFractionDigits: 0 })} BTC`,
        },
      ]
    : null;

  return (
    <div className="flex items-center gap-6 h-full">
      <SymbolSelector triggerClassName="font-mono text-base font-bold text-primary hover:text-primary/80" />
      <span
        className={cn(
          "font-mono text-xl tabular-nums font-semibold",
          isPositive ? "text-trading-tick-up" : "text-trading-tick-down",
        )}
      >
        {lastPrice != null ? lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "—"}
      </span>
      {changePct != null && (
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
      )}
      {ohlv && (
        <div className="flex gap-5 text-xs font-mono tabular-nums text-muted-foreground ml-2">
          {ohlv.map(({ label, value }) => (
            <span key={label}>
              {label} <span className="text-foreground">{value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
