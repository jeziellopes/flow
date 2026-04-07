import { cn } from "@/lib/utils";
import { usePricePrecision, useQtyPrecision } from "@/stores/market-data";
import { useUIStore } from "@/stores/ui";
import { DepthBar } from "@/ui/depth-bar";
import type { PriceLevel } from "./types";

interface OrderBookRowProps {
  level: PriceLevel;
  side: "bid" | "ask";
}

export function OrderBookRow({ level, side }: OrderBookRowProps) {
  const pricePrecision = usePricePrecision();
  const qtyPrecision = useQtyPrecision();
  const setSelectedPrice = useUIStore((s) => s.setSelectedPrice);
  const textColor = side === "bid" ? "text-trading-bid" : "text-trading-ask";
  const hoverBg = "hover:bg-muted";

  const handleSelect = () => setSelectedPrice(level.price);

  return (
    <button
      type="button"
      aria-label={`Select price ${level.price.toFixed(pricePrecision)}`}
      className={cn(
        `
          w-full relative grid grid-cols-3 gap-2 tabular-nums font-mono text-xs px-2 py-0.5
          overflow-x-hidden
        `,
        "cursor-pointer select-none text-left",
        hoverBg,
      )}
      onClick={handleSelect}
    >
      <DepthBar percent={level.percent} side={side} />
      <div className={cn("relative z-10 min-w-0 overflow-hidden", textColor)}>
        {level.price.toFixed(pricePrecision)}
      </div>
      <div className="relative z-10 min-w-0 overflow-hidden text-right text-muted-foreground">
        {level.quantity.toFixed(qtyPrecision)}
      </div>
      <div className="relative z-10 min-w-0 overflow-hidden text-right text-muted-foreground">
        {level.total.toFixed(qtyPrecision)}
      </div>
    </button>
  );
}
