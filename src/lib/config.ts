import type { MarketDataSource } from "@/domain/market-data/MarketDataSource";
import { BinanceDataSource } from "@/infra/binance/BinanceDataSource";

/**
 * Module-level singleton — stores never instantiate adapters directly.
 * Swap BinanceDataSource → RelayDataSource here when the backend is ready.
 */
let _dataSource: MarketDataSource | null = null;

export function getDataSource(): MarketDataSource {
  if (_dataSource === null) {
    _dataSource = new BinanceDataSource();
  }
  return _dataSource;
}
