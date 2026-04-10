import { cn } from "@/lib/utils";
import { usePricePrecision, useQtyPrecision } from "@/stores/market-data";
import { useUIStore } from "@/stores/ui";
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
  const depthColor =
    side === "bid"
      ? "color-mix(in srgb, var(--trading-bid) 15%, transparent)"
      : "color-mix(in srgb, var(--trading-ask) 15%, transparent)";
  const pct = Math.max(0, Math.min(100, level.percent));

  const handleSelect = () => setSelectedPrice(level.price);

  return (
    <tr
      className="tabular-nums font-mono text-xs cursor-pointer select-none hover:bg-muted overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(to left, ${depthColor} ${pct}%, transparent ${pct}%)`,
      }}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleSelect();
      }}
      tabIndex={0}
      aria-label={`Select price ${level.price.toFixed(pricePrecision)}`}
    >
      <td className={cn("px-2 py-0.5 min-w-0 overflow-hidden", textColor)}>
        {level.price.toFixed(pricePrecision)}
      </td>
      <td className="px-2 py-0.5 min-w-0 overflow-hidden text-right text-muted-foreground">
        {level.quantity.toFixed(qtyPrecision)}
      </td>
      <td className="px-2 py-0.5 min-w-0 overflow-hidden text-right text-muted-foreground">
        {level.total.toFixed(qtyPrecision)}
      </td>
    </tr>
  );
}
