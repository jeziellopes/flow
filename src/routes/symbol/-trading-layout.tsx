import { lazy, Suspense, useOptimistic, useState } from "react";
import type { Order } from "@/domain/trading/types";
import { CandleChart } from "@/features/chart/candle-chart";
import { OrderBookPanel } from "@/features/order-book";
import type { OrderFormData } from "@/features/order-entry/order-form";
import { OrderForm } from "@/features/order-entry/order-form";
import { MarketTradesFeed } from "@/features/trades/market-trades-feed";
import { MyTradesFeed } from "@/features/trades/my-trades-feed";
import { DataPanel } from "@/features/trading/data-panel";
import { PortfolioSummaryWidget } from "@/features/trading/portfolio-summary-widget";
import { useConnectionStatus, useTrades } from "@/stores/market-data";
import { useFilledOrders, usePortfolioStore } from "@/stores/portfolio";
import { useTerminalStore } from "@/stores/terminal-store";
import { Button } from "@/ui/button";
import { ErrorBoundary } from "@/ui/error-boundary";
import { Panel } from "@/ui/panel";
import { BREAKPOINTS, COLS, useTerminalLayout } from "./-use-trading-layout";

const TerminalGrid = lazy(() => import("@/features/trading/trading-grid"));

interface TerminalLayoutProps {
  symbol: string;
  tab?: "book" | "trades" | "depth";
}

/** Leaf — owns useTrades() subscription; never causes TerminalLayout to re-render. */
function MarketTradesPanel() {
  const trades = useTrades();
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <MarketTradesFeed trades={trades} />
      </div>
    </div>
  );
}

/** Leaf — owns fills subscription; never causes TerminalLayout to re-render. */
function MyTradesPanel() {
  const orders = useFilledOrders();
  return <MyTradesFeed orders={orders} />;
}

/**
 * OrderPanel — owns form submission and useOptimistic for market orders.
 * Isolated leaf: never re-renders from order book ticks.
 */
function OrderPanel({ symbol }: { symbol: string }) {
  const [submitting, setSubmitting] = useState(false);
  const connectionStatus = useConnectionStatus();
  const submitOrder = usePortfolioStore((s) => s.submitOrder);
  const filledOrders = useFilledOrders();

  // AC-4: useOptimistic — market order appears in history before store settles.
  const [, addOptimisticFill] = useOptimistic(filledOrders, (current: Order[], incoming: Order) => [
    incoming,
    ...current,
  ]);

  const handleSubmit = async (data: OrderFormData): Promise<{ error?: string } | undefined> => {
    setSubmitting(true);
    const { price, ...rest } = data;
    const orderInput = price ? { ...rest, price } : rest;

    // Show a pending entry in history immediately (before Zustand updates).
    addOptimisticFill({
      id: crypto.randomUUID(),
      clientOrderId: crypto.randomUUID(),
      symbol: orderInput.symbol,
      side: orderInput.side,
      type: orderInput.type,
      quantity: orderInput.quantity,
      filledQuantity: "0",
      price: ("price" in orderInput ? orderInput.price : undefined) ?? "0",
      status: "submitted",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    try {
      const result = await submitOrder(orderInput);
      if (!result.ok) return result.error ? { error: result.error } : {};
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Panel title="Place Order" draggable>
      <Panel.Content>
        <div className="p-3">
          <OrderForm
            symbol={symbol}
            onSubmit={handleSubmit}
            isLoading={submitting}
            isConnected={connectionStatus === "connected"}
          />
        </div>
      </Panel.Content>
    </Panel>
  );
}

export function TerminalLayout({ symbol, tab = "book" }: TerminalLayoutProps) {
  const {
    layouts,
    rowHeight,
    onBreakpointChange,
    onLayoutChange,
    onResizeStop,
    onDragStart,
    onResizeStart,
  } = useTerminalLayout();
  const bots = useTerminalStore((s) => s.bots);
  const setBotStatus = useTerminalStore((s) => s.setBotStatus);
  const [activeTimeframe, setActiveTimeframe] = useState("15m");

  const botPnl = bots.reduce((sum, b) => sum + b.realizedPnl + b.unrealizedPnl, 0);
  void botPnl; // TODO: wire to DataPanel bot summary
  const timeframeTabs = (
    <div className="flex items-center gap-1">
      {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
        <Button
          key={tf}
          intent="ghost"
          size="xs"
          type="button"
          onClick={() => setActiveTimeframe(tf)}
          className={`font-mono text-[10px] px-1.5 py-0.5 ${tf === activeTimeframe ? "text-primary bg-trading-bid-muted" : "text-muted-foreground"}`}
        >
          {tf}
        </Button>
      ))}
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="w-full pb-3 flex flex-col gap-0" data-active-tab={tab}>
        <Suspense
          fallback={
            <div className="w-full h-[600px] grid grid-cols-12 gap-2 p-3">
              {["a", "b", "c", "d", "e", "f"].map((id) => (
                <div key={id} className="col-span-4 h-[200px] rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          }
        >
          <TerminalGrid
            className="layout"
            layouts={layouts}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={rowHeight}
            margin={[8, 8]}
            draggableHandle=".cursor-move"
            onLayoutChange={onLayoutChange}
            onBreakpointChange={onBreakpointChange}
            onResizeStop={onResizeStop}
            onDragStart={onDragStart}
            onResizeStart={onResizeStart}
          >
            <div key="book">
              <ErrorBoundary>
                <OrderBookPanel />
              </ErrorBoundary>
            </div>
            <div key="chart">
              <Panel title="Price Chart" draggable>
                <Panel.Header extra={timeframeTabs} />
                <Panel.Content noScroll>
                  <div className="flex-1 p-2 min-h-0">
                    <CandleChart key={activeTimeframe} symbol={symbol} interval={activeTimeframe} />
                  </div>
                </Panel.Content>
              </Panel>
            </div>
            <div key="order">
              <ErrorBoundary>
                <OrderPanel symbol={symbol} />
              </ErrorBoundary>
            </div>
            <div key="portfolio">
              <ErrorBoundary>
                <Panel title="Portfolio" draggable>
                  <Panel.Content noScroll>
                    <PortfolioSummaryWidget botPnl={botPnl} />
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="trades">
              <ErrorBoundary>
                <Panel title="Market Trades" draggable>
                  <Panel.Content noScroll>
                    <MarketTradesPanel />
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="data">
              <ErrorBoundary>
                <DataPanel
                  bots={bots}
                  TradesFeedSlot={<MyTradesPanel />}
                  onBotStatusChange={(id, s) => setBotStatus(id, s)}
                />
              </ErrorBoundary>
            </div>
          </TerminalGrid>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
