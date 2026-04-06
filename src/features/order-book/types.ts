export interface PriceLevel {
  price: number;
  quantity: number;
  total: number;
  percent: number;
}

export interface OrderBookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  bestBid: number;
  bestAsk: number;
  lastPrice: number;
  spreadAmount: number;
  spreadPercent: number;
  connectionStatus: "connected" | "reconnecting" | "disconnected";
  lastPriceTick?: "up" | "down" | "neutral";
}
