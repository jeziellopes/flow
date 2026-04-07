import { createFileRoute, Link } from "@tanstack/react-router";
import { BalanceDisplay } from "@/features/portfolio/balance-display";
import { PositionCard } from "@/features/portfolio/position-card";
import { TradeHistoryTable } from "@/features/portfolio/trade-history-table";
import { MOCK_PORTFOLIO_STATE, MOCK_PORTFOLIO_TRADES } from "@/lib/mock-data";
import { ErrorBoundary } from "@/ui/error-boundary";

export const Route = createFileRoute("/portfolio")({ component: RouteComponent });

function RouteComponent() {
  return (
    <ErrorBoundary>
      <div className="w-full max-w-5xl mx-auto px-6 py-8 space-y-8">
        <title>Portfolio | Flow</title>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-cypher font-semibold tracking-wide text-primary">Portfolio</h1>
          <Link
            to={"/symbol/$symbol" as never}
            params={{ symbol: "BTCUSDT" } as never}
            className="text-xs font-cypher px-3 py-1.5 rounded border border-border hover:border-border/80 text-muted-foreground transition-colors"
          >
            ← Back to terminal
          </Link>
        </div>
        <div className="grid grid-cols-[240px_1fr] gap-6">
          <div className="rounded-lg border border-border p-5 bg-card">
            <BalanceDisplay
              balance={{
                total: MOCK_PORTFOLIO_STATE.totalBalance,
                available: MOCK_PORTFOLIO_STATE.availableBalance,
                unrealizedPnL: MOCK_PORTFOLIO_STATE.unrealizedPnL,
              }}
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-cypher font-medium text-muted-foreground uppercase tracking-wider">
              Open Positions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_PORTFOLIO_STATE.positions.map((pos) => (
                <PositionCard key={pos.symbol} position={pos} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-cypher font-medium text-muted-foreground uppercase tracking-wider">
            Trade History
          </h2>
          <TradeHistoryTable trades={MOCK_PORTFOLIO_TRADES} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
