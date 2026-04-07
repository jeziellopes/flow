import { cn } from "@/lib/utils";
import { usePricePrecision, useQtyPrecision } from "@/stores/market-data";
import { DepthBar } from "@/ui/depth-bar";
import type { PriceLevel } from "./types";

interface OrderBookRowProps {
  level: PriceLevel;
  side: "bid" | "ask";
}

export function OrderBookRow({ level, side }: OrderBookRowProps) {
  const pricePrecision = usePricePrecision();
  const qtyPrecision = useQtyPrecision();
  const textColor = side === "bid" ? "text-trading-bid" : "text-trading-ask";

  return (
    <div
      className={cn("relative grid grid-cols-3 gap-2 tabular-nums font-mono text-xs px-2 py-0.5")}
    >
      <DepthBar percent={level.percent} side={side} />
      <div className={cn("relative z-10", textColor)}>{level.price.toFixed(pricePrecision)}</div>
      <div className="relative z-10 text-right text-muted-foreground">
        {level.quantity.toFixed(qtyPrecision)}
      </div>
      <div className="relative z-10 text-right text-muted-foreground">
        {level.total.toFixed(qtyPrecision)}
      </div>
    </div>
  );
}
