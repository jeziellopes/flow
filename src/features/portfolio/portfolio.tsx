import { BalanceDisplay } from "./balance-display";
import type { Position } from "./position-card";
import { PositionCard } from "./position-card";

interface PortfolioState {
  totalBalance: number;
  availableBalance: number;
  unrealizedPnL: number;
  positions: Position[];
}

interface PortfolioProps {
  state: PortfolioState;
}

export function Portfolio({ state }: PortfolioProps) {
  return (
    <div className="p-3 space-y-4">
      <h3 className="text-xs font-cypher font-semibold tracking-wide uppercase text-muted-foreground select-none">
        Portfolio
      </h3>
      <BalanceDisplay
        balance={{
          total: state.totalBalance,
          available: state.availableBalance,
          unrealizedPnL: state.unrealizedPnL,
        }}
      />
      <div className="flex-1 overflow-y-auto space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Positions</h3>
        {state.positions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No positions open.</p>
        ) : (
          state.positions.map((pos) => <PositionCard key={pos.symbol} position={pos} />)
        )}
      </div>
    </div>
  );
}
