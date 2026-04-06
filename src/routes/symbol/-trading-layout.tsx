import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { groupingOptions } from "@/domain/market-data/book-grouping";
import { CandleChart } from "@/features/chart/candle-chart";
import { OrderBook } from "@/features/order-book/order-book";
import { useOrderBookViewState } from "@/features/order-book/use-order-book-data";
import type { OrderFormData } from "@/features/order-entry/order-form";
import { OrderForm } from "@/features/order-entry/order-form";
import { MarketTradesFeed } from "@/features/trades/market-trades-feed";
import { MyTradesFeed } from "@/features/trades/my-trades-feed";
import { DataPanel } from "@/features/trading/data-panel";
import { PortfolioSummaryWidget } from "@/features/trading/portfolio-summary-widget";
import { MOCK_PORTFOLIO_SUMMARY } from "@/lib/mock-data";
import { useBaseAsset, usePricePrecision, useTrades } from "@/stores/market-data";
import { useTerminalStore } from "@/stores/terminal-store";
import { Button } from "@/ui/button";
import { ErrorBoundary } from "@/ui/error-boundary";
import { Panel } from "@/ui/panel";
import { BREAKPOINTS, COLS, useTerminalLayout } from "./-use-trading-layout";

const TerminalGrid = lazy(() => import("@/features/trading/trading-grid"));

interface TerminalLayoutProps {
  symbol: string;
  tab?: "book" | "trades" | "depth";
  levels?: number;
}

// Leaf components — own their own store subscriptions so TerminalLayout
// never re-renders due to high-frequency market data updates.

type ViewMode = "both" | "bids" | "asks";

interface OrderBookPanelProps {
  levels: number;
}

function OrderBookPanel({ levels }: OrderBookPanelProps) {
  const pricePrecision = usePricePrecision();
  const options = groupingOptions(pricePrecision);
  const [tickSize, setTickSize] = useState<number>(options[0] ?? 1);
  const [viewMode, setViewMode] = useState<ViewMode>("both");

  const raw = useOrderBookViewState(levels, tickSize);

  const orderBookState = raw
    ? {
        ...raw,
        bids: viewMode === "asks" ? [] : raw.bids,
        asks: viewMode === "bids" ? [] : raw.asks,
      }
    : null;

  const viewModes: { mode: ViewMode; label: string; title: string }[] = [
    { mode: "both", label: "⇅", title: "Bids & Asks" },
    { mode: "asks", label: "↑", title: "Asks only" },
    { mode: "bids", label: "↓", title: "Bids only" },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel controls row */}
      <div className="flex items-center justify-between px-2 py-0.5 border-b border-border shrink-0">
        {/* View mode toggle */}
        <div className="flex items-center gap-0.5">
          {viewModes.map(({ mode, label, title }) => (
            <button
              key={mode}
              type="button"
              title={title}
              onClick={() => setViewMode(mode)}
              className={[
                "w-6 h-5 flex items-center justify-center rounded text-[11px] font-mono",
                "transition-colors cursor-pointer",
                viewMode === mode
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Price grouping selector */}
        <select
          value={tickSize}
          onChange={(e) => setTickSize(parseFloat(e.target.value))}
          className="text-[11px] font-mono bg-transparent text-muted-foreground hover:text-foreground border border-border rounded px-1 py-0.5 cursor-pointer outline-none focus:border-primary"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Book content */}
      {orderBookState ? (
        <OrderBook state={orderBookState} />
      ) : (
        <div className="flex flex-col gap-1 p-2" data-testid="order-book-skeleton">
          {Array.from({ length: 12 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            <div key={i} className="h-5 rounded bg-muted animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}

/** Leaf — owns useTrades() subscription; never causes TerminalLayout to re-render. */
function MarketTradesPanel() {
  const base = useBaseAsset();
  const trades = useTrades();
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <MarketTradesFeed symbol={base} trades={trades} />
      </div>
    </div>
  );
}

/** Leaf — owns fills subscription; never causes TerminalLayout to re-render. */
function MyTradesPanel() {
  const fills = useTerminalStore((s) => s.fills);
  return <MyTradesFeed fills={fills} />;
}

export function TerminalLayout({ symbol, tab = "book", levels = 20 }: TerminalLayoutProps) {
  const [orderSubmitting, setOrderSubmitting] = useState(false);
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

  const handleOrderSubmit = async (data: OrderFormData) => {
    setOrderSubmitting(true);
    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          void reject;
          resolve();
        }, 600);
      });
      const side = data.side === "buy" ? "Buy" : "Sell";
      const orderType = data.type === "limit" ? "Limit" : "Market";
      toast.success(`${side} ${orderType} order placed`, {
        description: `${data.quantity} @ ${data.type === "market" ? "market price" : data.price}`,
      });
    } catch (err) {
      toast.error("Order failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const botPnl = bots.reduce((sum, b) => sum + b.realizedPnl + b.unrealizedPnl, 0);
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
                <Panel title={`Order Book · ${levels}`}>
                  <Panel.Content noScroll>
                    <OrderBookPanel levels={levels} />
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="chart">
              <Panel title="Price Chart">
                <Panel.Header extra={timeframeTabs} />
                <Panel.Content noScroll>
                  <div className="flex-1 p-2 min-h-0">
                    <CandleChart key={activeTimeframe} interval={activeTimeframe} />
                  </div>
                </Panel.Content>
              </Panel>
            </div>
            <div key="order">
              <ErrorBoundary>
                <Panel title="Place Order">
                  <Panel.Content>
                    <div className="p-3">
                      <OrderForm
                        symbol={symbol}
                        onSubmit={handleOrderSubmit}
                        isLoading={orderSubmitting}
                      />
                    </div>
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="portfolio">
              <ErrorBoundary>
                <Panel title="Portfolio">
                  <Panel.Content>
                    <PortfolioSummaryWidget {...MOCK_PORTFOLIO_SUMMARY} botPnl={botPnl} />
                  </Panel.Content>
                </Panel>
              </ErrorBoundary>
            </div>
            <div key="trades">
              <ErrorBoundary>
                <Panel title="Market Trades">
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
