import type { BotInstance, BotTrade } from "@/features/bots/types";

// ── Base prices ──────────────────────────────────────────────
export const MOCK_BASE_BTC = 67_843.5;
export const MOCK_BASE_ETH = 3_263.4;
export const MOCK_CHANGE_PCT = 2.34;

// ── Navigation ───────────────────────────────────────────────
export const MOCK_NAV = {
  balance: 10_423.7,
  dailyPnLPct: 1.43,
};

// ── Order Book ───────────────────────────────────────────────
export const MOCK_ORDER_BOOK_STATE = {
  bids: [
    { price: 67843.5, quantity: 0.842, total: 57154.4, percent: 72 },
    { price: 67840.0, quantity: 1.205, total: 81746.4, percent: 65 },
    { price: 67836.5, quantity: 2.1, total: 142456.7, percent: 55 },
    { price: 67833.0, quantity: 0.56, total: 37986.5, percent: 48 },
    { price: 67829.0, quantity: 3.42, total: 231975.2, percent: 88 },
    { price: 67825.5, quantity: 1.875, total: 127173.2, percent: 62 },
    { price: 67821.0, quantity: 0.33, total: 22380.9, percent: 28 },
    { price: 67817.5, quantity: 4.2, total: 284833.5, percent: 100 },
    { price: 67813.0, quantity: 1.05, total: 71203.7, percent: 45 },
    { price: 67809.0, quantity: 2.68, total: 181728.1, percent: 78 },
    { price: 67804.5, quantity: 0.92, total: 62380.1, percent: 38 },
    { price: 67800.0, quantity: 5.15, total: 349170.0, percent: 95 },
  ],
  asks: [
    { price: 67846.0, quantity: 0.612, total: 41522.0, percent: 42 },
    { price: 67849.5, quantity: 1.43, total: 97024.8, percent: 58 },
    { price: 67853.0, quantity: 0.275, total: 18659.6, percent: 22 },
    { price: 67856.5, quantity: 2.8, total: 189998.2, percent: 82 },
    { price: 67860.0, quantity: 1.1, total: 74646.0, percent: 50 },
    { price: 67863.5, quantity: 0.455, total: 30877.9, percent: 32 },
    { price: 67867.0, quantity: 3.6, total: 244321.2, percent: 90 },
    { price: 67870.5, quantity: 0.89, total: 60404.8, percent: 40 },
    { price: 67874.0, quantity: 1.76, total: 119458.2, percent: 68 },
    { price: 67877.5, quantity: 0.34, total: 23078.4, percent: 25 },
    { price: 67881.0, quantity: 2.1, total: 142550.1, percent: 72 },
    { price: 67884.5, quantity: 4.8, total: 325845.6, percent: 98 },
  ],
  bestBid: 67843.5,
  bestAsk: 67846.0,
  lastPrice: MOCK_BASE_BTC,
  spreadAmount: 2.5,
  spreadPercent: 0.0037,
  connectionStatus: "connected" as const,
  lastPriceTick: "up" as const,
};

// Design system preview (smaller dataset)
export const MOCK_DS_BIDS = [
  { price: 67842.5, quantity: 1.24, total: 84124.7, percent: 72 },
  { price: 67840.0, quantity: 0.85, total: 57664.0, percent: 55 },
  { price: 67838.5, quantity: 2.1, total: 142460.9, percent: 88 },
  { price: 67835.0, quantity: 0.42, total: 28490.7, percent: 28 },
];

export const MOCK_DS_ASKS = [
  { price: 67845.0, quantity: 0.92, total: 62417.4, percent: 48 },
  { price: 67847.5, quantity: 1.55, total: 105163.6, percent: 65 },
  { price: 67850.0, quantity: 3.21, total: 217798.5, percent: 100 },
  { price: 67852.5, quantity: 0.78, total: 52925.0, percent: 38 },
];

export const MOCK_DS_TRADES = [
  { time: "14:32:51", price: 67843.5, qty: 0.52, side: "buy" as const },
  { time: "14:32:49", price: 67841.0, qty: 1.2, side: "sell" as const },
  { time: "14:32:48", price: 67843.5, qty: 2.1, side: "buy" as const },
  { time: "14:32:46", price: 67840.0, qty: 0.35, side: "sell" as const },
  { time: "14:32:44", price: 67844.0, qty: 0.88, side: "buy" as const },
];

// ── Portfolio ────────────────────────────────────────────────
export const MOCK_PORTFOLIO_STATE = {
  totalBalance: 10_423.7,
  availableBalance: 4_328.5,
  unrealizedPnL: 416.1,
  positions: [
    {
      symbol: "BTCUSDT",
      quantity: 0.083,
      entryPrice: 62_540.0,
      markPrice: MOCK_BASE_BTC,
      unrealizedPnL: 441.0,
      unrealizedPnLPercent: 0.85,
    },
    {
      symbol: "ETHUSDT",
      quantity: 1.5,
      entryPrice: 3_280.0,
      markPrice: MOCK_BASE_ETH,
      unrealizedPnL: -24.9,
      unrealizedPnLPercent: -0.51,
    },
  ],
};

// ── Trades ───────────────────────────────────────────────────
export interface TerminalTrade {
  time: string;
  price: number;
  qty: number;
  side: "buy" | "sell";
  total: number;
  pnl: number;
  botId?: string;
}

export const MOCK_TERMINAL_TRADES: TerminalTrade[] = [
  {
    time: "14:32:07",
    price: 67843.5,
    qty: 0.042,
    side: "buy",
    total: 2848.83,
    pnl: 12.4,
    botId: "bot-1",
  },
  {
    time: "14:32:06",
    price: 67841.0,
    qty: 0.18,
    side: "sell",
    total: 12211.38,
    pnl: -34.2,
    botId: "bot-1",
  },
  {
    time: "14:32:05",
    price: 67844.5,
    qty: 0.012,
    side: "buy",
    total: 814.13,
    pnl: 3.1,
    botId: "bot-2",
  },
  {
    time: "14:32:04",
    price: 67840.0,
    qty: 0.56,
    side: "sell",
    total: 37990.4,
    pnl: -88.5,
    botId: "bot-2",
  },
  {
    time: "14:32:03",
    price: 67845.0,
    qty: 0.091,
    side: "buy",
    total: 6173.9,
    pnl: 21.7,
    botId: "bot-1",
  },
  {
    time: "14:32:02",
    price: 67842.5,
    qty: 0.033,
    side: "sell",
    total: 2238.8,
    pnl: -9.3,
    botId: "bot-2",
  },
  {
    time: "14:32:01",
    price: 67846.0,
    qty: 0.207,
    side: "buy",
    total: 14044.12,
    pnl: 45.8,
    botId: "bot-1",
  },
  {
    time: "14:32:00",
    price: 67839.5,
    qty: 0.115,
    side: "sell",
    total: 7801.54,
    pnl: -22.1,
    botId: "bot-2",
  },
  { time: "14:31:59", price: 67847.0, qty: 0.044, side: "buy", total: 2985.27, pnl: 8.9 },
  { time: "14:31:58", price: 67838.0, qty: 0.38, side: "sell", total: 25778.44, pnl: -61.0 },
  { time: "14:31:57", price: 67848.5, qty: 0.022, side: "buy", total: 1492.67, pnl: 4.2 },
  { time: "14:31:56", price: 67836.5, qty: 0.095, side: "sell", total: 6444.47, pnl: -18.7 },
  { time: "14:31:55", price: 67850.0, qty: 0.611, side: "buy", total: 41456.35, pnl: 103.5 },
  { time: "14:31:54", price: 67835.0, qty: 0.017, side: "sell", total: 1153.2, pnl: -5.4 },
  { time: "14:31:53", price: 67851.5, qty: 0.088, side: "buy", total: 5970.93, pnl: 17.6 },
];

export interface TradeHistory {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  price: number;
  qty: number;
  total: number;
  pnl: number;
  time: string;
}

export const MOCK_PORTFOLIO_TRADES: TradeHistory[] = [
  {
    id: "1",
    symbol: "BTCUSDT",
    side: "buy",
    price: 62_540.0,
    qty: 0.083,
    total: 5_190.82,
    pnl: 218.5,
    time: "2026-03-28 09:14",
  },
  {
    id: "2",
    symbol: "ETHUSDT",
    side: "buy",
    price: 3_280.0,
    qty: 1.5,
    total: 4_920.0,
    pnl: -54.3,
    time: "2026-03-27 14:33",
  },
  {
    id: "3",
    symbol: "BTCUSDT",
    side: "sell",
    price: 65_100.0,
    qty: 0.05,
    total: 3_255.0,
    pnl: 128.0,
    time: "2026-03-25 11:07",
  },
  {
    id: "4",
    symbol: "SOLUSDT",
    side: "buy",
    price: 148.4,
    qty: 10,
    total: 1_484.0,
    pnl: -32.1,
    time: "2026-03-22 16:50",
  },
  {
    id: "5",
    symbol: "SOLUSDT",
    side: "sell",
    price: 155.2,
    qty: 10,
    total: 1_552.0,
    pnl: 68.0,
    time: "2026-03-24 08:21",
  },
];

// ── Bots ─────────────────────────────────────────────────────
export const MOCK_BOTS: BotInstance[] = [
  {
    id: "bot-1",
    name: "Grid BTC #1",
    strategy: "grid",
    symbol: "BTCUSDT",
    status: "running",
    startedAt: Date.now() - 1000 * 60 * 60 * 3, // 3h ago
    unrealizedPnl: 84.2,
    realizedPnl: 218.5,
    tradeCount: 47,
    winCount: 33,
    entryPrice: 67200,
    currentPrice: 67843.5,
    pnlHistory: [0, 45, 38, 82, 110, 95, 148, 190, 210, 302.7],
  },
  {
    id: "bot-2",
    name: "DCA ETH #1",
    strategy: "dca",
    symbol: "ETHUSDT",
    status: "paused",
    startedAt: Date.now() - 1000 * 60 * 60 * 24, // 1d ago
    unrealizedPnl: -23.4,
    realizedPnl: 156.8,
    tradeCount: 12,
    winCount: 8,
    entryPrice: 3310,
    currentPrice: 3263.4,
    pnlHistory: [0, 30, 65, 120, 90, 110, 130, 115, 125, 133.4],
  },
  {
    id: "bot-3",
    name: "RSI SOL #1",
    strategy: "rsi",
    symbol: "SOLUSDT",
    status: "stopped",
    startedAt: Date.now() - 1000 * 60 * 60 * 48, // 2d ago
    unrealizedPnl: 0,
    realizedPnl: -41.3,
    tradeCount: 8,
    winCount: 3,
    pnlHistory: [0, 20, -5, 15, -20, -30, -15, -35, -41.3, -41.3],
  },
];

const now = Date.now();
const m = (mins: number) => now - mins * 60_000;

export const MOCK_BOT_TRADES: Record<string, BotTrade[]> = {
  "bot-1": [
    { id: "t1-1", side: "buy", price: 67100.0, qty: 0.0015, pnl: 0, executedAt: m(180) },
    { id: "t1-2", side: "sell", price: 67380.5, qty: 0.0015, pnl: 42.1, executedAt: m(162) },
    { id: "t1-3", side: "buy", price: 67200.0, qty: 0.002, pnl: 0, executedAt: m(145) },
    { id: "t1-4", side: "sell", price: 67510.0, qty: 0.002, pnl: 62.0, executedAt: m(128) },
    { id: "t1-5", side: "buy", price: 67050.0, qty: 0.0015, pnl: 0, executedAt: m(110) },
    { id: "t1-6", side: "sell", price: 67290.0, qty: 0.0015, pnl: 36.0, executedAt: m(92) },
    { id: "t1-7", side: "buy", price: 67300.0, qty: 0.0018, pnl: 0, executedAt: m(75) },
    { id: "t1-8", side: "sell", price: 67620.0, qty: 0.0018, pnl: 57.6, executedAt: m(55) },
    { id: "t1-9", side: "buy", price: 67400.0, qty: 0.0015, pnl: 0, executedAt: m(38) },
    { id: "t1-10", side: "sell", price: 67843.5, qty: 0.0015, pnl: 66.5, executedAt: m(12) },
  ],
  "bot-2": [
    { id: "t2-1", side: "buy", price: 3320.0, qty: 0.15, pnl: 0, executedAt: m(1440) },
    { id: "t2-2", side: "sell", price: 3345.0, qty: 0.15, pnl: 37.5, executedAt: m(1200) },
    { id: "t2-3", side: "buy", price: 3300.0, qty: 0.2, pnl: 0, executedAt: m(960) },
    { id: "t2-4", side: "sell", price: 3280.0, qty: 0.2, pnl: -40.0, executedAt: m(720) },
    { id: "t2-5", side: "buy", price: 3270.0, qty: 0.15, pnl: 0, executedAt: m(480) },
    { id: "t2-6", side: "sell", price: 3310.0, qty: 0.15, pnl: 60.0, executedAt: m(240) },
  ],
  "bot-3": [
    { id: "t3-1", side: "buy", price: 142.0, qty: 2.0, pnl: 0, executedAt: m(2880) },
    { id: "t3-2", side: "sell", price: 138.5, qty: 2.0, pnl: -7.0, executedAt: m(2400) },
    { id: "t3-3", side: "buy", price: 140.0, qty: 2.0, pnl: 0, executedAt: m(1920) },
    { id: "t3-4", side: "sell", price: 136.0, qty: 2.0, pnl: -8.0, executedAt: m(1440) },
    { id: "t3-5", side: "buy", price: 138.0, qty: 2.0, pnl: 0, executedAt: m(960) },
    { id: "t3-6", side: "sell", price: 134.5, qty: 2.0, pnl: -7.0, executedAt: m(480) },
  ],
};
