import { OrderBookRow } from "./order-book-row";
import type { PriceLevel } from "./types";

interface TableProps {
  levels: PriceLevel[];
}

export function BidTable({ levels }: TableProps) {
  return (
    <tbody>
      {levels.map((level) => (
        <OrderBookRow key={`bid-${level.price}`} level={level} side="bid" />
      ))}
    </tbody>
  );
}

export function AskTable({ levels }: TableProps) {
  // Asks arrive lowest-first (asc) — reverse so highest price is at top,
  // best ask (lowest) sits at the bottom adjacent to the spread (Binance style).
  return (
    <tbody>
      {[...levels].reverse().map((level) => (
        <OrderBookRow key={`ask-${level.price}`} level={level} side="ask" />
      ))}
    </tbody>
  );
}
