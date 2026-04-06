// AUTO-SYNCED from src/styles/tokens.css — do not edit directly.
// Run `pnpm tokens` to regenerate.

export const designTokens = {
  fonts: {
    "geist-mono": '"Geist Mono"',
    orbitron: '"Orbitron"',
  },
  semantic: {
    "--background": "oklch(0.95 0.004 265)",
    "--foreground": "oklch(0.12 0.008 265)",
    "--card": "oklch(0.99 0.004 265)",
    "--card-foreground": "oklch(0.12 0.008 265)",
    "--popover": "oklch(0.99 0.004 265)",
    "--popover-foreground": "oklch(0.12 0.008 265)",
    "--primary": "oklch(0.62 0.22 280)",
    "--primary-foreground": "oklch(0.10 0    0  )",
    "--secondary": "oklch(0.93 0.004 265)",
    "--secondary-foreground": "oklch(0.12 0.008 265)",
    "--muted": "oklch(0.93 0.004 265)",
    "--muted-foreground": "oklch(0.45 0.002 265)",
    "--accent": "oklch(0.97 0.004 265)",
    "--accent-foreground": "oklch(0.12 0.008 265)",
    "--destructive": "oklch(0.56 0.24 27 )",
    "--destructive-foreground": "oklch(0.97 0    0  )",
    "--border": "oklch(0.83 0.004 265)",
    "--input": "oklch(0.96 0.004 265)",
    "--ring": "oklch(0.62 0.22 280)",
  },
  gray: {
    "100": "oklch(0.94 0.004 265)",
    "500": "oklch(0.45 0.002 265)",
    "600": "oklch(0.35 0.002 265)",
    "700": "oklch(0.25 0.002 265)",
    "800": "oklch(0.90 0.004 265)",
  },
  sidebar: {
    foreground: "oklch(0.12 0.008 265)",
    primary: "oklch(0.62 0.22 280)",
    "primary-foreground": "oklch(0.10 0    0  )",
    accent: "oklch(0.92 0.004 265)",
    "accent-foreground": "oklch(0.12 0.008 265)",
    border: "oklch(0.87 0.004 265)",
    ring: "oklch(0.62 0.22 280)",
  },
  trading: {
    bid: "oklch(0.44 0.16 145)",
    "bid-muted": "oklch(from oklch(0.44 0.16 145) l c h / 0.12)",
    ask: "oklch(0.48 0.20 25 )",
    "ask-muted": "oklch(from oklch(0.48 0.20 25 ) l c h / 0.12)",
    profit: "oklch(0.40 0.16 145)",
    loss: "oklch(0.48 0.20 25 )",
    "tick-up": "oklch(0.40 0.16 145)",
    "tick-down": "oklch(0.48 0.20 25 )",
    "tick-neutral": "oklch(0.45 0.002 265)",
    connected: "oklch(0.44 0.16 145)",
    reconnecting: "oklch(0.50 0.16 75 )",
    disconnected: "oklch(0.48 0.20 25 )",
    "reconnecting-bg": "oklch(from oklch(0.50 0.16 75 ) l c h / 0.10)",
    "reconnecting-border": "oklch(from oklch(0.50 0.16 75 ) l c h / 0.30)",
    "disconnected-bg": "oklch(from oklch(0.48 0.20 25 ) l c h / 0.10)",
    "disconnected-border": "oklch(from oklch(0.48 0.20 25 ) l c h / 0.30)",
  },
  durations: {
    fast: "150ms",
    default: "200ms",
    medium: "300ms",
    slow: "500ms",
    xslow: "700ms",
  },
} as const;

export type DesignTokens = typeof designTokens;

/** All typed CSS variable names available in this design system */
export type TokenVar =
  | `--font-${string}`
  | `--ds-gray-${string}`
  | `--sidebar-${string}`
  | `--trading-${string}`
  | `--duration-${string}`
  | "--background"
  | "--foreground"
  | "--card"
  | "--card-foreground"
  | "--primary"
  | "--primary-foreground"
  | "--secondary"
  | "--secondary-foreground"
  | "--muted"
  | "--muted-foreground"
  | "--border"
  | "--input"
  | "--ring"
  | "--destructive"
  | "--destructive-foreground";
