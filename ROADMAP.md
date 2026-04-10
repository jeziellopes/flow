# Flow — Roadmap

I'm building this as a portfolio project to demonstrate React 19 + Vite 8 + Zustand + WebSocket real-time data handling with Binance market data.

## Priority Tiers

### P0 — Must Ship

These features form the core demo. Without them, my project doesn't tell a story.

| Feature | Spec | Status |
|---|---|---|
| WebSocket data layer | `specs/websocket-data-layer.spec.md` | ✅ Merged — [#100](https://github.com/jeziellopes/flow/pull/100) |
| Symbol routing | `specs/symbol-routing.spec.md` | ✅ Merged — [#102](https://github.com/jeziellopes/flow/pull/102) |
| Order book UI | `specs/order-book-ui.spec.md` | ✅ Merged — [#103](https://github.com/jeziellopes/flow/pull/103), [#111](https://github.com/jeziellopes/flow/pull/111), [#127](https://github.com/jeziellopes/flow/pull/127), [#149](https://github.com/jeziellopes/flow/pull/149) |

### P1 — Should Ship

Adds depth to my demo. Proves form handling, state management, and optimistic UI beyond read-only data display.

| Feature | Spec | Status |
|---|---|---|
| Simulated order entry | `specs/simulated-order-entry.spec.md` | ✅ Merged — [#132](https://github.com/jeziellopes/flow/pull/132) |
| Portfolio tracker (balances, PnL, history) | Included in order entry spec | ✅ Merged — [#153](https://github.com/jeziellopes/flow/pull/153) |
| OHLCV candlestick chart (real-time klines) | `specs/order-book-ui.spec.md` | ✅ Merged — [#153](https://github.com/jeziellopes/flow/pull/153), [#156](https://github.com/jeziellopes/flow/pull/156) |

### P2 — Stretch Goals

Impressive if polished, damaging if half-done. I'll only build these after P0 and P1 are tight.

| Feature | Spec | Status |
|---|---|---|
| Strategy Engine (auto-trading) | [`specs/strategy-engine.spec.md`](specs/strategy-engine.spec.md) | Spec ready |
| Matching engine visualizer | — | Not started |
| Strategy leaderboard | — | Not started |
| Multi-exchange plugin architecture | — | Not started |

> **Partial implementation:** `src/features/bots/` (bot manager table, detail route, mock data) was built as an early UI scaffold for the Strategy Engine. Issue [#3](https://github.com/jeziellopes/trading-engine/issues/3) — bot configuration form (strategy picker, symbol, params) — is the `StrategyPanel` UI gap that closes this feature. The full engine (domain layer, infra adapters, Zustand stores) depends on P0 + P1 being complete first.

#### Strategy Engine — Domain Cost

The strategy engine requires building the full ports-and-adapters stack first. Estimated effort:

| Layer | What to build | Effort |
|-------|--------------|--------|
| `domain/strategy/` | `ITradingStrategy` port, signal types, MA/RSI/Grid strategies | ~5 days |
| `infra/` | `BinanceDataSource`, `LocalFillEngine`, `StrategyRunner` | ~5 days |
| `stores/` | `marketDataStore`, `strategyStore` (Zustand) | ~2 days |
| `features/strategy-panel/` | Picker, params, signal log, kill switch UI | ~2 days |
| **Total** | | **~2–3 weeks** |

Strategies are pure functions in the domain layer — testable without any API calls.
Auto-trading is paper-only, disabled by default, and gated by a hard `maxPositionUsdt` cap.

## Architectural Trade-offs

Decisions made deliberately for a portfolio project — not ignorance of the alternatives.

### Client-only state (no backend)

**Decision:** All state lives in Zustand in the browser. No persistence across reloads.

**Why this is OK:** This is a demo of frontend engineering, not a full-stack system. Interviewers care about how you handle real-time data in React, not whether you can wire up a database.

**What you'd change in production:** Add a WebSocket relay server, persist portfolio to a database, add authentication.

### No persistence layer

**Decision:** Portfolio, trades, and open orders reset on page reload.

**Why this is OK:** Keeps scope tight. The demo proves optimistic UI and state management patterns — not durability.

**What you'd change in production:** `localStorage` with versioned schema migrations at minimum. IndexedDB or a backend for anything serious.

### Paper trading against live prices (not a real matching engine)

**Decision:** Market orders fill instantly at best bid/ask. Limit orders fill when price crosses. No order queue, no price-time priority, no partial fills.

**Why this is OK:** The goal is demonstrating UI/state patterns, not building an exchange. The fill logic is simple and predictable.

**What you'd change in production:** Full order matching with price-time priority, partial fills, order queues, and a deterministic event log.

### Single exchange (Binance only)

**Decision:** No plugin architecture. Direct Binance WebSocket/REST integration.

**Why this is OK:** One well-built integration beats an abstraction validated by zero alternatives. The code can be refactored into a plugin later if needed — premature abstraction adds complexity without payoff.

**What you'd change in production:** Extract a `DataSource` interface when adding a second exchange, not before.

### Pinned bleeding-edge dependencies

**Decision:** Vite 8 (Rolldown) and React 19 are current but may shift.

**Mitigation:** Pin exact versions. Include `.nvmrc`. Add `engines` field to `package.json`. Consider a Dockerfile for reproducible builds. A demo that doesn't install is worse than no demo.

## Known Risks

### WebSocket reconnect is load-bearing

The reconnect path (disconnect → discard → re-snapshot → resubscribe) is the #1 source of bugs in order book implementations. The sequence must be: detect drop → set status to `reconnecting` → fetch fresh REST snapshot → apply only events with `lastUpdateId > snapshot` → set status to `connected`. Getting this wrong means a silently corrupted book.

### Binance rate limits during development

Binance enforces 5 WebSocket connections per IP per second. Hot-reload during development can burn through this. Use a single persistent connection and avoid reconnecting on every file save.

### Scope creep from P2 features

The random traders, matching engine visualizer, and leaderboard are each standalone weekend projects. Do not start them until P0 and P1 are demo-ready with polished UX and no jank.

## Implementation Order

```
1. WebSocket data layer  ──► foundation, everything depends on this
2. Symbol routing         ──► route structure, loaders, navigation
3. Order book UI          ──► primary visual showcase
4. Simulated order entry  ──► interaction layer, proves form + state patterns
```

## Backend Integration Path

Documented in `specs/integration-boundaries.spec.md`. Four boundaries are defined with interfaces, migration paths, and what the client stops owning:

| Boundary | Interface | Current Impl | Backend Swap |
|---|---|---|---|
| Market data | `MarketDataSource` | `BinanceDataSource` (browser → Binance) | `RelayDataSource` (browser → relay server → Binance) |
| Orders | `OrderGateway` | `LocalFillEngine` (client-side fills) | `OmsGateway` (REST/WS to OMS backend) |
| Portfolio | Route loader / store hydration | Hardcoded initial balances | `GET /api/portfolio` on load |
| Auth | New boundary | None | JWT/session on all backend calls |

The frontend interfaces are delivered with P0/P1. Backend implementations are a separate project phase.

## Related Documents

- [`docs/PRD.md`](docs/PRD.md) — Business context, user flows, quality criteria
- [`SPECS.md`](SPECS.md) — Spec index with dependency graph
- [`CLAUDE.md`](CLAUDE.md) — Agent conventions, commands, anti-patterns
- [`specs/architecture.spec.md`](specs/architecture.spec.md) — Hexagonal architecture, layers, dependency rules, domain model
- [`specs/tech-stack.spec.md`](specs/tech-stack.spec.md) — Stack feature rationale
- [`specs/integration-boundaries.spec.md`](specs/integration-boundaries.spec.md) — Backend swap interfaces

## Design System Status

| Area | Status |
|------|--------|
| Three-layer token architecture (`--t-*` → semantic → @theme) | ✅ Complete |
| `@theme inline` — semantic + trading + sidebar + duration tokens | ✅ Complete (#13) |
| Component token usage (`bg-trading-bid`, `text-trading-ask`, etc.) | ✅ Complete (#13) |
| React composition patterns (compound components, prop grouping) | 🔄 In progress (#14) |
| Route component extraction into `features/` + `ui/` primitives | 🔄 In progress (#15) |
