import { cn } from "@/lib/utils";
import type { SimulatedFill } from "@/stores/terminal-store";

interface MyTradesFeedProps {
  fills: SimulatedFill[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function MyTradesFeed({ fills }: MyTradesFeedProps) {
  if (fills.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center">
        <div className="flex items-center justify-center h-16 text-xs text-muted-foreground font-mono">
          No fills yet — place an order to see your trades here.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <table className="w-full text-xs font-mono tabular-nums">
        <thead className="sticky top-0 bg-card border-b border-border">
          <tr className="text-muted-foreground text-left">
            {(["Time", "Price", "Qty", "Side"] as const).map((h, i) => (
              <th key={h} className={cn("px-3 py-1.5 font-medium", i >= 1 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fills.map((f) => {
            const isBuy = f.side === "buy";
            const color = isBuy ? "text-trading-bid" : "text-trading-ask";
            return (
              <tr
                key={f.id}
                className="border-b border-border/40 hover:bg-muted/30 transition-colors"
              >
                <td className="px-3 py-1 text-muted-foreground">{formatTime(f.time)}</td>
                <td className={cn("px-3 py-1 text-right", color)}>
                  {parseFloat(f.price).toFixed(2)}
                </td>
                <td className="px-3 py-1 text-right text-muted-foreground">
                  {parseFloat(f.quantity).toFixed(4)}
                </td>
                <td className={cn("px-3 py-1 text-right uppercase font-medium", color)}>
                  {f.side}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
