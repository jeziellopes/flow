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

  const handleSelect = () => setSelectedPrice(level.price);

  return (
    <tr
      className="relative tabular-nums font-mono text-xs cursor-pointer select-none hover:bg-muted overflow-x-hidden"
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleSelect();
      }}
      tabIndex={0}
      aria-label={`Select price ${level.price.toFixed(pricePrecision)}`}
    >
      <td className={cn("relative z-10 px-2 py-0.5 min-w-0 overflow-hidden", textColor)}>
        {/* DepthBar is absolute-positioned; <tr className="relative"> is its containing block */}
        <DepthBar percent={level.percent} side={side} />
        {level.price.toFixed(pricePrecision)}
      </td>
      <td className="relative z-10 px-2 py-0.5 min-w-0 overflow-hidden text-right text-muted-foreground">
        {level.quantity.toFixed(qtyPrecision)}
      </td>
      <td className="relative z-10 px-2 py-0.5 min-w-0 overflow-hidden text-right text-muted-foreground">
        {level.total.toFixed(qtyPrecision)}
      </td>
    </tr>
  );
}
