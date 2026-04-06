import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { getDataSource } from "@/lib/config";
import type { SymbolInfo } from "@/lib/symbols";
import { findSymbol, normalizeSymbol } from "@/lib/symbols";
import { useMarketDataStore } from "@/stores/market-data";
import { useUIStore } from "@/stores/ui";
import { ErrorBoundary } from "@/ui/error-boundary";

import { TerminalLayout } from "./-trading-layout";

// ---------------------------------------------------------------------------
// Search params schema (AC-4, AC-5)
// ---------------------------------------------------------------------------

// tab is optional — omitted from URL when at default ("book") for clean links.
const searchSchema = z.object({
  tab: z.enum(["book", "trades", "depth"]).optional(),
});

export type SymbolSearch = z.infer<typeof searchSchema>;

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

// biome-ignore lint/suspicious/noExplicitAny: TanStack Router codegen pending
export const Route = createFileRoute("/symbol/$symbol" as any)({
  validateSearch: (search: Record<string, unknown>): SymbolSearch => searchSchema.parse(search),

  beforeLoad: ({ params, search, location }) => {
    const raw = new URLSearchParams(location.searchStr);
    // Strip legacy `levels` param and redundant `tab=book` default from URL.
    // validateSearch already strips unknown keys from the typed search, but the
    // browser URL is not rewritten until we throw a redirect here.
    const hasLegacyLevels = raw.has("levels");
    const hasDefaultTab = raw.get("tab") === "book";
    if (hasLegacyLevels || hasDefaultTab) {
      throw redirect({
        to: "/symbol/$symbol" as never,
        params: { symbol: params.symbol } as never,
        search: search.tab && search.tab !== "book" ? { tab: search.tab } : {},
        replace: true,
      } as never);
    }
  },

  loader: async ({ params }: { params: { symbol: string } }): Promise<SymbolInfo> => {
    // AC-3: normalize to uppercase
    const ticker = normalizeSymbol(params.symbol);

    // AC-2: throw notFound if unsupported
    const meta = findSymbol(ticker);
    if (!meta) throw notFound();

    // Canonical URL guard — if original was lowercase, redirect to upper (AC-3)
    if (params.symbol !== ticker) {
      throw redirect({ to: "/symbol/$symbol" as never, params: { symbol: ticker } as never });
    }

    // Trigger symbol switch (AC-1, AC-6) — fire and forget; component shows loading state
    const source = getDataSource();
    const store = useMarketDataStore.getState();
    store.setSymbolInfo(meta);
    if (store.symbol !== ticker) {
      if (store.symbol !== null) {
        store.teardown(source);
      }
      void store.initMarketData(source, ticker);
    }

    return meta;
  },

  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <p className="text-2xl font-cypher text-primary">Symbol Not Found</p>
      <p className="text-sm text-muted-foreground">
        The trading pair you requested is not supported.
      </p>
      <a
        href="/symbol/BTCUSDT"
        className="px-4 py-2 rounded bg-primary text-primary-foreground font-mono text-sm"
      >
        Go to BTCUSDT
      </a>
    </div>
  ),

  component: RouteComponent,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function RouteComponent() {
  const meta = Route.useLoaderData() as SymbolInfo;
  const { tab: tabParam } = Route.useSearch() as SymbolSearch;
  const tab = tabParam ?? "book";

  // Sync UI store from URL search params (for deep-tree components)
  useUIStore.getState().syncFromSearch(tab);

  return (
    <ErrorBoundary>
      <title>
        {meta.base}/{meta.quote} | Flow
      </title>
      <TerminalLayout symbol={meta.symbol} tab={tab} />
    </ErrorBoundary>
  );
}
