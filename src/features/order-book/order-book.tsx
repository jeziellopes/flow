import { createContext, type ReactNode, use } from "react";
import { AskTable, BidTable } from "./bid-ask-table";
import { ConnectionBanner } from "./connection-banner";
import { SpreadBar } from "./spread-bar";
import type { OrderBookState } from "./types";

export type { OrderBookState } from "./types";

interface OrderBookProps {
  state: OrderBookState;
  children?: ReactNode;
}

const OrderBookContext = createContext<OrderBookState | null>(null);

function useOrderBookContext(): OrderBookState {
  const ctx = use(OrderBookContext);
  if (!ctx) throw new Error("OrderBook sub-components must be used inside <OrderBook>");
  return ctx;
}

function OrderBookAsks() {
  const state = useOrderBookContext();
  return (
    <div
      data-testid="asks-container"
      className="flex-1 min-h-0 overflow-y-scroll flex flex-col justify-end"
    >
      <AskTable levels={state.asks} />
    </div>
  );
}

function OrderBookBids() {
  const state = useOrderBookContext();
  return (
    <div data-testid="bids-container" className="flex-1 min-h-0 overflow-y-scroll">
      <BidTable levels={state.bids} />
    </div>
  );
}

function OrderBookSpread() {
  const state = useOrderBookContext();
  return (
    <SpreadBar
      spread={{ amount: state.spreadAmount, percent: state.spreadPercent }}
      lastPrice={state.lastPrice}
      {...(state.lastPriceTick !== undefined ? { tickDirection: state.lastPriceTick } : {})}
    />
  );
}

function OrderBookConnectionBanner() {
  const state = useOrderBookContext();
  return <ConnectionBanner status={state.connectionStatus} />;
}

const defaultContent = (
  <>
    <OrderBookConnectionBanner />
    <OrderBookAsks />
    <OrderBookSpread />
    <OrderBookBids />
  </>
);

export function OrderBook({ state, children }: OrderBookProps) {
  return (
    <OrderBookContext value={state}>
      <div className="flex flex-col w-full h-full font-mono text-sm">
        {children ?? defaultContent}
      </div>
    </OrderBookContext>
  );
}

// ---------------------------------------------------------------------------
// Explicit view variants — compose sub-components, no boolean conditionals
// ---------------------------------------------------------------------------

/** Bids + Asks, spread in the middle. Default Binance-style layout. */
function OrderBookBothView({ state }: { state: OrderBookState }) {
  return (
    <OrderBook state={state}>
      <OrderBook.ConnectionBanner />
      <OrderBook.Asks />
      <OrderBook.Spread />
      <OrderBook.Bids />
    </OrderBook>
  );
}

/** Asks only — spread shown below as last-price reference. */
function OrderBookAsksView({ state }: { state: OrderBookState }) {
  return (
    <OrderBook state={state}>
      <OrderBook.ConnectionBanner />
      <OrderBook.Asks />
      <OrderBook.Spread />
    </OrderBook>
  );
}

/** Bids only — spread shown above as last-price reference. */
function OrderBookBidsView({ state }: { state: OrderBookState }) {
  return (
    <OrderBook state={state}>
      <OrderBook.ConnectionBanner />
      <OrderBook.Spread />
      <OrderBook.Bids />
    </OrderBook>
  );
}

OrderBook.Asks = OrderBookAsks;
OrderBook.Bids = OrderBookBids;
OrderBook.Spread = OrderBookSpread;
OrderBook.ConnectionBanner = OrderBookConnectionBanner;
OrderBook.BothView = OrderBookBothView;
OrderBook.AsksView = OrderBookAsksView;
OrderBook.BidsView = OrderBookBidsView;
