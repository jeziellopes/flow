import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { usePortfolioSummary } from "@/stores/portfolio";

interface StatRowProps {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
  neutral?: boolean;
}
function StatRow({ label, value, positive, negative, neutral }: StatRowProps) {
  return (
    <div>
      <p className="text-[10px] uppercase font-medium text-muted-foreground mb-0.5">{label}</p>
      <p
        className={cn(
          "text-sm font-mono tabular-nums font-semibold",
          neutral ? "" : positive ? "text-trading-profit" : negative ? "text-trading-loss" : "",
        )}
      >
        {value}
      </p>
    </div>
  );
}

interface PortfolioSummaryWidgetProps {
  botPnl: number;
}

export function PortfolioSummaryWidget({ botPnl }: PortfolioSummaryWidgetProps) {
  const { totalBalance, totalPnL, totalPnLPct } = usePortfolioSummary();

  const pnlSign = totalPnL >= 0 ? "+" : "";
  const botSign = botPnl >= 0 ? "+" : "";

  return (
    <>
      <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-3">
        <StatRow
          neutral
          label="USDT Balance"
          value={`$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        />
        <StatRow
          positive={totalPnL > 0}
          negative={totalPnL < 0}
          neutral={totalPnL === 0}
          label="Total PnL"
          value={`${pnlSign}$${totalPnL.toFixed(2)} (${pnlSign}${totalPnLPct.toFixed(2)}%)`}
        />
        <StatRow
          positive={botPnl > 0}
          negative={botPnl < 0}
          neutral={botPnl === 0}
          label="Bot P&L"
          value={`${botSign}$${botPnl.toFixed(2)}`}
        />
      </div>
      <div className="px-3 pb-2">
        <Link to="/portfolio" className="text-[11px] font-medium text-primary">
          View full portfolio →
        </Link>
      </div>
    </>
  );
}
