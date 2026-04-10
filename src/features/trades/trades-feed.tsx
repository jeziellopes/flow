import type { NormalizedTrade } from "@/domain/market-data/normalized";
import { cn } from "@/lib/utils";

interface TradesFeedProps {
  trades: NormalizedTrade[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function TradesFeed({ trades }: TradesFeedProps) {
  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-xs text-muted-foreground font-mono">
        Waiting for data...
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <table className="w-full text-xs font-mono tabular-nums">
        <thead className="sticky top-0 bg-card border-b border-border">
          <tr className="text-muted-foreground text-left">
            {["Time", "Price", "Qty", "Side"].map((h, i) => (
              <th key={h} className={cn("px-3 py-1.5 font-medium", i >= 1 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            // isBuyerMaker=true → buyer is market maker → aggressor was a seller
            const isSell = t.isBuyerMaker;
            const sideColor = isSell ? "text-trading-ask" : "text-trading-bid";
            return (
              <tr
                key={t.id}
                className="border-b border-border/40 hover:bg-muted/30 transition-colors"
              >
                <td className="px-3 py-1 text-muted-foreground">{formatTime(t.time)}</td>
                <td className={cn("px-3 py-1 text-right", sideColor)}>
                  {parseFloat(t.price).toFixed(2)}
                </td>
                <td className="px-3 py-1 text-right text-muted-foreground">
                  {parseFloat(t.quantity).toFixed(4)}
                </td>
                <td className={cn("px-3 py-1 text-right uppercase font-medium", sideColor)}>
                  {isSell ? "sell" : "buy"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
