import type {
  NormalizedCandle,
  NormalizedDepthUpdate,
  NormalizedKlineUpdate,
  NormalizedSnapshot,
  NormalizedTicker,
  NormalizedTrade,
} from "./normalized";
import type { ConnectionStatus } from "./types";

/**
 * Port interface for market data ingestion.
 * Current implementation: BinanceDataSource (browser → Binance).
 * Future swap: RelayDataSource (browser → relay server → Binance).
 * The stores/ layer never knows which side of this interface it's talking to.
 */
export interface MarketDataSource {
  connect(symbol: string): void;
  disconnect(): void;
  onStatusChange(cb: (status: ConnectionStatus) => void): void;

  /** Fetch a REST depth snapshot. Triggers buffered-event flush after resolving. */
  getSnapshot(symbol: string): Promise<NormalizedSnapshot>;
  onDepthUpdate(cb: (update: NormalizedDepthUpdate) => void): void;
  onTrade(cb: (trade: NormalizedTrade) => void): void;
  onTicker(cb: (ticker: NormalizedTicker) => void): void;

  /** Fetch historical OHLCV candles from REST. Returns up to `limit` candles. */
  fetchKlines(symbol: string, interval: string, limit: number): Promise<NormalizedCandle[]>;

  /** Register a callback for live kline updates from the WebSocket stream. */
  onKlineUpdate(cb: (update: NormalizedKlineUpdate) => void): void;

  /**
   * Subscribe to the @kline_<interval> WebSocket stream.
   * Call after fetchKlines() so the interval is known.
   * Reconnects the combined stream to include the kline sub-stream.
   */
  subscribeKlineStream(symbol: string, interval: string): void;
}
