<div align="center">
  <img width="806" height="169" alt="Flow — Real-time Trading Terminal" src="https://github.com/user-attachments/assets/a6a17139-76aa-4712-a09d-e480fe67d8a3" />

  <p><strong>Real-time crypto trading terminal — live Binance data, 60 fps, zero manual memoization.</strong></p>

  <p>
    <a href="https://github.com/jeziellopes/flow/actions/workflows/test.yml"><img src="https://github.com/jeziellopes/flow/actions/workflows/test.yml/badge.svg?branch=develop" alt="Tests"></a>
    <a href="https://github.com/jeziellopes/flow/actions/workflows/code-quality.yml"><img src="https://github.com/jeziellopes/flow/actions/workflows/code-quality.yml/badge.svg?branch=develop" alt="Code Quality"></a>
    <a href="https://github.com/jeziellopes/flow/releases"><img src="https://img.shields.io/github/v/release/jeziellopes/flow?include_prereleases&label=release&color=00c7ff&logo=github" alt="Latest Release"></a>
    <img src="https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=white" alt="React 19.2">
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.8">
  </p>
</div>

Production-grade trading terminal simulator running entirely in the browser — live order books, real-time candlestick charts, simulated order fills, and a multi-theme design system, built on React 19, Vite 8 (Rolldown + Oxc), and Ports & Adapters architecture.

> **Status: P0 + P1 complete.** All core trading features are live: order book, trades feed, OHLCV chart, ticker, simulated order entry, and portfolio tracking — all on real Binance WebSocket data.

**Live demo:** Vercel preview on every PR — see the Vercel bot comment for the latest URL.

## What It Does

A cyberpunk-themed crypto trading dashboard that mirrors the architecture of a real exchange frontend:

- **Live order book** — bid/ask depth levels with full-row depth bars, spread display, price grouping, hover-to-prefill, real-time tick animation
- **OHLCV candlestick chart** — lightweight-charts, real Binance kline REST + WebSocket stream, defaults to last 100 bars
- **Real-time ticker** — live price, 24h high/low/volume from `@miniTicker` stream with tick direction animation
- **Simulated order entry** — market and limit orders against live Binance prices, filled by `LocalFillEngine`
- **Portfolio tracker** — balances, open positions, unrealized PnL, trade history; live PnL from ticker stream
- **Draggable dashboard** — panels resize and reorder via `react-grid-layout`, layout persisted to localStorage
- **Design system** — five cyberpunk themes × three modes with WCAG contrast enforcement

> The UI is static/paper-trading only — no real money, no API keys, no backend. The `MarketDataSource` and `OrderGateway` interfaces are designed for a real backend swap.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 + Vite 8 (Rolldown + Oxc) |
| Router | TanStack Router (file-based, typed params) |
| State | Zustand (streaming) + TanStack Query (snapshots) |
| Forms | React Hook Form + Zod |
| Notifications | Sonner 2 (toast system, single `<Toaster>` at root) |
| Dashboard | react-grid-layout 2.x (draggable + resizable panels) |
| Styling | Tailwind CSS 4 + CVA + CSS custom properties |
| Compiler | React Compiler 1.0 (zero manual memoization) |
| Testing | Vitest + React Testing Library |
| Linting | Biome + ESLint (React Compiler rules) |
| Runtime | Node.js 22 |

## Quick Start

```bash
# Requires Node.js 22+ and pnpm
git clone https://github.com/jeziellopes/flow
cd flow
pnpm install
pnpm dev        # http://localhost:5173
```

```bash
pnpm build      # production build → dist/
pnpm test       # run all tests
pnpm lint       # Biome + ESLint
pnpm contrast   # WCAG contrast audit (195 pairs)
pnpm tokens     # regenerate design-tokens.ts from tokens.css
```

## Architecture

Ports & Adapters (Hexagonal), adapted for a client-only React SPA.

```
Binance REST ──► Snapshot ──┐
                             ├──► Zustand Store ──► React UI
Binance WS ──► Stream ───────┘
```

**Dependency direction:** Presentation → Application → Domain ← Infrastructure

```
src/
├── domain/       # Types, interfaces (ports), pure logic. Zero external imports.
├── infra/        # Adapters: BinanceDataSource, LocalFillEngine
├── stores/       # Zustand stores (orchestrate domain + adapters)
├── features/     # Feature modules: order-book, order-entry, portfolio
├── ui/           # Design system primitives: DepthBar, inputs, layout
├── routes/       # TanStack Router file-based routes
└── lib/          # Config, constants, utilities
```

## Design System

Five cyberpunk themes (`soft`, `night-city`, `ghost`, `matrix`, `vapor`) × three modes (`dark`, `light`, `vibrant`). Three-layer CSS architecture:

```
Layer 1 — [data-theme="x"]               ← palette (--t-* private vars)
Layer 2 — [data-theme="x"][data-mode="y"] ← surface system
Layer 3 — :root                          ← fonts + durations only
```

Browse the live gallery at `/design-system` — includes a theme/mode switcher, WCAG contrast audit table (195 pairs, all passing), and component showcase.

## Key Patterns

- **React Compiler** — no `useMemo`/`useCallback`/`React.memo` anywhere
- **`useEffectEvent`** — WebSocket handlers read latest state without re-subscribing
- **`<Activity>`** — hidden tabs deferred, zero render cost when inactive
- **Frame batching** — high-frequency WS updates batched per `requestAnimationFrame`
- **Granular selectors** — components subscribe to Zustand slices, not whole store
- **Zod boundaries** — all Binance messages validated before entering the store

## Roadmap

All P0 + P1 features are shipped. See [`ROADMAP.md`](ROADMAP.md) for P2 stretch goals and architectural notes.

| Priority | Feature | Status |
|----------|---------|--------|
| ✅ | WebSocket data layer (Binance) | Merged — [#100](https://github.com/jeziellopes/flow/pull/100) |
| ✅ | Symbol routing with typed params | Merged — [#102](https://github.com/jeziellopes/flow/pull/102) |
| ✅ | Order book UI wired to live data | Merged — [#103](https://github.com/jeziellopes/flow/pull/103), [#111](https://github.com/jeziellopes/flow/pull/111), [#127](https://github.com/jeziellopes/flow/pull/127), [#149](https://github.com/jeziellopes/flow/pull/149) |
| ✅ | Simulated order entry (fills at live price) | Merged — [#132](https://github.com/jeziellopes/flow/pull/132) |
| ✅ | Portfolio tracker with live PnL | Merged — [#153](https://github.com/jeziellopes/flow/pull/153) |
| ✅ | OHLCV candlestick chart (real-time klines) | Merged — [#153](https://github.com/jeziellopes/flow/pull/153), [#156](https://github.com/jeziellopes/flow/pull/156) |

## Docs

- [`ROADMAP.md`](ROADMAP.md) — Priority tiers, trade-offs, implementation order
- [`SPECS.md`](SPECS.md) — Spec index with dependency graph
- [`docs/PRD.md`](docs/PRD.md) — Product requirements and user flows
- [`specs/architecture.spec.md`](specs/architecture.spec.md) — Hexagonal architecture detail
- [`specs/tech-stack.spec.md`](specs/tech-stack.spec.md) — Stack rationale
