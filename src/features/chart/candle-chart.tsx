import {
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  type Time,
} from "lightweight-charts";
import { useEffect } from "react";
import type { NormalizedCandle } from "@/domain/market-data/normalized";
import { useMarketDataStore } from "@/stores/market-data";

interface CandleChartProps {
  symbol: string;
  interval?: string;
}

/**
 * Resolve a CSS custom property to an sRGB hex string safe for lightweight-charts.
 * Chrome 116+ preserves oklch in getComputedStyle, so we force sRGB via Canvas.
 */
function resolveColor(container: HTMLElement, name: string): string {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
  container.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  container.removeChild(probe);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return computed;
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

/** Convert `rgb(r, g, b)` → `rgba(r, g, b, alpha)` for grid lines. */
function withAlpha(rgb: string, alpha: number): string {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return rgb;
  return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
}

function toChartData(c: NormalizedCandle): CandlestickData<Time> {
  return { time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close };
}

export function CandleChart({ symbol, interval = "15m" }: CandleChartProps) {
  // Kick off klines fetch on mount. Component remounts via key={activeTimeframe}
  // on interval change, so this effect runs once per interval.
  useEffect(() => {
    void useMarketDataStore.getState().loadKlines(symbol, interval);
  }, [symbol, interval]);

  const chartRef = (el: HTMLDivElement | null) => {
    if (!el) return;

    const textColor = resolveColor(el, "--muted-foreground");
    const borderColor = resolveColor(el, "--border");
    // Up/down colours: body and wick use the same token — Binance pattern
    const bidColor = resolveColor(el, "--trading-bid");
    const askColor = resolveColor(el, "--trading-ask");

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 10,
      },
      grid: {
        // Grid lines use border colour at 20% opacity — visually recessive
        vertLines: { color: withAlpha(borderColor, 0.2) },
        horzLines: { color: withAlpha(borderColor, 0.2) },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor },
      timeScale: {
        borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: bidColor,
      downColor: askColor,
      // Wicks match body colour — no two-tone inconsistency
      wickUpColor: bidColor,
      wickDownColor: askColor,
      borderVisible: false,
    });

    // Seed from already-loaded klines (handles race where data arrives before mount)
    const initial = useMarketDataStore.getState().klines;
    if (initial.length > 0) {
      series.setData(initial.map(toChartData));
      chart.timeScale().fitContent();
    }

    // Subscribe to future klines updates imperatively — avoids React re-renders
    // that would recreate the chart on every state change.
    let prevKlines = initial;
    const unsub = useMarketDataStore.subscribe((state) => {
      if (state.klines === prevKlines) return;
      const newKlines = state.klines;
      prevKlines = newKlines;
      if (newKlines.length === 0) return;

      if (state.klineIsLiveTick) {
        // Only the last candle changed — use efficient point update, no scroll jump
        const last = newKlines[newKlines.length - 1];
        if (last) series.update(toChartData(last));
      } else {
        // Full REST load or new candle appended — reset series and fit view
        series.setData(newKlines.map(toChartData));
        chart.timeScale().fitContent();
      }
    });

    let fitted = false;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        chart.resize(width, height);
        if (!fitted) {
          chart.timeScale().fitContent();
          fitted = true;
        }
      }
    });
    ro.observe(el);

    return () => {
      unsub();
      ro.disconnect();
      chart.remove();
    };
  };

  return <div ref={chartRef} className="w-full h-full" />;
}
