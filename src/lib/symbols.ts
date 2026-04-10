export interface SymbolInfo {
  symbol: string;
  base: string;
  quote: string;
  category: "USDT" | "BTC" | "ETH" | "BNB";
  pricePrecision: number;
  qtyPrecision: number;
}

export const SYMBOLS: SymbolInfo[] = [
  // USDT pairs
  {
    symbol: "BTCUSDT",
    base: "BTC",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 2,
    qtyPrecision: 5,
  },
  {
    symbol: "ETHUSDT",
    base: "ETH",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 2,
    qtyPrecision: 4,
  },
  {
    symbol: "BNBUSDT",
    base: "BNB",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 2,
    qtyPrecision: 3,
  },
  {
    symbol: "SOLUSDT",
    base: "SOL",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 3,
    qtyPrecision: 2,
  },
  {
    symbol: "XRPUSDT",
    base: "XRP",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 4,
    qtyPrecision: 1,
  },
  {
    symbol: "DOGEUSDT",
    base: "DOGE",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 5,
    qtyPrecision: 0,
  },
  {
    symbol: "ADAUSDT",
    base: "ADA",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 4,
    qtyPrecision: 1,
  },
  {
    symbol: "AVAXUSDT",
    base: "AVAX",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 3,
    qtyPrecision: 2,
  },
  {
    symbol: "DOTUSDT",
    base: "DOT",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 3,
    qtyPrecision: 2,
  },
  {
    symbol: "MATICUSDT",
    base: "MATIC",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 4,
    qtyPrecision: 1,
  },
  {
    symbol: "LINKUSDT",
    base: "LINK",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 3,
    qtyPrecision: 2,
  },
  {
    symbol: "UNIUSDT",
    base: "UNI",
    quote: "USDT",
    category: "USDT",
    pricePrecision: 3,
    qtyPrecision: 2,
  },
  // BTC pairs
  {
    symbol: "ETHBTC",
    base: "ETH",
    quote: "BTC",
    category: "BTC",
    pricePrecision: 6,
    qtyPrecision: 4,
  },
  {
    symbol: "BNBBTC",
    base: "BNB",
    quote: "BTC",
    category: "BTC",
    pricePrecision: 6,
    qtyPrecision: 3,
  },
  {
    symbol: "SOLBTC",
    base: "SOL",
    quote: "BTC",
    category: "BTC",
    pricePrecision: 7,
    qtyPrecision: 2,
  },
  {
    symbol: "XRPBTC",
    base: "XRP",
    quote: "BTC",
    category: "BTC",
    pricePrecision: 8,
    qtyPrecision: 1,
  },
  // ETH pairs
  {
    symbol: "BNBETH",
    base: "BNB",
    quote: "ETH",
    category: "ETH",
    pricePrecision: 5,
    qtyPrecision: 3,
  },
  {
    symbol: "SOLETH",
    base: "SOL",
    quote: "ETH",
    category: "ETH",
    pricePrecision: 6,
    qtyPrecision: 2,
  },
];

export const DEFAULT_SYMBOL = "BTCUSDT";

/** Normalizes ticker to uppercase and looks it up. Returns undefined if not found. */
export function findSymbol(symbol: string): SymbolInfo | undefined {
  return SYMBOLS.find((s) => s.symbol === symbol);
}

/** Normalizes ticker to uppercase for consistent URL handling. */
export function normalizeSymbol(ticker: string): string {
  return ticker.toUpperCase();
}

/** Returns true if the ticker (after normalization) is a supported symbol. */
export function isValidSymbol(ticker: string): boolean {
  return findSymbol(normalizeSymbol(ticker)) !== undefined;
}

export const SYMBOL_CATEGORIES = ["USDT", "BTC", "ETH", "BNB"] as const;
