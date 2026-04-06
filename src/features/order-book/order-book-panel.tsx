import { Panel } from "@/ui/panel";
import { BookControls } from "./book-controls";
import { OrderBook } from "./order-book";
import type { ViewMode } from "./use-order-book-panel-state";
import { useOrderBookPanelState } from "./use-order-book-panel-state";

const BOOK_VIEW: Record<ViewMode, typeof OrderBook.BothView> = {
  both: OrderBook.BothView,
  bids: OrderBook.BidsView,
  asks: OrderBook.AsksView,
};

export function OrderBookPanel() {
  const { viewMode, setViewMode, tickSize, setTickSize, options, raw } = useOrderBookPanelState();

  const BookView = BOOK_VIEW[viewMode];

  return (
    <Panel title="Order Book">
      <Panel.Content noScroll>
        <BookControls.Root>
          <BookControls.ViewToggle value={viewMode} onChange={setViewMode} />
          <BookControls.GroupSelect value={tickSize} options={options} onChange={setTickSize} />
        </BookControls.Root>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {raw ? (
            <BookView state={raw} />
          ) : (
            <div className="flex flex-col gap-1 p-2" data-testid="order-book-skeleton">
              {Array.from({ length: 12 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                <div key={i} className="h-5 rounded bg-muted animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </Panel.Content>
    </Panel>
  );
}
