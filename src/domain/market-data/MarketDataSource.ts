import type {
  NormalizedDepthUpdate,
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
}
