/**
 * Price grouping — pure domain logic.
 * Aggregates raw order book levels into price buckets of a given tick size.
 * Zero dependencies on React, Zustand, or browser APIs.
 */

/**
 * Bucket a price into the nearest tick boundary (floor).
 * Uses integer rounding to avoid floating-point drift.
 *
 * @example bucketPrice(100.15, 0.1) → 100.1
 */
function bucketPrice(price: number, tickSize: number): number {
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
 * Derive the set of available grouping options for a symbol given its
 * price precision (decimal places).
 *
 * @example groupingOptions(2) → [0.1, 1, 10, 100]   (BTCUSDT)
 * @example groupingOptions(4) → [0.001, 0.01, 0.1, 1] (smaller pairs)
 */
export function groupingOptions(pricePrecision: number): number[] {
  return [1, 2, 3, 4].map((i) => parseFloat((10 ** (i - pricePrecision)).toPrecision(8)));
}
