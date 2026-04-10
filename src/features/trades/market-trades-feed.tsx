import type { NormalizedTrade } from "@/domain/market-data/normalized";
import { cn } from "@/lib/utils";

interface MarketTradesFeedProps {
  trades: NormalizedTrade[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function MarketTradesFeed({ trades }: MarketTradesFeedProps) {
  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 text-xs text-muted-foreground font-mono">
        Waiting for data...
      </div>
    );
  }

  return (
    <table className="w-full text-xs font-mono tabular-nums">
      <thead className="sticky top-0 bg-card border-b border-border">
        <tr className="text-muted-foreground text-left">
          <th className="px-2 py-1 font-medium text-left">Price</th>
          <th className="px-2 py-1 font-medium text-right">Qty</th>
          <th className="px-2 py-1 font-medium text-right">Time</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => {
          // isBuyerMaker=true → buyer is market maker → aggressor was a seller
          const isSell = t.isBuyerMaker;
          const color = isSell ? "text-trading-ask" : "text-trading-bid";
          return (
            <tr key={t.id} className="border-b border-border/30">
              <td className={cn("px-2 py-0.5 text-left", color)}>
                {parseFloat(t.price).toFixed(2)}
              </td>
              <td className="px-2 py-0.5 text-right text-muted-foreground">
                {parseFloat(t.quantity).toFixed(4)}
              </td>
              <td className="px-2 py-0.5 text-right text-muted-foreground">{formatTime(t.time)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
