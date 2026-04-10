# Product Requirements Document

## Problem Statement

Trading platforms require frontends that handle high-frequency data streams, maintain UI responsiveness under load, and present complex financial data accurately. Building this well demands expertise in WebSocket lifecycle management, state synchronization, render optimization, and financial UI conventions that most CRUD apps never exercise.

This project exists to demonstrate that expertise in a portfolio-grade artifact.

## Project Goal

Build a real-time trading engine simulator that showcases modern frontend engineering: React 19.2, Vite 8, Zustand, and live Binance market data — rendered at 60fps with zero manual memoization.

## Business Context

**Domain:** Crypto exchange / trading desk frontend.

**Why Binance data:** Binance offers unrestricted public WebSocket and REST APIs with high-throughput market data. No API keys, no rate-limited sandbox, no domestic exchange restrictions. This provides realistic data volume (10-50 depth updates/sec for BTC/USDT) without regulatory dependencies.

**Real-world relevance:** The architecture mirrors what a modern crypto exchange frontend needs — ultra-low-latency rendering, deterministic UI under concurrent data streams, and type-safe routing between trading pairs. The `MarketDataSource` and `OrderGateway` interfaces are modeled after real OMS integration boundaries.

## Target Audience

**Primary (interviewers/reviewers):** Senior engineers and engineering managers evaluating frontend architecture skills. They will:
- Clone and run the project (must build in < 60 seconds)
- Click through the order book, switch symbols, place simulated orders
- Read the code for ~5 minutes, focusing on state management and WebSocket handling
- Ask about trade-offs during a technical interview

**Secondary (self):** Learning vehicle for React 19.2 features, React Compiler, and real-time rendering patterns.

## Scope

### In Scope (P0 + P1)

- Live order book with bid/ask depth, spread, and depth chart
- **OHLCV candlestick price chart** (lightweight-charts) — Merged [#153](https://github.com/jeziellopes/flow/pull/153), [#156](https://github.com/jeziellopes/flow/pull/156) ✅
- Real-time trades feed (ring buffer, last 100)
- Symbol routing with typed params and search state in URL
- Simulated order entry (market + limit orders against live prices)
- Portfolio tracker (balances, open orders, trade history, PnL)
- Connection status with reconnect handling
- Backend integration interfaces (`MarketDataSource`, `OrderGateway`)

### Out of Scope (P2 Stretch)

- **Strategy Engine** (configurable auto-trading bots) — `specs/strategy-engine.spec.md` · MA/RSI/Grid strategies, paper-only fills, kill switch. The bot manager table and detail route (`src/features/bots/`) are a partial early implementation. Issue [#3](https://github.com/jeziellopes/trading-engine/issues/3) (bot configuration form) is the `StrategyPanel` UI that closes the loop. Depends on P0 + P1 being complete first.
- **Matching engine visualizer** — heatmap, execution tape (no spec, not started)
- **Strategy leaderboard** — ranked bots by P&L (no spec, lowest priority)
- Multi-exchange plugin architecture
- Backend server, persistence, authentication

### Bonus / Not Required for Portfolio Demo

- **Flowa brand theme** — additional `data-theme="flowa"` dark + light variant using the Flowatech brand palette. Tracked in issue [#12](https://github.com/jeziellopes/trading-engine/issues/12). Not required for interview readiness.

### Explicitly Not Building

- Server-side rendering (no SEO need for a trading dashboard)
- Real money trading or real order execution
- Mobile-responsive layout (desktop-first, trading terminal UX)

## User Flows

### Flow 1: View Live Market Data

```
User opens app
    → Redirected to /symbol/BTCUSDT (default)
    → REST snapshot loads → order book skeleton replaced with live data
    → WebSocket stream connects → book updates in real-time
    → Trades feed populates with live trades
    → Depth chart renders cumulative bid/ask areas
```

**Key moments:**
- Loading state: skeleton UI while snapshot loads (< 2 seconds)
- Connected state: green indicator, live data flowing
- Disconnect: yellow "Reconnecting..." banner, stale data visible but dimmed

### Flow 2: Switch Trading Pair

```
User clicks ETHUSDT in symbol selector
    → URL changes to /symbol/ETHUSDT
    → Transition keeps BTCUSDT book visible while ETHUSDT loads
    → Previous WS stream unsubscribed
    → New snapshot fetched → new stream subscribed
    → Book swaps atomically — no flash of stale data
```

**Key moments:**
- Pending indicator during transition (opacity dim on nav)
- No intermediate empty state — old data stays until new data ready
- Search params preserved (active tab, depth levels)

### Flow 3: Place Simulated Order

```
User selects Buy, Market, enters 0.5 BTC quantity
    → Form validates via Zod (positive number, sufficient USDT balance)
    → Submits → optimistic UI: balance decreases, trade appears in history
    → Fill engine confirms at current best ask price
    → Optimistic state settled — no visible change if fill matches expectation
```

**Error paths:**
- Insufficient balance → inline error, form does not submit
- No market data yet → submit button disabled with tooltip
- Limit order below market → order appears in "Open Orders", fills when price crosses

### Flow 4: Manage Portfolio

```
User navigates to portfolio tab (or views sidebar)
    → Sees current balances (USDT, BTC, ETH)
    → Open orders listed with cancel buttons
    → Trade history shows all fills with timestamps and PnL
    → Unrealized PnL updates live as market price moves
```

**Key moments:**
- Portfolio starts at 10,000 USDT, 0 crypto
- Resets on page reload (session-only, documented trade-off)
- Cancel restores reserved balance immediately

### Flow 5: Reconnection After Disconnect

```
WebSocket connection drops (network issue, Binance maintenance)
    → connectionStatus → 'reconnecting'
    → Yellow banner appears: "Reconnecting..."
    → Last-known book data stays visible (not cleared)
    → Exponential backoff: 1s → 2s → 4s → ... → 30s max
    → On reconnect: stale book discarded → fresh snapshot → resubscribe
    → connectionStatus → 'connected', banner disappears
```

**Key moments:**
- User sees the disconnect immediately (not silently stale)
- Book is never in a corrupted state — either live or visibly stale
- Order form disabled during reconnection

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  [BTCUSDT ▼]  [ETHUSDT]  [...]     ● Connected     │  ← Nav bar
├──────────┬──────────────────┬───────────────────────┤
│          │                  │                        │
│  Ask     │                  │  Order Form            │
│  levels  │   Depth Chart    │  [Buy] [Sell]          │
│          │                  │  Type: [Market|Limit]  │
│ ──────── │                  │  Qty: [____]           │
│  Spread  │                  │  Price: [____]         │
│ ──────── │                  │  [Submit]              │
│          │                  │                        │
│  Bid     │                  │  Open Orders           │
│  levels  │                  │  ──────────            │
│          │                  │  Portfolio             │
├──────────┴──────────────────┴───────────────────────┤
│  Trades Feed: time | price | qty | side             │
└─────────────────────────────────────────────────────┘
```

Grid: `grid-cols-[300px_1fr_300px] gap-4` — order book | chart | positions.

## Non-Functional Requirements

### Performance
- Order book renders at 60fps under 50 updates/sec
- Symbol switch completes in < 1 second (snapshot + stream)
- Initial load to interactive: < 3 seconds on mid-range hardware
- Bundle size: < 200KB gzipped for initial route (chart libraries lazy-loaded)

### Reliability
- WebSocket reconnect handles indefinite disconnects
- No silent data corruption — book is live or visibly stale, never silently wrong
- Malformed messages logged and skipped, never crash the app

### Developer Experience
- `npm run dev` starts in < 2 seconds (Vite 8 + Rolldown)
- Tests run in < 10 seconds (`npm test`)
- Single command build: `npm run build` → deployable static files

## Quality Criteria

What "done" looks like for this project:

### Technical Quality
- [x] All acceptance criteria from specs have passing tests
- [x] No manual `useMemo`/`useCallback`/`React.memo` — React Compiler handles memoization
- [x] TypeScript strict mode — no `: any` types (some `as` casts exist at validated Zod boundaries)
- [x] All Binance messages validated with Zod before entering the store
- [x] Strings for all prices/quantities — no floating-point financial math

### Demo Quality
- [x] Builds and runs from a clean clone (`git clone` → `npm ci` → `npm run dev`)
- [x] Order book visibly updates in real-time within 2 seconds of load
- [x] Symbol switching is smooth — no blank screens or stale data flash
- [x] Simulated order fills reflect in balance and trade history immediately
- [x] Disconnect/reconnect is visible and recovers cleanly

### Architecture Quality
- [x] `MarketDataSource` interface exists — data layer is swappable
- [x] `OrderGateway` interface exists — fill engine is swappable
- [x] Feature-driven directory structure (`src/features/<name>/`)
- [x] Zustand selectors are granular — components subscribe to slices, not whole store
- [x] No prop drilling — state flows through stores and route context

### Interview Readiness
- [x] Can explain every architectural trade-off in ROADMAP.md
- [x] Can demonstrate the WebSocket reconnect path live
- [x] Can point to the `MarketDataSource`/`OrderGateway` interfaces as backend integration points
- [x] Can show React 19.2 features in action: `<Activity>`, `useEffectEvent`, `useOptimistic`
- [x] Can profile the order book in Chrome DevTools using React Performance Tracks
