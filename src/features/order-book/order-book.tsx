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

const COLUMN_HEADER_ROW = (
  <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
    <th className="px-2 py-1 text-left font-normal">Price</th>
    <th className="px-2 py-1 text-right font-normal">Amount</th>
    <th className="px-2 py-1 text-right font-normal">Total</th>
  </tr>
);

function OrderBookAsks() {
  const state = useOrderBookContext();
  return (
    <div
      data-testid="asks-container"
      className="flex-1 min-h-0 overflow-y-scroll flex flex-col justify-end"
    >
      <table className="w-full table-fixed" aria-label="Ask orders">
        <thead>{COLUMN_HEADER_ROW}</thead>
        <AskTable levels={state.asks} />
      </table>
    </div>
  );
}

function OrderBookBids() {
  const state = useOrderBookContext();
  return (
    <div data-testid="bids-container" className="flex-1 min-h-0 overflow-y-scroll">
      <table className="w-full table-fixed" aria-label="Bid orders">
        <thead className="sr-only">{COLUMN_HEADER_ROW}</thead>
        <BidTable levels={state.bids} />
      </table>
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
