import { useRef, useState, useSyncExternalStore } from "react";
import type {
  Layout,
  LayoutItem,
  ResponsiveLayouts,
  RGLEventCallback,
} from "@/features/trading/trading-grid";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LAYOUT_KEY = "grid-layout-v13";

export const BREAKPOINTS = { xxl: 1920, xl: 1440, lg: 1200, md: 996, sm: 768 } as const;
export const COLS = { xxl: 12, xl: 12, lg: 12, md: 10, sm: 6 } as const;

// TOTAL_ROWS: max grid row units (chart h:40 + bottom h:20 = 60 fills viewport)
// CHROME_HEIGHT: navbar + ticker bar (h-12 header=48px + pb-3=12px = 60px)
const TOTAL_ROWS = 60;
const CHROME_HEIGHT = 60;
const MARGIN_Y = 8;

// chart h:40 → book 2/3 ≈ 27, trades 1/3 ≈ 13; chart h:38 → book 25, trades 13
export const DEFAULT_LAYOUTS: ResponsiveLayouts<string> = {
  xxl: [
    { i: "chart", x: 0, y: 0, w: 8, h: 40, minW: 4, minH: 20 },
    { i: "book", x: 8, y: 0, w: 2, h: 27, minW: 2, minH: 14 },
    { i: "trades", x: 8, y: 27, w: 2, h: 13, minW: 2, minH: 8 },
    { i: "order", x: 10, y: 0, w: 2, h: 40, minW: 2, minH: 20 },
    { i: "data", x: 0, y: 40, w: 10, h: 20, minW: 4, minH: 10 },
    { i: "portfolio", x: 10, y: 40, w: 2, h: 20, minW: 2, minH: 10 },
  ],
  xl: [
    { i: "chart", x: 0, y: 0, w: 8, h: 40, minW: 4, minH: 20 },
    { i: "book", x: 8, y: 0, w: 2, h: 27, minW: 2, minH: 14 },
    { i: "trades", x: 8, y: 27, w: 2, h: 13, minW: 2, minH: 8 },
    { i: "order", x: 10, y: 0, w: 2, h: 40, minW: 2, minH: 20 },
    { i: "data", x: 0, y: 40, w: 10, h: 20, minW: 4, minH: 10 },
    { i: "portfolio", x: 10, y: 40, w: 2, h: 20, minW: 2, minH: 10 },
  ],
  lg: [
    { i: "chart", x: 0, y: 0, w: 6, h: 40, minW: 4, minH: 20 },
    { i: "book", x: 6, y: 0, w: 3, h: 27, minW: 2, minH: 14 },
    { i: "trades", x: 6, y: 27, w: 3, h: 13, minW: 2, minH: 8 },
    { i: "order", x: 9, y: 0, w: 3, h: 40, minW: 2, minH: 20 },
    { i: "data", x: 0, y: 40, w: 9, h: 20, minW: 4, minH: 10 },
    { i: "portfolio", x: 9, y: 40, w: 3, h: 20, minW: 2, minH: 10 },
  ],
  md: [
    { i: "chart", x: 0, y: 0, w: 5, h: 38, minW: 4, minH: 18 },
    { i: "book", x: 5, y: 0, w: 2, h: 25, minW: 2, minH: 12 },
    { i: "trades", x: 5, y: 25, w: 2, h: 13, minW: 2, minH: 8 },
    { i: "order", x: 7, y: 0, w: 3, h: 38, minW: 2, minH: 20 },
    { i: "data", x: 0, y: 38, w: 7, h: 22, minW: 4, minH: 10 },
    { i: "portfolio", x: 7, y: 38, w: 3, h: 22, minW: 2, minH: 10 },
  ],
  sm: [
    { i: "chart", x: 0, y: 0, w: 6, h: 30, minW: 4, minH: 16 },
    { i: "book", x: 0, y: 30, w: 3, h: 20, minW: 2, minH: 12 },
    { i: "trades", x: 3, y: 30, w: 3, h: 20, minW: 2, minH: 8 },
    { i: "order", x: 0, y: 50, w: 6, h: 20, minW: 4, minH: 16 },
    { i: "data", x: 0, y: 70, w: 4, h: 20, minW: 4, minH: 10 },
    { i: "portfolio", x: 4, y: 70, w: 2, h: 20, minW: 2, minH: 10 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

/**
 * rowHeight computes the pixel height of one grid row unit.
 * Capped at 8px so large/4K viewports don't inflate row height.
 */
function calcRowHeight(windowHeight: number) {
  const available = windowHeight - CHROME_HEIGHT - (TOTAL_ROWS - 1) * MARGIN_Y;
  return Math.min(8, Math.max(1, Math.floor(available / TOTAL_ROWS)));
}

/**
 * Elastic column redistribution: chart always expands/contracts to consume
 * whatever columns remain after book and order claim their widths. The bots
 * row mirrors the same column boundary so the layout stays aligned.
 */
function redistributeLayout(layout: LayoutItem[], totalCols: number): LayoutItem[] {
  const get = (id: string) => layout.find((it) => it.i === id);
  const book = get("book");
  const order = get("order");
  const trades = get("trades");
  if (!book || !order) return layout;

  const chartW = Math.max(totalCols - book.w - order.w, 2);
  const bookX = chartW;
  const sideX = chartW + book.w;

  return layout.map((item) => {
    switch (item.i) {
      case "chart":
        return { ...item, x: 0, w: chartW };
      case "book":
        return { ...item, x: bookX };
      case "trades":
        // trades sits directly below book — same column, y = book.h
        return { ...item, x: bookX, w: book.w, y: trades ? book.h : item.y };
      case "order":
        return { ...item, x: sideX };
      case "portfolio":
        return { ...item, x: sideX, w: order.w };
      case "data":
        return { ...item, x: 0, w: Math.max(totalCols - order.w, 2) };
      default:
        return item;
    }
  });
}

function loadLayouts(): ResponsiveLayouts<string> {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    return saved ? (JSON.parse(saved) as ResponsiveLayouts<string>) : DEFAULT_LAYOUTS;
  } catch {
    return DEFAULT_LAYOUTS;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseTerminalLayoutReturn {
  layouts: ResponsiveLayouts<string>;
  rowHeight: number;
  onBreakpointChange: (bp: string) => void;
  onLayoutChange: (layout: Layout, allLayouts: Partial<Record<string, Layout>>) => void;
  onResizeStop: RGLEventCallback;
  onDragStart: () => void;
  onResizeStart: () => void;
}

export function useTerminalLayout(): UseTerminalLayoutReturn {
  const [layouts, setLayouts] = useState<ResponsiveLayouts<string>>(loadLayouts);

  const windowHeight = useSyncExternalStore(
    subscribeResize,
    () => window.innerHeight,
    () => 1080,
  );
  const rowHeight = calcRowHeight(windowHeight);

  // Only persist when the user has explicitly interacted (drag/resize).
  // onLayoutChange also fires on mount — skip that write so default layout
  // updates take effect for users who never customised the grid.
  const userModifiedRef = useRef(false);
  const currentBreakpoint = useRef<string>("xxl");

  const onBreakpointChange = (bp: string) => {
    currentBreakpoint.current = bp;
  };

  const onLayoutChange = (_layout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
    const next = allLayouts as ResponsiveLayouts<string>;
    setLayouts(next);
    if (userModifiedRef.current) {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
    }
  };

  const onResizeStop: RGLEventCallback = (layout) => {
    userModifiedRef.current = true;
    const bp = currentBreakpoint.current;
    const total = (COLS as Record<string, number>)[bp] ?? 12;
    const adapted = redistributeLayout([...layout], total);
    setLayouts((prev) => {
      const next = { ...prev, [bp]: adapted } as ResponsiveLayouts<string>;
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const onDragStart = () => {
    userModifiedRef.current = true;
  };
  const onResizeStart = () => {
    userModifiedRef.current = true;
  };

  return {
    layouts,
    rowHeight,
    onBreakpointChange,
    onLayoutChange,
    onResizeStop,
    onDragStart,
    onResizeStart,
  };
}
