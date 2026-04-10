export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export interface OrderBook {
  bids: Map<string, string>;
  asks: Map<string, string>;
  lastUpdateId: number;
  lastEventTime: number;
}
