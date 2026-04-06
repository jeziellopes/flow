import { OrderBookRow } from "./order-book-row";
import type { PriceLevel } from "./types";

interface TableProps {
  levels: PriceLevel[];
}

export function BidTable({ levels }: TableProps) {
  return (
    <div className="space-y-px">
      {levels.map((level) => (
        <OrderBookRow key={`bid-${level.price}`} level={level} side="bid" />
      ))}
    </div>
  );
}

export function AskTable({ levels }: TableProps) {
  // Asks arrive lowest-first (asc) from useOrderBookViewState — nearest spread at bottom
  return (
    <div className="space-y-px">
      {levels.map((level) => (
        <OrderBookRow key={`ask-${level.price}`} level={level} side="ask" />
      ))}
    </div>
  );
}
