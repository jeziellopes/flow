import type { NormalizedSnapshot } from "@/domain/market-data/normalized";
import { BINANCE_REST_BASE, SNAPSHOT_DEPTH_LIMIT } from "@/lib/constants";
import { DepthSnapshotSchema } from "./schemas";

/**
 * Fetches a full L2 order book snapshot from the Binance REST API.
 * Throws on HTTP errors — callers should wrap with retry logic.
 */
export async function fetchDepthSnapshot(symbol: string): Promise<NormalizedSnapshot> {
  const url =
    `${BINANCE_REST_BASE}/api/v3/depth` +
    `?symbol=${symbol.toUpperCase()}&limit=${SNAPSHOT_DEPTH_LIMIT}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Snapshot fetch failed: ${res.status} ${res.statusText}`);
  }

  const raw: unknown = await res.json();
  const parsed = DepthSnapshotSchema.parse(raw);

  return {
    bids: parsed.bids,
    asks: parsed.asks,
    sequenceId: parsed.lastUpdateId,
  };
}
