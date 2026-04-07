import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { BotSettingsPanel } from "@/features/bots/bot-settings-panel";
import { BotStatsGrid } from "@/features/bots/bot-stats-grid";
import { BotStatusControls } from "@/features/bots/bot-status-controls";
import { BotTradesTable } from "@/features/bots/bot-trades-table";
import type { BotStatus } from "@/features/bots/types";
import { MOCK_BOT_TRADES, MOCK_BOTS } from "@/lib/mock-data";
import { ErrorBoundary } from "@/ui/error-boundary";
import { Skeleton } from "@/ui/skeleton";
import { StatusBadge } from "@/ui/status-badge";

const BotPnlChart = lazy(() => import("@/features/bots/bot-pnl-chart"));

export const Route = createFileRoute("/bots/$botId")({ component: BotDetailPage });

function BotDetailPage() {
  const { botId } = Route.useParams();
  const [bot, setBot] = useState(MOCK_BOTS.find((b) => b.id === botId));
  const trades = MOCK_BOT_TRADES[botId] ?? [];

  if (!bot)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-muted-foreground text-sm">Bot not found</p>
        <Link to="/" className="text-xs text-primary underline">
          Back to dashboard
        </Link>
      </div>
    );

  const totalPnl = bot.realizedPnl + bot.unrealizedPnl;
  const winRate = bot.tradeCount > 0 ? ((bot.winCount / bot.tradeCount) * 100).toFixed(0) : "0";
  const stats = [
    { label: "Strategy", value: bot.strategy.toUpperCase() },
    { label: "Symbol", value: bot.symbol },
    { label: "Total P&L", value: (totalPnl >= 0 ? "+" : "") + totalPnl.toFixed(2), pnl: totalPnl },
    { label: "Win Rate", value: `${winRate}%` },
    { label: "Trades", value: String(bot.tradeCount) },
    { label: "Wins", value: String(bot.winCount) },
    { label: "Realized", value: bot.realizedPnl.toFixed(2), pnl: bot.realizedPnl },
    { label: "Unrealized", value: bot.unrealizedPnl.toFixed(2), pnl: bot.unrealizedPnl },
  ];

  return (
    <ErrorBoundary>
      <div className="h-full overflow-y-auto bg-background">
        <title>{`${bot.name} | Flow`}</title>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              // biome-ignore lint/suspicious/noExplicitAny: codegen pending
              to={"/symbol/$symbol" as any}
              // biome-ignore lint/suspicious/noExplicitAny: codegen pending
              params={{ symbol: bot.symbol } as any}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={12} /> {bot.symbol}
            </Link>
            <span className="text-muted-foreground text-xs">/</span>
            <h1 className="font-brand font-semibold text-lg">{bot.name}</h1>
            <StatusBadge status={bot.status} />
            <div className="flex-1" />
            <BotStatusControls
              status={bot.status}
              onStatusChange={(s: BotStatus) =>
                setBot((prev) => (prev ? { ...prev, status: s } : prev))
              }
            />
          </div>
          <BotStatsGrid stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-md border border-border/60 p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
                P&L History
              </p>
              <Suspense fallback={<Skeleton variant="block" className="w-full h-[200px]" />}>
                <BotPnlChart pnlHistory={bot.pnlHistory} totalPnl={totalPnl} />
              </Suspense>
            </div>
            <BotSettingsPanel
              data={{
                name: bot.name,
                strategy: bot.strategy,
                symbol: bot.symbol,
                startedAt: bot.startedAt,
              }}
              onSave={(d) => setBot((prev) => (prev ? { ...prev, ...d } : prev))}
            />
          </div>
          <div className="rounded-md border border-border/60">
            <div className="px-4 py-3 border-b border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Trade History
              </p>
            </div>
            <BotTradesTable trades={trades} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
