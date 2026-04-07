import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorBoundary } from "@/ui/error-boundary";

// biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
export const Route = createFileRoute("/" as any)({
  component: LandingPage,
});

const STATUS = [
  { label: "Design system", note: "5 themes × 3 modes, WCAG enforced", done: true },
  { label: "Order book UI", note: "Bid/ask depth, spread, tick animation", done: true },
  { label: "Order entry form", note: "Market + limit, Zod validation", done: true },
  { label: "Portfolio components", note: "Balances, positions, PnL", done: true },
  { label: "WebSocket data layer", note: "Binance depth + trades streams", done: false },
  { label: "Symbol routing", note: "Typed params, URL search state", done: false },
  { label: "Depth chart", note: "Lightweight Charts integration", done: false },
  { label: "Simulated order fills", note: "Paper trading against live prices", done: false },
] as const;

const STACK = [
  ["React 19.2", "React Compiler — zero manual memo"],
  ["Vite 8", "Rolldown + Oxc — sub-second HMR"],
  ["TanStack Router", "Type-safe file-based routing"],
  ["Zustand", "Granular streaming state"],
  ["Tailwind CSS 4", "CSS-first design tokens"],
  ["Vitest", "103 tests, 195 contrast pairs"],
] as const;

export default function LandingPage() {
  return (
    <ErrorBoundary>
      <div className="w-full max-w-4xl mx-auto px-6 py-20 flex flex-col gap-16">
        <title>Home | Flow</title>
        {/* Hero */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--trading-connected)" }}
            />
            <span
              className="font-mono text-xs tracking-widest uppercase"
              style={{ color: "var(--trading-connected)" }}
            >
              Build in public · Active development
            </span>
          </div>

          <h1
            className="font-cypher text-5xl font-bold leading-tight"
            style={{ color: "var(--primary)" }}
          >
            Flow
          </h1>

          <p className="text-lg max-w-xl" style={{ color: "var(--color-muted-foreground)" }}>
            A real-time crypto trading terminal simulator. Live Binance market data, 60fps
            rendering, zero manual memoization. Portfolio project demonstrating React 19.2 + Vite 8
            + WebSocket data handling.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link
              // biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
              to={"/symbol/$symbol" as any}
              // biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
              params={{ symbol: "BTCUSDT" } as any}
              className="px-5 py-2.5 rounded font-mono text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Open Terminal →
            </Link>
            <Link
              // biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
              to={"/design-system" as any}
              className="px-5 py-2.5 rounded font-mono text-sm font-medium border transition-colors"
              style={{
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
            >
              Design System
            </Link>
          </div>
        </section>

        <div className="h-px" style={{ backgroundColor: "var(--color-border)" }} />

        {/* Build status */}
        <section className="flex flex-col gap-6">
          <h2
            className="font-cypher text-sm uppercase tracking-widest"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Build Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STATUS.map(({ label, note, done }) => (
              <div
                key={label}
                className="flex items-start gap-3 px-4 py-3 rounded border"
                style={{
                  borderColor: done ? "var(--trading-bid-muted)" : "var(--color-border)",
                  backgroundColor: done ? "var(--trading-bid-muted)" + "18" : "transparent",
                }}
              >
                <span
                  className="mt-0.5 font-mono text-xs shrink-0"
                  style={{
                    color: done ? "var(--trading-profit)" : "var(--color-muted-foreground)",
                  }}
                >
                  {done ? "✓" : "○"}
                </span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    {note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px" style={{ backgroundColor: "var(--color-border)" }} />

        {/* Stack */}
        <section className="flex flex-col gap-6">
          <h2
            className="font-cypher text-sm uppercase tracking-widest"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STACK.map(([name, detail]) => (
              <div
                key={name}
                className="flex flex-col gap-0.5 px-4 py-3 rounded border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="font-mono text-sm font-medium" style={{ color: "var(--primary)" }}>
                  {name}
                </span>
                <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  {detail}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}
