import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { OpenOrders } from "@/features/order-entry/open-orders";
import { TradeHistory } from "@/features/order-entry/trade-history";
import { BalanceDisplay } from "@/features/portfolio/balance-display";
import { useFilledOrders, useOpenOrders, usePortfolioStore } from "@/stores/portfolio";
import { ErrorBoundary } from "@/ui/error-boundary";

export const Route = createFileRoute("/portfolio")({ component: RouteComponent });

function RouteComponent() {
  const balances = usePortfolioStore((s) => s.balances);
  const resetPortfolio = usePortfolioStore((s) => s.resetPortfolio);
  const filledOrders = useFilledOrders();
  const openOrders = useOpenOrders();
  const [confirming, setConfirming] = useState(false);

  const usdt = Number(balances.USDT ?? 0);
  const btc = Number(balances.BTC ?? 0);

  function handleReset() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    resetPortfolio();
    setConfirming(false);
  }

  return (
    <ErrorBoundary>
      <div className="w-full max-w-5xl mx-auto px-6 py-8 space-y-8">
        <title>Portfolio | Flow</title>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-brand font-semibold tracking-wide text-primary">
            Portfolio
          </h1>
          <div className="flex items-center gap-2">
            {confirming && (
              <span className="text-xs text-trading-ask font-cypher">
                This will reset all balances and trade history.
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              onBlur={() => setConfirming(false)}
              className={
                confirming
                  ? "text-xs font-cypher px-3 py-1.5 rounded border border-trading-ask text-trading-ask hover:bg-trading-ask/10 transition-colors"
                  : "text-xs font-cypher px-3 py-1.5 rounded border border-border hover:border-border/80 text-muted-foreground transition-colors"
              }
            >
              {confirming ? "Confirm reset" : "Reset paper account"}
            </button>
            <Link
              to={"/symbol/$symbol" as never}
              params={{ symbol: "BTCUSDT" } as never}
              className="text-xs font-cypher px-3 py-1.5 rounded border border-border hover:border-border/80 text-muted-foreground transition-colors"
            >
              ← Back to terminal
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-[240px_1fr] gap-6">
          <div className="rounded-lg border border-border p-5 bg-card">
            <BalanceDisplay
              balance={{
                total: usdt,
                available: usdt,
                unrealizedPnL: 0,
              }}
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-cypher font-medium text-muted-foreground uppercase tracking-wider">
              Asset Balances
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(balances).map(([asset, amount]) => (
                <div key={asset} className="rounded-lg border border-border bg-card p-4 font-mono">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">{asset}</p>
                  <p className="text-lg tabular-nums font-semibold">
                    {asset === "USDT"
                      ? Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })
                      : `${btc.toFixed(6)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {openOrders.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-cypher font-medium text-muted-foreground uppercase tracking-wider">
              Open Orders
            </h2>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <OpenOrders />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-cypher font-medium text-muted-foreground uppercase tracking-wider">
            Trade History
          </h2>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <TradeHistory orders={filledOrders} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
