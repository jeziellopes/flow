import { cn } from "@/lib/utils";
import { useLastPrice, usePriceChangePct, useTicker } from "@/stores/market-data";
import { SymbolSelector } from "@/ui/symbol-selector";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col px-1.5 py-0.5 rounded bg-muted/40 min-w-0 shrink-0">
      <span className="text-[11px] font-mono tabular-nums text-foreground leading-none">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mt-0.5">
        {label}
      </span>
    </div>
  );
}

/**
 * Compact ticker stat strip — sits as the chart panel title.
 * Shows symbol selector, live price, 24h change, and OHLV cards.
 */
export function TickerStatStrip() {
  const lastPrice = useLastPrice();
  const changePct = usePriceChangePct();
  const ticker = useTicker();
  const isPositive = (changePct ?? 0) >= 0;

  const fmt2 = (v: string | number) =>
    Number(v).toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div className="flex items-center gap-1 min-w-0">
      {/* Primary card: symbol selector + live price + change % */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/40 shrink-0">
        <SymbolSelector triggerClassName="font-mono text-sm font-bold text-primary hover:text-primary/80" />
        <span
          className={cn(
            "font-mono text-sm tabular-nums font-bold",
            isPositive ? "text-trading-tick-up" : "text-trading-tick-down",
          )}
        >
          {lastPrice != null ? fmt2(lastPrice) : "—"}
        </span>
        {changePct != null && (
          <span
            className={cn(
              "font-mono text-[10px] tabular-nums px-1.5 py-0.5 rounded",
              isPositive
                ? "text-trading-profit bg-trading-bid-muted"
                : "text-trading-loss bg-trading-ask-muted",
            )}
          >
            {isPositive ? "+" : ""}
            {Math.abs(changePct).toFixed(2)}%
          </span>
        )}
      </div>

      {/* OHLV stat cards — skeleton while ticker hydrates */}
      {ticker ? (
        <>
          <StatCard label="O" value={fmt2(ticker.openPrice)} />
          <StatCard label="H" value={fmt2(ticker.highPrice)} />
          <StatCard label="L" value={fmt2(ticker.lowPrice)} />
          <StatCard
            label="Vol"
            value={Number(ticker.volume).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          />
        </>
      ) : (
        <>
          {["O", "H", "L", "Vol"].map((lbl) => (
            <div
              key={lbl}
              className="flex flex-col px-1.5 py-0.5 rounded bg-muted/40 shrink-0 gap-0.5"
            >
              <div className="w-14 h-[11px] rounded bg-muted animate-pulse" />
              <div className="w-4 h-[10px] rounded bg-muted animate-pulse" />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
