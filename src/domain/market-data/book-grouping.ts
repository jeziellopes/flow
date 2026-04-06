/**
 * Price grouping — pure domain logic.
 * Aggregates raw order book levels into price buckets of a given tick size.
 * Zero dependencies on React, Zustand, or browser APIs.
 */

/**
 * Bucket a price into the nearest tick boundary (floor).
 *
 * Two strategies to avoid floating-point drift:
 *  - tickSize < 1: multiply by integer inverse (e.g. 0.1 → ×10)
 *  - tickSize ≥ 1: divide and multiply (safe for integer tick sizes)
 *
 * @example bucketPrice(100.15, 0.1) → 100.1
 * @example bucketPrice(50012,   10) → 50010
 * @example bucketPrice(50075,   50) → 50050
 */
function bucketPrice(price: number, tickSize: number): number {
  if (tickSize >= 1) {
    return Math.floor(price / tickSize) * tickSize;
  }
  const inv = Math.round(1 / tickSize);
  return Math.floor(price * inv) / inv;
}

/**
 * Group raw Map<price, qty> entries into aggregated tick-size buckets.
 * Returns sorted [bucketPrice, totalQty] pairs.
 *
 * @param map      Raw price → quantity map from the order book snapshot
 * @param tickSize Price bucket width (e.g. 0.1, 1, 10)
 * @param sortAsc  true = lowest price first (asks), false = highest first (bids)
 */
export function groupLevels(
  map: Map<string, string>,
  tickSize: number,
  sortAsc: boolean,
): [number, number][] {
  const buckets = new Map<number, number>();

  for (const [p, q] of map.entries()) {
    const qty = parseFloat(q);
    if (qty <= 0) continue;
    const price = parseFloat(p);
    const bucket = bucketPrice(price, tickSize);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + qty);
  }

  const entries = [...buckets.entries()];
  entries.sort((a, b) => (sortAsc ? a[0] - b[0] : b[0] - a[0]));
  return entries;
}

/**
 * Meaningful price grouping options for a symbol given its price precision.
 * Based on Binance-style groupings scaled to the symbol's tick size.
 *
 * Base set (precision=2, e.g. BTCUSDT): [0.1, 1, 10, 50, 100, 1000]
 * Scales by 10^(2−precision) for other precisions.
 *
 * @example groupingOptions(2) → [0.1, 1, 10, 50, 100, 1000]   (BTCUSDT)
 * @example groupingOptions(3) → [0.01, 0.1, 1, 5, 10, 100]    (ETHUSDT)
 * @example groupingOptions(0) → [10, 100, 1000, 5000, 10000, 100000]
 */
const BASE_TICKS = [0.1, 1, 10, 50, 100, 1000];

export function groupingOptions(pricePrecision: number): number[] {
  const scale = 10 ** (2 - pricePrecision);
  return BASE_TICKS.map((t) => parseFloat((t * scale).toPrecision(6)));
}
