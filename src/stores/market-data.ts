import { create } from "zustand";
import { applyDepthUpdate, bookFromSnapshot } from "@/domain/market-data/book-sync";
import type { MarketDataSource } from "@/domain/market-data/MarketDataSource";
import type {
  NormalizedCandle,
  NormalizedDepthUpdate,
  NormalizedSnapshot,
  NormalizedTicker,
  NormalizedTrade,
} from "@/domain/market-data/normalized";
import type { ConnectionStatus, OrderBook } from "@/domain/market-data/types";
import { RING_BUFFER_SIZE } from "@/lib/constants";
import type { SymbolInfo } from "@/lib/symbols";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface MarketDataState {
  orderBook: OrderBook | null;
  trades: NormalizedTrade[];
  ticker: NormalizedTicker | null;
  klines: NormalizedCandle[];
  connectionStatus: ConnectionStatus;
  symbol: string | null;
  symbolInfo: SymbolInfo | null;
}

interface MarketDataActions {
  /** Initialise the store for a symbol — connects the data source and fetches snapshot. */
  initMarketData(source: MarketDataSource, symbol: string): Promise<void>;
  /** Disconnect and clean up. */
  teardown(source: MarketDataSource): void;
  /** Store SymbolInfo metadata (base, quote, precision, etc.) for the active symbol. */
  setSymbolInfo(info: SymbolInfo): void;
  /** Fetch historical klines for symbol+interval and store them. */
  loadKlines(symbol: string, interval: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// RAF-batched depth update queue (AC-7)
// Updates are queued and flushed at most once per animation frame.
// When the tab is backgrounded, RAF pauses but the WS keeps pushing.
// MAX_PENDING caps the queue so tab-return doesn't block the main thread.
// ---------------------------------------------------------------------------

const MAX_PENDING = 10;

// Module-level source reference — set during initMarketData, cleared on teardown.
// Not in Zustand state (not serializable). Enables loadKlines to resolve the source
// without threading it through every call site.
let _source: MarketDataSource | null = null;

let pendingUpdates: NormalizedDepthUpdate[] = [];
let rafHandle: number | null = null;

function flushDepthUpdates(): void {
  rafHandle = null;
  if (pendingUpdates.length === 0) return;
  const batch = pendingUpdates;
  pendingUpdates = [];

  useMarketDataStore.setState((state) => {
    if (state.orderBook === null) return state;
    let book = state.orderBook;
    for (const update of batch) {
      book = applyDepthUpdate(book, update);
    }
    return { orderBook: book };
  });
}

function scheduleDepthUpdate(update: NormalizedDepthUpdate): void {
  pendingUpdates.push(update);
  if (rafHandle === null) {
    rafHandle = requestAnimationFrame(flushDepthUpdates);
  }
}

// Drain stale queued updates when the tab becomes visible again.
// Without this, a backgrounded WS floods pendingUpdates[] (RAF is paused
// while hidden) and the synchronous flush on tab-return blocks the main thread.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && pendingUpdates.length > MAX_PENDING) {
      // Keep only the most recent MAX_PENDING updates — older ones are stale.
      pendingUpdates = pendingUpdates.slice(-MAX_PENDING);
    }
  });
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useMarketDataStore = create<MarketDataState & MarketDataActions>((set) => ({
  orderBook: null,
  trades: [],
  ticker: null,
  klines: [],
  connectionStatus: "disconnected",
  symbol: null,
  symbolInfo: null,

  setSymbolInfo(info) {
    set({ symbolInfo: info });
  },

  async initMarketData(source, symbol) {
    _source = source;

    // Register callbacks first so buffering starts immediately.
    source.onStatusChange((status) => {
      set({ connectionStatus: status });
    });

    source.onDepthUpdate((update) => {
      scheduleDepthUpdate(update);
    });

    source.onTrade((trade) => {
      set((state) => ({
        trades: [trade, ...state.trades].slice(0, RING_BUFFER_SIZE),
      }));
    });

    source.onTicker((ticker) => {
      set({ ticker });
    });

    set({ symbol, connectionStatus: "reconnecting" });

    // AC-1: connect (starts buffering) then immediately fetch snapshot
    source.connect(symbol);
    const snapshot: NormalizedSnapshot = await source.getSnapshot(symbol);

    set({
      orderBook: bookFromSnapshot(snapshot),
      connectionStatus: "connected",
    });
  },

  teardown(source) {
    source.disconnect();
    _source = null;
    // Cancel any pending RAF batch
    if (rafHandle !== null) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
      pendingUpdates = [];
    }
    set({
      orderBook: null,
      trades: [],
      ticker: null,
      klines: [],
      connectionStatus: "disconnected",
      symbol: null,
      symbolInfo: null,
    });
  },

  async loadKlines(symbol, interval) {
    if (!_source) return;
    try {
      const klines = await _source.fetchKlines(symbol, interval, 500);
      set({ klines });
    } catch {
      // Network failure — leave existing klines in place
    }
  },
}));

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/** Raw Map-based order book for consumer transformation. */
export function useOrderBook(): OrderBook | null {
  return useMarketDataStore((s) => s.orderBook);
}

/** Last N trades (ring buffer of RING_BUFFER_SIZE, AC-9). */
export function useTrades(): NormalizedTrade[] {
  return useMarketDataStore((s) => s.trades);
}

export function useConnectionStatus(): ConnectionStatus {
  return useMarketDataStore((s) => s.connectionStatus);
}

// ---------------------------------------------------------------------------
// Symbol metadata selectors
// ---------------------------------------------------------------------------

/** Full SymbolInfo for the active symbol (null before first navigation). */
export function useSymbol(): SymbolInfo | null {
  return useMarketDataStore((s) => s.symbolInfo);
}

/** Base asset ticker (e.g. "BTC"). Empty string while no symbol is loaded. */
export function useBaseAsset(): string {
  return useMarketDataStore((s) => s.symbolInfo?.base ?? "");
}

/** Quote asset ticker (e.g. "USDT"). */
export function useQuoteAsset(): string {
  return useMarketDataStore((s) => s.symbolInfo?.quote ?? "");
}

/** Price decimal precision for the active symbol. */
export function usePricePrecision(): number {
  return useMarketDataStore((s) => s.symbolInfo?.pricePrecision ?? 2);
}

/** Quantity decimal precision for the active symbol. */
export function useQtyPrecision(): number {
  return useMarketDataStore((s) => s.symbolInfo?.qtyPrecision ?? 4);
}

/** Best ask price (minimum ask level) as a string, or null if order book is empty. */
export function useBestAsk(): string | null {
  return useMarketDataStore((s) => {
    const book = s.orderBook;
    if (!book || book.asks.size === 0) return null;
    return String(Math.min(...[...book.asks.keys()].map(Number)));
  });
}

/** Best bid price (maximum bid level) as a string, or null if order book is empty. */
export function useBestBid(): string | null {
  return useMarketDataStore((s) => {
    const book = s.orderBook;
    if (!book || book.bids.size === 0) return null;
    return String(Math.max(...[...book.bids.keys()].map(Number)));
  });
}

/** 24-hour mini-ticker snapshot, or null before the first @miniTicker event. */
export function useTicker(): NormalizedTicker | null {
  return useMarketDataStore((s) => s.ticker);
}

/** Last traded price as a number, or null before ticker arrives. */
export function useLastPrice(): number | null {
  return useMarketDataStore((s) => (s.ticker ? Number(s.ticker.lastPrice) : null));
}

/** 24h price change percentage (computed from open/close), or null before ticker arrives. */
export function usePriceChangePct(): number | null {
  return useMarketDataStore((s) => {
    if (!s.ticker) return null;
    const open = Number(s.ticker.openPrice);
    const close = Number(s.ticker.lastPrice);
    if (open === 0) return null;
    return ((close - open) / open) * 100;
  });
}

/** Historical OHLCV candles for the active symbol. Empty array before first loadKlines call. */
export function useKlines(): NormalizedCandle[] {
  return useMarketDataStore((s) => s.klines);
}
