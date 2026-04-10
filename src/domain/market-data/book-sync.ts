import type { NormalizedDepthUpdate, NormalizedSnapshot } from "./normalized";
import type { OrderBook } from "./types";

/**
 * Initialise an OrderBook from a REST depth snapshot.
 */
export function bookFromSnapshot(snapshot: NormalizedSnapshot): OrderBook {
  return {
    bids: new Map(snapshot.bids),
    asks: new Map(snapshot.asks),
    lastUpdateId: snapshot.sequenceId,
    lastEventTime: Date.now(),
  };
}

/**
 * Returns true if there is a sequence gap between the book and the incoming
 * update — i.e. the update's firstSequenceId is more than one step ahead of
 * the book's lastUpdateId.
 *
 * Binance rule (update procedure §2):
 *   "If U > lastUpdateId + 1, you have missed some events. Discard your local
 *    order book and restart the process from the beginning."
 *
 * Call this BEFORE applyDepthUpdate. On true, the caller must trigger a full
 * reconnect / snapshot re-fetch cycle — never silently apply the update.
 */
export function detectGap(book: OrderBook, update: NormalizedDepthUpdate): boolean {
  return update.firstSequenceId > book.lastUpdateId + 1;
}

/**
 * Merge an incremental depth update into an existing OrderBook.
 *
 * Binance sequencing rules:
 *  - Discard the event if update.lastSequenceId <= book.lastUpdateId (stale).
 *  - Price levels with quantity "0" are removed from the book.
 *
 * Returns the same reference if the update is discarded (no allocation).
 */
export function applyDepthUpdate(book: OrderBook, update: NormalizedDepthUpdate): OrderBook {
  if (update.lastSequenceId <= book.lastUpdateId) {
    return book;
  }

  const bids = new Map(book.bids);
  const asks = new Map(book.asks);

  for (const [price, qty] of update.bids) {
    if (qty === "0") {
      bids.delete(price);
    } else {
      bids.set(price, qty);
    }
  }

  for (const [price, qty] of update.asks) {
    if (qty === "0") {
      asks.delete(price);
    } else {
      asks.set(price, qty);
    }
  }

  return {
    bids,
    asks,
    lastUpdateId: update.lastSequenceId,
    lastEventTime: Date.now(),
  };
}
