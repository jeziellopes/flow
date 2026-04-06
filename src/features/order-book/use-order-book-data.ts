import { groupLevels } from "@/domain/market-data/book-grouping";
import { useMarketDataStore } from "@/stores/market-data";
import type { OrderBookState } from "./order-book";
import type { PriceLevel } from "./order-book-row";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function computeLevels(
  map: Map<string, string>,
  limit: number,
  sortAsc: boolean,
  tickSize?: number,
): PriceLevel[] {
  const raw: [number, number][] = tickSize
    ? groupLevels(map, tickSize, sortAsc)
    : (() => {
        const entries: [number, number][] = [];
        for (const [p, q] of map.entries()) {
          const qty = parseFloat(q);
          if (qty > 0) entries.push([parseFloat(p), qty]);
        }
        entries.sort((a, b) => (sortAsc ? a[0] - b[0] : b[0] - a[0]));
        return entries;
      })();

  const sliced = raw.slice(0, limit);
  const maxQty = sliced.reduce((m, [, q]) => (q > m ? q : m), 0);
  let cumTotal = 0;
  return sliced.map(([price, qty]) => {
    cumTotal += qty;
    return {
      price,
      quantity: qty,
      total: cumTotal,
      percent: maxQty > 0 ? (qty / maxQty) * 100 : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Public hook
// ---------------------------------------------------------------------------

/**
 * Derives a view-model from the raw market-data store.
 * Uses three separate primitive subscriptions to avoid infinite re-renders
 * from object-returning selectors (Zustand Object.is equality).
 * Returns null while waiting for the initial order book snapshot (loading state).
 */
export function useOrderBookViewState(levels = 20, tickSize?: number): OrderBookState | null {
  // Split subscriptions so each re-renders only when its specific slice changes
  const orderBook = useMarketDataStore((s) => s.orderBook);
  const trades = useMarketDataStore((s) => s.trades);
  const connectionStatus = useMarketDataStore((s) => s.connectionStatus);

  if (!orderBook) return null;

  // Bids sorted highest-first (desc); asks sorted lowest-first (asc)
  const bids = computeLevels(orderBook.bids, levels, false, tickSize);
  const asks = computeLevels(orderBook.asks, levels, true, tickSize);

  const bestBid = bids[0]?.price ?? 0;
  // asks sorted asc → index 0 = lowest price = best ask
  const bestAsk = asks[0]?.price ?? 0;

  const spreadAmount = Math.max(0, bestAsk - bestBid);
  const spreadPercent = bestBid > 0 ? (spreadAmount / bestBid) * 100 : 0;

  const lastPrice = trades[0] ? parseFloat(trades[0].price) : bestBid;
  const prevPrice = trades[1] ? parseFloat(trades[1].price) : lastPrice;
  const lastPriceTick: "up" | "down" | "neutral" =
    lastPrice > prevPrice ? "up" : lastPrice < prevPrice ? "down" : "neutral";

  return {
    bids,
    asks,
    bestBid,
    bestAsk,
    lastPrice,
    spreadAmount,
    spreadPercent,
    connectionStatus,
    lastPriceTick,
  };
}
