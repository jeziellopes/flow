import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { ConnectionBanner } from "@/features/order-book/connection-banner";
import { SpreadBar } from "@/features/order-book/spread-bar";
import { OrderForm } from "@/features/order-entry/order-form";
import {
  CONTRAST_PAIRS,
  contrastRatio,
  meetsRequired,
  oklchToLuminance,
  parseOklch,
  wcagLevel,
} from "@/lib/contrast";
import { MOCK_DS_ASKS, MOCK_DS_BIDS, MOCK_DS_TRADES } from "@/lib/mock-data";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/card";
import { DepthBar } from "@/ui/depth-bar";
import { Input } from "@/ui/input";
import { Tab, TabList } from "@/ui/tabs";

export const Route = createLazyFileRoute("/design-system")({
  component: DesignSystemShowcase,
});

// ── Theme switcher ───────────────────────────────────────────────────────────────────────────────────

type ThemeId = "soft" | "night-city" | "maelstrom" | "corpo-ice" | "netrunner" | "flowa";
type ModeId = "dark" | "light" | "vibrant";

const THEMES: { id: ThemeId; label: string; accent: string }[] = [
  { id: "soft", label: "Soft", accent: "oklch(0.62 0.22 280)" },
  { id: "night-city", label: "Night City", accent: "oklch(0.68 0.22 95)" },
  { id: "maelstrom", label: "Maelstrom", accent: "oklch(0.56 0.28 316)" },
  { id: "corpo-ice", label: "Corpo Ice", accent: "oklch(0.88 0.18 215)" },
  { id: "netrunner", label: "Netrunner", accent: "oklch(0.62 0.22 280)" },
  { id: "flowa", label: "Flowa", accent: "oklch(0.87 0.12 124.61)" },
];

const MODES: { id: ModeId; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "vibrant", label: "Vibrant" },
];

const THEME_STORAGE_KEY = "theme";
const MODE_STORAGE_KEY = "mode";

function applyTheme(theme: ThemeId, mode: ModeId) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-mode", mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // storage unavailable — silent fail
  }
}

function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>("night-city");
  const [mode, setModeState] = useState<ModeId>("dark");
  // vivid: show dark-mode palette vars on light bg (dev tool — contrast may fail)
  const [vivid, setVividState] = useState(false);

  // Read persisted theme from localStorage on mount; fall back to html attrs then defaults
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      const storedMode = localStorage.getItem(MODE_STORAGE_KEY) as ModeId | null;
      const dt = document.documentElement.getAttribute("data-theme") as ThemeId | null;
      const dm = document.documentElement.getAttribute("data-mode") as ModeId | null;
      const t =
        storedTheme && THEMES.some((x) => x.id === storedTheme)
          ? storedTheme
          : (dt ?? "night-city");
      const m: ModeId =
        storedMode === "light" || storedMode === "dark" || storedMode === "vibrant"
          ? storedMode
          : dm === "light" || dm === "vibrant"
            ? dm
            : "dark";
      applyTheme(t, m);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(t as ThemeId);

      setModeState(m);
    } catch {
      // storage unavailable — use defaults
    }
  }, []);

  const setTheme = (t: ThemeId) => {
    applyTheme(t, mode);
    setThemeState(t);
  };
  const setMode = (m: ModeId) => {
    applyTheme(theme, m);
    setModeState(m);
  };
  const toggleVivid = () => {
    const next = !vivid;
    if (next) document.documentElement.setAttribute("data-palette", "vivid");
    else document.documentElement.removeAttribute("data-palette");
    setVividState(next);
  };

  return { theme, mode, vivid, setTheme, setMode, toggleVivid };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-mono font-semibold tracking-widest text-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-mono text-muted-foreground w-28 shrink-0">{label}</span>
      {children}
    </div>
  );
}

// ── Contrast audit (live DOM read) ───────────────────────────────────────────────

function ContrastSection({ theme, mode, vivid }: { theme: ThemeId; mode: ModeId; vivid: boolean }) {
  const [results, setResults] = useState<
    { name: string; ratio: number; level: string; pass: boolean }[]
  >([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: theme/mode/vivid trigger CSS var re-reads after applyTheme()
  useLayoutEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const get = (v: string) => style.getPropertyValue(v).trim();

    const rows = CONTRAST_PAIRS.map((pair) => {
      const fgRaw = get(pair.fg);
      const bgRaw = get(pair.bg);
      const fg = parseOklch(fgRaw);
      const bg = parseOklch(bgRaw);
      if (!fg || !bg) return { name: pair.name, ratio: 0, level: "FAIL", pass: false };
      const ratio = contrastRatio(
        oklchToLuminance(fg.l, fg.c, fg.h),
        oklchToLuminance(bg.l, bg.c, bg.h),
      );
      return {
        name: pair.name,
        ratio,
        level: wcagLevel(ratio),
        pass: meetsRequired(ratio, pair.required),
      };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResults(rows);
  }, [theme, mode, vivid]);

  const passing = results.filter((r) => r.pass).length;
  const total = results.length;

  return (
    <Section title={`Contrast Audit — ${theme} / ${mode}`}>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-xs font-mono"
          style={{ color: passing === total ? "var(--trading-profit)" : "var(--trading-loss)" }}
        >
          {passing}/{total} pairs passing
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          WCAG AA ≥4.5:1 · AA-Large ≥3:1
        </span>
      </div>
      <div className="grid gap-1 max-w-2xl">
        {results.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-mono"
            style={{ backgroundColor: "var(--ds-gray-100)" }}
          >
            <span className="text-muted-foreground w-48 shrink-0">{r.name}</span>
            <span
              className="tabular-nums w-16 text-right"
              style={{ color: r.pass ? "var(--trading-profit)" : "var(--trading-loss)" }}
            >
              {r.ratio > 0 ? `${r.ratio.toFixed(2)}:1` : "—"}
            </span>
            <span
              className="w-20 text-right"
              style={{ color: r.pass ? "var(--trading-profit)" : "var(--trading-loss)" }}
            >
              {r.level}
            </span>
            <span style={{ color: r.pass ? "var(--trading-profit)" : "var(--trading-loss)" }}>
              {r.pass ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DesignSystemShowcase() {
  const { theme, mode, vivid, setTheme, setMode, toggleVivid } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <title>Design System | Flow</title>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight">CypherUI — Trading</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Component gallery · All tokens sourced from{" "}
              <code className="font-mono text-xs">tokens.css</code>
            </p>
          </div>

          {/* Theme switcher */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-1.5">
              {THEMES.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all"
                    style={{
                      borderColor: active ? t.accent : "var(--border)",
                      backgroundColor: active ? "var(--ds-gray-100)" : "transparent",
                      color: active ? "var(--foreground)" : "var(--muted-foreground)",
                      boxShadow: active ? `0 0 0 2px ${t.accent}` : "none",
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: t.accent }}
                    />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-1.5">
              {MODES.map((m) => {
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className="px-3 py-1.5 rounded-md border text-xs font-mono transition-all"
                    style={{
                      borderColor: active ? "var(--primary)" : "var(--border)",
                      backgroundColor: active ? "var(--primary)" : "transparent",
                      color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {mode === "light" && (
              <button
                type="button"
                onClick={toggleVivid}
                className="px-3 py-1.5 rounded-md border text-xs font-mono transition-all"
                style={{
                  borderColor: vivid ? "var(--trading-reconnecting)" : "var(--border)",
                  backgroundColor: vivid ? "var(--trading-reconnecting-bg)" : "transparent",
                  color: vivid ? "var(--trading-reconnecting)" : "var(--muted-foreground)",
                }}
              >
                {vivid ? "vivid ON" : "vivid"} — dev only
              </button>
            )}
          </div>
        </div>

        {/* ── Colors ──────────────────────────────────────── */}
        <Section title="Colors — Semantic">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "background", var: "var(--background)" },
              { label: "card", var: "var(--card)" },
              { label: "muted", var: "var(--muted)" },
              { label: "ds-gray-100", var: "var(--ds-gray-100)" },
              { label: "ds-gray-800", var: "var(--ds-gray-800)" },
              { label: "border", var: "var(--border)" },
              { label: "primary", var: "var(--primary)" },
              { label: "destructive", var: "var(--destructive)" },
            ].map(({ label, var: cssVar }) => (
              <div key={label} className="space-y-1.5">
                <div
                  className="h-12 rounded-md border border-border"
                  style={{ backgroundColor: cssVar }}
                />
                <p className="text-[10px] font-mono text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Colors — Trading Semantics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "bid", var: "var(--trading-bid)" },
              { label: "bid-muted", var: "var(--trading-bid-muted)" },
              { label: "ask", var: "var(--trading-ask)" },
              { label: "ask-muted", var: "var(--trading-ask-muted)" },
              { label: "profit", var: "var(--trading-profit)" },
              { label: "loss", var: "var(--trading-loss)" },
              { label: "tick-up", var: "var(--trading-tick-up)" },
              { label: "tick-down", var: "var(--trading-tick-down)" },
              { label: "connected", var: "var(--trading-connected)" },
              { label: "reconnecting", var: "var(--trading-reconnecting)" },
              { label: "disconnected", var: "var(--trading-disconnected)" },
              { label: "tick-neutral", var: "var(--trading-tick-neutral)" },
            ].map(({ label, var: cssVar }) => (
              <div key={label} className="space-y-1.5">
                <div
                  className="h-12 rounded-md border border-border"
                  style={{ backgroundColor: cssVar }}
                />
                <p className="text-[10px] font-mono text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Colour Roles ─────────────────────────────────── */}
        <Section title="Colors — Colour Roles">
          <p className="text-xs text-muted-foreground mb-3">
            Each swatch shows the fill with its paired <code className="font-mono">on-*</code> text
            on top — the correct contrast pair.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "primary", bg: "var(--primary)", fg: "var(--on-primary)" },
              { label: "secondary", bg: "var(--secondary)", fg: "var(--on-secondary)" },
              { label: "tertiary / accent", bg: "var(--accent)", fg: "var(--on-tertiary)" },
              { label: "trading-bid", bg: "var(--trading-bid)", fg: "var(--on-trading-bid)" },
              { label: "trading-ask", bg: "var(--trading-ask)", fg: "var(--on-trading-ask)" },
            ].map(({ label, bg, fg }) => (
              <div key={label} className="space-y-1.5">
                <div
                  className="h-14 rounded-md border border-border flex items-center justify-center text-xs font-mono font-medium"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  on-{label.split(" / ")[0]}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Container Roles ───────────────────────────────── */}
        <Section title="Colors — Containers">
          <p className="text-xs text-muted-foreground mb-3">
            Alpha-tinted container fills for badges, pills, and highlight backgrounds — paired with
            their <code className="font-mono">on-*-container</code> text.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                label: "primary-container",
                bg: "var(--primary-container)",
                fg: "var(--on-primary-container)",
              },
              {
                label: "secondary-container",
                bg: "var(--secondary-container)",
                fg: "var(--on-secondary-container)",
              },
              {
                label: "tertiary-container",
                bg: "var(--tertiary-container)",
                fg: "var(--on-tertiary-container)",
              },
            ].map(({ label, bg, fg }) => (
              <div key={label} className="space-y-1.5">
                <div
                  className="h-14 rounded-md border border-border flex items-center justify-center text-xs font-mono font-medium"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  on-{label.replace("-container", "")}-container
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Typography ──────────────────────────────────── */}
        <Section title="Typography">
          <div className="space-y-4">
            <div className="p-4 rounded-md border border-border bg-card space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground">
                Orbitron — font-cypher — display
              </p>
              <p className="text-2xl font-cypher tracking-tight">BTCUSDT 67,843.50</p>
            </div>
            <div className="p-4 rounded-md border border-border bg-card space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground">
                Geist Mono — font-mono — body / prices
              </p>
              <p className="text-base font-mono tabular-nums">67843.50 · 1.24500 · +2.34%</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(
                [
                  "text-[10px]",
                  "text-xs",
                  "text-sm",
                  "text-base",
                  "text-lg",
                  "text-xl",
                  "text-2xl",
                ] as const
              ).map((cls) => (
                <div key={cls} className="p-3 rounded-md border border-border bg-card">
                  <p className={`font-mono tabular-nums ${cls}`}>67843.50</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">{cls}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Buttons ─────────────────────────────────────── */}
        <Section title="Buttons">
          <div className="space-y-4">
            <Row label="intents">
              <div className="flex flex-wrap gap-2">
                <Button intent="primary" size="sm">
                  Primary
                </Button>
                <Button intent="secondary" size="sm">
                  Secondary
                </Button>
                <Button intent="danger" size="sm">
                  Danger
                </Button>
                <Button intent="ghost" size="sm">
                  Ghost
                </Button>
                <Button intent="tonal" size="sm">
                  Tonal
                </Button>
                <TabList value="limit" onValueChange={() => {}} aria-label="Tab primitive demo">
                  <Tab value="limit">Limit</Tab>
                  <Tab value="market">Market</Tab>
                </TabList>
                <Button intent="buy" size="sm">
                  Buy
                </Button>
                <Button intent="sell" size="sm">
                  Sell
                </Button>
              </div>
            </Row>
            <Row label="sizes">
              <div className="flex items-center gap-2">
                <Button intent="buy" size="sm">
                  Buy SM
                </Button>
                <Button intent="buy" size="md">
                  Buy MD
                </Button>
                <Button intent="buy" size="lg">
                  Buy LG
                </Button>
              </div>
            </Row>
            <Row label="disabled">
              <Button intent="buy" size="sm" disabled>
                Disabled
              </Button>
            </Row>
            <Row label="full-width">
              <div className="w-64 flex gap-2">
                <Button intent="buy" size="md" className="flex-1">
                  Buy
                </Button>
                <Button intent="sell" size="md" className="flex-1">
                  Sell
                </Button>
              </div>
            </Row>
          </div>
        </Section>

        {/* ── Badges ──────────────────────────────────────── */}
        <Section title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge variant="active">Active</Badge>
            <Badge variant="muted">Soon</Badge>
            <Badge variant="pill">BTCUSDT</Badge>
            <Badge variant="stat">2,341</Badge>
            <Badge variant="buy">Buy</Badge>
            <Badge variant="sell">Sell</Badge>
            <Badge variant="open">Open</Badge>
            <Badge variant="filled">Filled</Badge>
            <Badge variant="cancelled">Cancelled</Badge>
          </div>
        </Section>

        {/* ── Input ───────────────────────────────────────── */}
        <Section title="Input">
          <div className="max-w-xs space-y-2">
            <Input placeholder="Price (USDT)" type="number" aria-label="Price in USDT" />
            <Input placeholder="Quantity (BTC)" type="number" aria-label="Quantity in BTC" />
            <Input placeholder="Disabled" disabled aria-label="Disabled input example" />
          </div>
        </Section>

        {/* ── Card ────────────────────────────────────────── */}
        <Section title="Card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardHeader>
                <div>
                  <p className="text-sm font-medium font-mono">BTCUSDT</p>
                </div>
                <Badge variant="buy">Long</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry:</span>
                    <span className="tabular-nums">65,200.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mark:</span>
                    <span className="tabular-nums">67,843.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qty:</span>
                    <span className="tabular-nums">0.42</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs font-mono text-[color:var(--trading-profit)] font-medium">
                  +2,643.50
                </span>
                <span className="text-xs font-mono text-[color:var(--trading-profit)] font-medium">
                  +4.057%
                </span>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <p className="text-sm font-medium font-mono">ETHUSDT</p>
                </div>
                <Badge variant="sell">Short</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry:</span>
                    <span className="tabular-nums">3,450.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mark:</span>
                    <span className="tabular-nums">3,510.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qty:</span>
                    <span className="tabular-nums">2.50</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-xs font-mono text-[color:var(--trading-loss)] font-medium">
                  −150.00
                </span>
                <span className="text-xs font-mono text-[color:var(--trading-loss)] font-medium">
                  −1.739%
                </span>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* ── Order Book ──────────────────────────────────── */}
        <Section title="Order Book">
          <div className="max-w-xs bg-card rounded-md border border-border overflow-hidden">
            {/* Asks (reversed — lowest ask at bottom, closest to spread) */}
            <div className="flex flex-col-reverse">
              {MOCK_DS_ASKS.map((level) => (
                <div
                  key={level.price}
                  className="relative grid grid-cols-3 gap-2 tabular-nums font-mono text-sm px-2 py-px"
                >
                  <DepthBar percent={level.percent} side="ask" />
                  <span className="relative z-10 text-[color:var(--trading-ask)]">
                    {level.price.toFixed(2)}
                  </span>
                  <span className="relative z-10 text-right text-muted-foreground">
                    {level.quantity.toFixed(2)}
                  </span>
                  <span className="relative z-10 text-right text-muted-foreground">
                    {level.total.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <SpreadBar
              spread={{ amount: 2.5, percent: 0.0037 }}
              lastPrice={67843.5}
              tickDirection="up"
            />

            {/* Bids */}
            <div>
              {MOCK_DS_BIDS.map((level) => (
                <div
                  key={level.price}
                  className="relative grid grid-cols-3 gap-2 tabular-nums font-mono text-sm px-2 py-px"
                >
                  <DepthBar percent={level.percent} side="bid" />
                  <span className="relative z-10 text-[color:var(--trading-bid)]">
                    {level.price.toFixed(2)}
                  </span>
                  <span className="relative z-10 text-right text-muted-foreground">
                    {level.quantity.toFixed(2)}
                  </span>
                  <span className="relative z-10 text-right text-muted-foreground">
                    {level.total.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Connection Banner ────────────────────────────── */}
        <Section title="Connection Banner">
          <div className="max-w-xs space-y-2">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground mb-1">connected (hidden)</p>
              <div className="h-6 rounded border border-dashed border-border flex items-center px-3">
                <span className="text-[10px] text-muted-foreground font-mono">
                  — nothing rendered —
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground mb-1">reconnecting</p>
              <ConnectionBanner status="reconnecting" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground mb-1">disconnected</p>
              <ConnectionBanner status="disconnected" />
            </div>
          </div>
        </Section>

        {/* ── Trade Feed ──────────────────────────────────── */}
        <Section title="Trade Feed">
          <div className="max-w-xs bg-card rounded-md border border-border">
            <div className="grid grid-cols-3 gap-x-2 px-2 py-1 text-[10px] font-mono text-muted-foreground border-b border-border">
              <span>Time</span>
              <span>Price</span>
              <span className="text-right">Qty</span>
            </div>
            {MOCK_DS_TRADES.map((trade) => (
              <div
                key={`${trade.time}-${trade.price}`}
                className="grid grid-cols-3 gap-x-2 px-2 py-px text-xs font-mono tabular-nums"
              >
                <span className="text-muted-foreground">{trade.time}</span>
                <span className={trade.side === "buy" ? "text-trading-bid" : "text-trading-ask"}>
                  {trade.price.toFixed(2)}
                </span>
                <span className="text-right text-muted-foreground">{trade.qty.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Order Form ──────────────────────────────────── */}
        <Section title="Order Entry">
          <div className="max-w-xs">
            <Card>
              <OrderForm symbol="BTCUSDT" onSubmit={() => {}} />
            </Card>
          </div>
        </Section>

        <ContrastSection theme={theme} mode={mode} vivid={vivid} />

        {/* Footer */}
        <div className="border-t border-border pt-6 text-[10px] font-mono text-muted-foreground">
          <p>CypherUI Trading · tokens.css</p>
          <p className="mt-1">
            Regenerate tokens: <code className="bg-muted px-1.5 py-0.5 rounded">pnpm tokens</code>
          </p>
        </div>
      </div>
    </div>
  );
}
