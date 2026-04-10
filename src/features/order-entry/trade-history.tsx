import type { Order } from "@/domain/trading/types";

interface TradeHistoryProps {
  orders: Order[];
}

export function TradeHistory({ orders }: TradeHistoryProps) {
  if (orders.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4 font-mono">No trade history</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono tabular-nums">
        <thead>
          <tr className="text-muted-foreground text-left border-b border-border">
            <th className="px-2 py-1.5 font-medium">Side</th>
            <th className="px-2 py-1.5 font-medium text-right">Price</th>
            <th className="px-2 py-1.5 font-medium text-right">Qty</th>
            <th className="px-2 py-1.5 font-medium text-right">Value</th>
            <th className="px-2 py-1.5 font-medium text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const fillPrice = Number(order.fillPrice ?? order.price);
            const value = fillPrice * Number(order.quantity);
            const ts = order.filledAt ?? order.updatedAt;
            const time = new Date(ts).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
            return (
              <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30">
                <td
                  className={`px-2 py-1.5 font-medium ${
                    order.side === "buy" ? "text-trading-bid" : "text-trading-ask"
                  }`}
                >
                  {order.side.toUpperCase()}
                </td>
                <td className="px-2 py-1.5 text-right text-foreground">{fillPrice.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-right text-foreground">{order.quantity}</td>
                <td className="px-2 py-1.5 text-right text-foreground">
                  {value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-2 py-1.5 text-right text-muted-foreground">{time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
