import { ClipboardList } from "lucide-react";
import { useOpenOrders, usePortfolioStore } from "@/stores/portfolio";
import { Button } from "@/ui/button";

export function OpenOrders() {
  const orders = useOpenOrders();
  const cancelOrder = usePortfolioStore((s) => s.cancelOrder);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 py-6 text-center">
        <ClipboardList className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="text-xs text-muted-foreground font-mono">No open orders</p>
        <p className="text-[10px] text-muted-foreground/60 font-mono">
          Place a limit order to see it here
        </p>
      </div>
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
            <th className="px-2 py-1.5 font-medium" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30">
              <td
                className={`px-2 py-1.5 font-medium ${
                  order.side === "buy" ? "text-trading-bid" : "text-trading-ask"
                }`}
              >
                {order.side.toUpperCase()}
              </td>
              <td className="px-2 py-1.5 text-right text-foreground">
                {Number(order.price).toFixed(2)}
              </td>
              <td className="px-2 py-1.5 text-right text-foreground">{order.quantity}</td>
              <td className="px-2 py-1.5 text-right">
                <Button
                  type="button"
                  intent="ghost"
                  size="xs"
                  onClick={() => cancelOrder(order.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Cancel
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
