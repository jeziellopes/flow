import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { ThemeDropdown } from "@/features/theme/theme-dropdown";
import { TickerHeader } from "@/features/trading/ticker-header";
import { MOCK_BASE_BTC, MOCK_CHANGE_PCT } from "@/lib/mock-data";
import { useConnectionStatus } from "@/stores/market-data";
import { useTerminalStore } from "@/stores/terminal-store";
import { Button } from "@/ui/button";
import { ErrorBoundary } from "@/ui/error-boundary";
import { LiveIndicator } from "@/ui/live-indicator";
import { Logo } from "@/ui/logo";

export const Route = createRootRoute({
  component: RootComponent,
});

function LiveIndicatorConnected({ className }: { className?: string }) {
  const status = useConnectionStatus();
  return <LiveIndicator status={status} className={className} />;
}

function PortfolioWidget() {
  const totalBalance = useTerminalStore((s) => s.portfolioSummary.totalBalance);
  const dailyProfitPct = useTerminalStore((s) => s.portfolioSummary.dailyProfitPct);
  return (
    <Link
      to="/portfolio"
      className="flex items-center gap-3 px-3 py-1 rounded border border-border/60 transition-colors hover:border-border text-xs font-mono bg-background"
    >
      <span className="tabular-nums font-semibold">
        ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </span>
      <span className="tabular-nums text-trading-profit">+{dailyProfitPct}%</span>
      <span className="text-[10px] text-muted-foreground">Portfolio →</span>
    </Link>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isSymbolRoute = pathname.startsWith("/symbol/");
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 bg-card">
          <p className="text-base font-semibold text-destructive">Application Error</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button intent="secondary" size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      )}
      onError={(error) => toast.error(error.message)}
    >
      <div className="min-h-screen flex flex-col bg-background">
        <header className="w-full border-b border-border shrink-0 bg-card">
          <div className="w-full px-4 h-12 flex items-center gap-4">
            <Link
              // biome-ignore lint/suspicious/noExplicitAny: codegen pending
              to={"/" as any}
              className="font-cypher text-sm font-bold tracking-widest select-none text-primary"
            >
              <Logo className="w-6 h-6" />
              {!isSymbolRoute && <span className="ml-2">Flow</span>}
            </Link>
            {isSymbolRoute && <TickerHeader price={MOCK_BASE_BTC} changePct={MOCK_CHANGE_PCT} />}
            <div className="flex-1" />
            <PortfolioWidget />
            <div className="w-px h-5 bg-border mx-1" />
            <ThemeDropdown />
            <LiveIndicatorConnected className="ml-1" />
          </div>
        </header>
        <main className="flex-1 min-h-0">
          <Outlet />
        </main>
        <Toaster position="bottom-right" theme="system" richColors />
      </div>
    </ErrorBoundary>
  );
}
