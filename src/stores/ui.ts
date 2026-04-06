import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TradingTab = "book" | "trades" | "depth";

interface UIState {
  /** Active tab in the trading view. Source of truth is the URL search param;
   *  this store caches it for deep-tree components that can't reach the router. */
  activeTab: TradingTab;
}

interface UIActions {
  setActiveTab(tab: TradingTab): void;
  /** Sync store from router search params (called by the symbol route on mount). */
  syncFromSearch(tab: TradingTab): void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIState & UIActions>((set) => ({
  activeTab: "book",

  setActiveTab(tab) {
    set({ activeTab: tab });
  },

  syncFromSearch(tab) {
    set({ activeTab: tab });
  },
}));
