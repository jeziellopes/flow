import type { Order } from "@/domain/trading/types";
import { cn } from "@/lib/utils";

interface MyTradesFeedProps {
  orders: Order[];
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function MyTradesFeed({ orders }: MyTradesFeedProps) {
  if (orders.length === 0) {
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
          {orders.map((order) => {
            const isBuy = order.side === "buy";
            const color = isBuy ? "text-trading-bid" : "text-trading-ask";
            const fillPrice = Number(order.fillPrice ?? order.price);
            const ts = order.filledAt ?? order.updatedAt;
            return (
              <tr
                key={order.id}
                className="border-b border-border/40 hover:bg-muted/30 transition-colors"
              >
                <td className="px-3 py-1 text-muted-foreground">{formatTime(ts)}</td>
                <td className={cn("px-3 py-1 text-right", color)}>{fillPrice.toFixed(2)}</td>
                <td className="px-3 py-1 text-right text-muted-foreground">
                  {parseFloat(order.quantity).toFixed(4)}
                </td>
                <td className={cn("px-3 py-1 text-right uppercase font-medium", color)}>
                  {order.side}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
