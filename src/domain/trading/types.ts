// Pure domain types — zero external dependencies.
// Models the full OMS lifecycle so a backend swap needs no UI changes.

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";

export type OrderStatus =
  | "new"
  | "submitted"
  | "accepted"
  | "partially_filled"
  | "filled"
  | "cancelled"
  | "rejected";

export interface OrderInput {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string; // string for decimal precision
  price?: string; // required for limit orders
}

export interface Order {
  id: string;
  clientOrderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  filledQuantity: string;
  price: string; // limit price or fill price
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  filledAt?: number;
  fillPrice?: string;
  rejectReason?: string;
}

export interface Portfolio {
  balances: Record<string, string>; // { USDT: "10000", BTC: "0" }
  openOrders: Order[];
  filledOrders: Order[];
}

// ---------------------------------------------------------------------------
// OrderGateway — backend integration boundary
// LocalFillEngine implements this; a backend OMS would too.
// ---------------------------------------------------------------------------

export type OrderResult =
  | { status: "accepted"; order: Order }
  | { status: "rejected"; reason: string };

export type CancelResult =
  | { status: "cancelled"; orderId: string }
  | { status: "failed"; reason: string };

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  filledQuantity?: string;
  fillPrice?: string;
  timestamp: number;
}

export interface OrderGateway {
  submit(input: OrderInput): Promise<OrderResult>;
  cancel(orderId: string): Promise<CancelResult>;
  onOrderUpdate(cb: (update: OrderStatusUpdate) => void): void;
}
