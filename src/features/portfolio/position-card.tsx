import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/card";

export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const isProfitable = position.unrealizedPnL >= 0;
  const pnlColor = isProfitable ? "text-trading-profit" : "text-trading-loss";

  return (
    <Card className="hover:border-primary/30 transition-all duration-200">
      <CardHeader>
        <div>
          <p className="text-sm font-cypher font-medium">{position.symbol}</p>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums font-mono">
          {position.quantity.toFixed(4)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry:</span>
            <span className="tabular-nums">{position.entryPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mark:</span>
            <span className="tabular-nums">{position.markPrice.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs font-mono">
          <span className={cn("font-medium tabular-nums", pnlColor)}>
            {position.unrealizedPnL >= 0 ? "+" : ""}
            {position.unrealizedPnL.toFixed(2)}
          </span>
        </div>
        <div className={cn("text-xs font-mono font-medium tabular-nums", pnlColor)}>
          {position.unrealizedPnLPercent >= 0 ? "+" : ""}
          {position.unrealizedPnLPercent.toFixed(3)}%
        </div>
      </CardFooter>
    </Card>
  );
}
