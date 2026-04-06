import { useMemo, useState } from "react";
import { groupingOptions } from "@/domain/market-data/book-grouping";
import { usePricePrecision } from "@/stores/market-data";
import { Panel } from "@/ui/panel";
import { Select } from "@/ui/select";
import { OrderBook } from "./order-book";
import { useOrderBookViewState } from "./use-order-book-data";

type ViewMode = "both" | "bids" | "asks";

interface OrderBookPanelProps {
  levels?: number;
}

const VIEW_MODES: { mode: ViewMode; title: string; icon: React.ReactNode }[] = [
  {
    mode: "both",
    title: "Bids & Asks",
    icon: (
      <>
        <span className="text-trading-bid">■</span>
        <span className="text-trading-ask">■</span>
      </>
    ),
  },
  {
    mode: "asks",
    title: "Asks only",
    icon: (
      <>
        <span className="text-trading-ask">■</span>
        <span className="text-trading-ask">■</span>
      </>
    ),
  },
  {
    mode: "bids",
    title: "Bids only",
    icon: (
      <>
        <span className="text-trading-bid">■</span>
        <span className="text-trading-bid">■</span>
      </>
    ),
  },
];

export function OrderBookPanel({ levels = 20 }: OrderBookPanelProps) {
  const pricePrecision = usePricePrecision();
  const options = useMemo(() => groupingOptions(pricePrecision), [pricePrecision]);
  const [tickSize, setTickSize] = useState<number>(options[0] ?? 1);
  const [prevPrecision, setPrevPrecision] = useState(pricePrecision);
  const [viewMode, setViewMode] = useState<ViewMode>("both");

  // Reset grouping synchronously during render when pricePrecision changes (symbol switch).
  // This avoids the extra useEffect render cycle and the Biome setState-in-effect warning.
  if (prevPrecision !== pricePrecision) {
    setPrevPrecision(pricePrecision);
    setTickSize(options[0] ?? 1);
  }

  const raw = useOrderBookViewState(levels, tickSize);

  return (
    <Panel title="Order Book">
      <Panel.Header
        extra={
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center gap-0.5">
              {VIEW_MODES.map(({ mode, title, icon }) => (
                <button
                  key={mode}
                  type="button"
                  title={title}
                  onClick={() => setViewMode(mode)}
                  className={[
                    "w-7 h-5 flex items-center justify-center gap-px rounded text-[9px]",
                    "transition-colors cursor-pointer",
                    viewMode === mode ? "bg-primary/15" : "text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  {icon}
                </button>
              ))}
            </div>
            {/* Price grouping selector */}
            <Select
              value={tickSize}
              onChange={(e) => setTickSize(parseFloat(e.target.value))}
              className="w-auto h-6 text-[11px] px-1 font-mono cursor-pointer"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      <Panel.Content noScroll>
        <div className="flex flex-col h-full min-h-0">
          {raw ? (
            <OrderBook state={raw}>
              <OrderBook.ConnectionBanner />
              {viewMode !== "bids" && <OrderBook.Asks />}
              <OrderBook.Spread />
              {viewMode !== "asks" && <OrderBook.Bids />}
            </OrderBook>
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
