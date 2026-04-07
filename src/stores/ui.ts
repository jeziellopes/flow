import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TradingTab = "book" | "trades" | "depth";

interface UIState {
  /** Active tab in the trading view. Source of truth is the URL search param;
   *  this store caches it for deep-tree components that can't reach the router. */
  activeTab: TradingTab;
  /** Price selected by clicking an order book row — consumed by the order form
   *  to pre-fill the limit price input. Null means no selection. */
  selectedPrice: number | null;
}

interface UIActions {
  setActiveTab(tab: TradingTab): void;
  /** Sync store from router search params (called by the symbol route on mount). */
  syncFromSearch(tab: TradingTab): void;
  /** Set by order book row click; consumed by order form. */
  setSelectedPrice(price: number | null): void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIState & UIActions>((set) => ({
  activeTab: "book",
  selectedPrice: null,

  setActiveTab(tab) {
    set({ activeTab: tab });
  },

  syncFromSearch(tab) {
    set({ activeTab: tab });
  },

  setSelectedPrice(price) {
    set({ selectedPrice: price });
  },
}));
