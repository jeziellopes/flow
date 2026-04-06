import { useState } from "react";
import { groupingOptions } from "@/domain/market-data/book-grouping";
import { usePricePrecision } from "@/stores/market-data";
import type { OrderBookState } from "./types";
import { useOrderBookViewState } from "./use-order-book-data";

export type ViewMode = "both" | "bids" | "asks";

/** Number of price levels fetched per side. CSS overflow clips what doesn't fit. */
const BOOK_LEVELS = 50;

export interface OrderBookPanelState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  tickSize: number;
  setTickSize: (size: number) => void;
  options: number[];
  raw: OrderBookState | null;
}

/**
 * Encapsulates all state for the order book panel:
 * - Price precision tracking + grouping options derivation
 * - Tick size local state (reset on symbol change)
 * - View mode (both/bids/asks)
 * - Live order book data via useOrderBookViewState
 *
 * UI components (OrderBookPanel, BookControls) consume this hook's return value
 * and stay free of state management concerns.
 */
export function useOrderBookPanelState(): OrderBookPanelState {
  const pricePrecision = usePricePrecision();
  const options = groupingOptions(pricePrecision);

  const [tickSize, setTickSize] = useState<number>(options[0] ?? 1);
  const [prevPrecision, setPrevPrecision] = useState(pricePrecision);
  const [viewMode, setViewMode] = useState<ViewMode>("both");

  // Synchronous reset during render when the symbol switches (pricePrecision changes).
  // Avoids a useEffect extra cycle; React handles the synchronous re-render correctly.
  if (prevPrecision !== pricePrecision) {
    setPrevPrecision(pricePrecision);
    setTickSize(options[0] ?? 1);
  }

  const raw = useOrderBookViewState(BOOK_LEVELS, tickSize);

  return { viewMode, setViewMode, tickSize, setTickSize, options, raw };
}
