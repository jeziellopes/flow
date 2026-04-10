import type {
  CancelResult,
  Order,
  OrderGateway,
  OrderInput,
  OrderResult,
  OrderStatusUpdate,
} from "@/domain/trading/types";
import { useMarketDataStore } from "@/stores/market-data";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createOrder(input: OrderInput): Order {
  const now = Date.now();
  const id = crypto.randomUUID();
  return {
    id,
    clientOrderId: crypto.randomUUID(),
    symbol: input.symbol,
    side: input.side,
    type: input.type,
    quantity: input.quantity,
    filledQuantity: "0",
    price: input.price ?? "0",
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
}

function getBestBid(): string | null {
  const book = useMarketDataStore.getState().orderBook;
  if (!book || book.bids.size === 0) return null;
  const best = Math.max(...[...book.bids.keys()].map(Number));
  return best.toString();
}

function getBestAsk(): string | null {
  const book = useMarketDataStore.getState().orderBook;
  if (!book || book.asks.size === 0) return null;
  const best = Math.min(...[...book.asks.keys()].map(Number));
  return best.toString();
}

// ---------------------------------------------------------------------------
// LocalFillEngine
// ---------------------------------------------------------------------------

/**
 * Client-side OrderGateway implementation.
 *
 * - Market orders: fill immediately at current best bid/ask.
 * - Limit orders: queue and monitor live order book; fill when price crosses.
 *
 * Implements OrderGateway so a backend OMS can replace it without UI changes.
 */
export class LocalFillEngine implements OrderGateway {
  private listeners: ((u: OrderStatusUpdate) => void)[] = [];
  private pendingOrders = new Map<string, Order>();
  private unsubscribeBook: (() => void) | null = null;

  submit(input: OrderInput): Promise<OrderResult> {
    const order = createOrder(input);
    if (input.type === "market") {
      return this.fillMarket(order);
    }
    return this.queueLimit(order);
  }

  cancel(orderId: string): Promise<CancelResult> {
    if (!this.pendingOrders.has(orderId)) {
      return Promise.resolve({ status: "failed", reason: "Order not found or already filled" });
    }
    this.pendingOrders.delete(orderId);
    this.stopWatchingIfEmpty();
    return Promise.resolve({ status: "cancelled", orderId });
  }

  onOrderUpdate(cb: (update: OrderStatusUpdate) => void): void {
    this.listeners.push(cb);
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private fillMarket(order: Order): Promise<OrderResult> {
    const fillPrice = order.side === "buy" ? getBestAsk() : getBestBid();

    if (!fillPrice) {
      return Promise.resolve({ status: "rejected", reason: "No liquidity available" });
    }

    const now = Date.now();
    const filled: Order = {
      ...order,
      status: "filled",
      fillPrice,
      filledQuantity: order.quantity,
      filledAt: now,
      updatedAt: now,
    };

    this.emit({
      orderId: filled.id,
      status: "filled",
      fillPrice,
      filledQuantity: filled.quantity,
      timestamp: now,
    });

    return Promise.resolve({ status: "accepted", order: filled });
  }

  private queueLimit(order: Order): Promise<OrderResult> {
    const now = Date.now();
    const accepted: Order = { ...order, status: "accepted", updatedAt: now };
    this.pendingOrders.set(order.id, accepted);
    this.startWatching();
    // Check immediately — limit at current price fills like a market order
    this.checkLimitFills();
    return Promise.resolve({ status: "accepted", order: accepted });
  }

  private startWatching(): void {
    if (this.unsubscribeBook) return;
    this.unsubscribeBook = useMarketDataStore.subscribe((state, prev) => {
      if (state.orderBook === prev.orderBook) return;
      this.checkLimitFills();
    });
  }

  private stopWatchingIfEmpty(): void {
    if (this.pendingOrders.size === 0 && this.unsubscribeBook) {
      this.unsubscribeBook();
      this.unsubscribeBook = null;
    }
  }

  private checkLimitFills(): void {
    const bestBid = getBestBid();
    const bestAsk = getBestAsk();
    if (!bestBid && !bestAsk) return;

    for (const [id, order] of this.pendingOrders) {
      const limitPrice = Number(order.price);
      const isBuy = order.side === "buy";

      const fillPrice = isBuy
        ? bestAsk !== null && Number(bestAsk) <= limitPrice
          ? bestAsk
          : null
        : bestBid !== null && Number(bestBid) >= limitPrice
          ? bestBid
          : null;

      if (fillPrice) {
        const now = Date.now();
        this.pendingOrders.delete(id);
        this.emit({
          orderId: id,
          status: "filled",
          fillPrice,
          filledQuantity: order.quantity,
          timestamp: now,
        });
      }
    }

    this.stopWatchingIfEmpty();
  }

  private emit(update: OrderStatusUpdate): void {
    for (const cb of this.listeners) cb(update);
  }
}
