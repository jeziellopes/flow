/** Exchange-agnostic snapshot — maps to Binance lastUpdateId, or backend sequence. */
export interface NormalizedSnapshot {
  bids: [string, string][];
  asks: [string, string][];
  sequenceId: number;
}

/** Incremental depth delta. firstSequenceId / lastSequenceId map to Binance U / u. */
export interface NormalizedDepthUpdate {
  bids: [string, string][];
  asks: [string, string][];
  firstSequenceId: number;
  lastSequenceId: number;
}

export interface NormalizedTrade {
  id: string;
  price: string;
  quantity: string;
  time: number;
  isBuyerMaker: boolean;
}

/** 24-hour rolling ticker stats from the @miniTicker stream. */
export interface NormalizedTicker {
  lastPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
}

/** OHLCV candlestick. time is a Unix timestamp in seconds (lightweight-charts format). */
export interface NormalizedCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Live kline tick from the @kline_* WebSocket stream. */
export interface NormalizedKlineUpdate extends NormalizedCandle {
  /** true when the candle for this period has closed and a new one begins. */
  isClosed: boolean;
}
