import { Link } from "@tanstack/react-router";
import { ChevronRight, Pause, Play, Plus, Square } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { BotConfigForm, type BotConfigFormData } from "./bot-config-form";
import { BotSparkline } from "./bot-sparkline";
import type { BotInstance, BotStatus } from "./types";

interface BotManagerPanelProps {
  bots: BotInstance[];
  onStatusChange: (id: string, status: BotStatus) => void;
  onCreateBot?: (data: BotConfigFormData) => void | Promise<void>;
}

function statusClasses(status: BotInstance["status"]): string {
  if (status === "running") return "text-trading-bid bg-trading-bid-muted";
  if (status === "paused") return "text-muted-foreground bg-muted";
  return "text-trading-ask bg-trading-ask-muted";
}

export function BotManagerPanel({ bots, onStatusChange, onCreateBot }: BotManagerPanelProps) {
  const [showConfigForm, setShowConfigForm] = useState(false);
  const runningCount = bots.filter((b) => b.status === "running").length;
  const totalPnl = bots.reduce((sum, b) => sum + b.realizedPnl + b.unrealizedPnl, 0);
  const totalTrades = bots.reduce((sum, b) => sum + b.tradeCount, 0);
  const totalWins = bots.reduce((sum, b) => sum + b.winCount, 0);
  const winRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(0) : "0";

  return (
    <div>
      {/* Aggregate stats header */}
      <div className="px-3 pt-2 pb-1.5">
        <p className="text-[10px] font-mono text-muted-foreground">
          {runningCount} running ·{" "}
          <span className={totalPnl >= 0 ? "text-trading-profit" : "text-trading-loss"}>
            {totalPnl >= 0 ? "+" : ""}
            {totalPnl.toFixed(2)} total P&L
          </span>{" "}
          · {winRate}% win rate
        </p>
        {onCreateBot && (
          <Button
            intent="primary"
            size="sm"
            type="button"
            onClick={() => setShowConfigForm(true)}
            className="mt-1.5 gap-1"
          >
            <Plus size={12} />
            New Bot
          </Button>
        )}
      </div>

      {/* Bot config form */}
      {showConfigForm && onCreateBot && (
        <div className="px-3 pb-2">
          <BotConfigForm
            onSubmit={async (data) => {
              await onCreateBot(data);
              setShowConfigForm(false);
            }}
            onCancel={() => setShowConfigForm(false)}
          />
        </div>
      )}

      {/* Bot table */}
      <div className="px-3 pb-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              {[
                "Name",
                "Strategy",
                "Symbol",
                "Status",
                "P&L",
                "Win%",
                "Sparkline",
                "Actions",
                "",
              ].map((col) => (
                <th
                  key={col}
                  className="px-2 py-1.5 text-left text-[10px] text-muted-foreground font-normal uppercase tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => {
              const pnl = bot.realizedPnl + bot.unrealizedPnl;
              const winPct =
                bot.tradeCount > 0
                  ? `${((bot.winCount / bot.tradeCount) * 100).toFixed(0)}%`
                  : "0%";
              return (
                <tr
                  key={bot.id}
                  className="border-t border-border/40 hover:bg-muted/30 transition-colors"
                >
                  {/* Name */}
                  <td className="px-2 py-1.5">
                    <span className="font-mono font-semibold text-xs whitespace-nowrap">
                      {bot.name}
                    </span>
                  </td>

                  {/* Strategy */}
                  <td className="px-2 py-1.5">
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide bg-muted text-muted-foreground">
                      {bot.strategy}
                    </span>
                  </td>

                  {/* Symbol */}
                  <td className="px-2 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    {bot.symbol}
                  </td>

                  {/* Status */}
                  <td className="px-2 py-1.5">
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide font-semibold",
                        statusClasses(bot.status),
                      )}
                    >
                      {bot.status}
                    </span>
                  </td>

                  {/* P&L */}
                  <td className="px-2 py-1.5">
                    <span
                      className={cn(
                        "text-xs font-mono",
                        pnl >= 0 ? "text-trading-profit" : "text-trading-loss",
                      )}
                    >
                      {pnl >= 0 ? "+" : ""}
                      {pnl.toFixed(2)}
                    </span>
                  </td>

                  {/* Win% */}
                  <td className="px-2 py-1.5 text-xs">{winPct}</td>

                  {/* Sparkline */}
                  <td className="px-2 py-1.5">
                    <BotSparkline data={bot.pnlHistory} width={48} height={20} />
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      {bot.status === "running" && (
                        <>
                          <Button
                            intent="ghost"
                            size="icon"
                            type="button"
                            title="Pause"
                            aria-label="Pause bot"
                            onClick={() => onStatusChange(bot.id, "paused")}
                          >
                            <Pause size={11} />
                          </Button>
                          <Button
                            intent="ghost"
                            size="icon"
                            type="button"
                            className="text-trading-ask"
                            title="Stop"
                            aria-label="Stop bot"
                            onClick={() => onStatusChange(bot.id, "stopped")}
                          >
                            <Square size={11} />
                          </Button>
                        </>
                      )}
                      {bot.status === "paused" && (
                        <>
                          <Button
                            intent="ghost"
                            size="icon"
                            type="button"
                            className="text-trading-bid"
                            title="Run"
                            aria-label="Run bot"
                            onClick={() => onStatusChange(bot.id, "running")}
                          >
                            <Play size={11} />
                          </Button>
                          <Button
                            intent="ghost"
                            size="icon"
                            type="button"
                            className="text-trading-ask"
                            title="Stop"
                            aria-label="Stop bot"
                            onClick={() => onStatusChange(bot.id, "stopped")}
                          >
                            <Square size={11} />
                          </Button>
                        </>
                      )}
                      {bot.status === "stopped" && (
                        <Button
                          intent="ghost"
                          size="icon"
                          type="button"
                          className="text-trading-bid"
                          title="Run"
                          aria-label="Run bot"
                          onClick={() => onStatusChange(bot.id, "running")}
                        >
                          <Play size={11} />
                        </Button>
                      )}
                    </div>
                  </td>

                  {/* Details link */}
                  <td className="px-2 py-1.5">
                    <Link
                      to="/bots/$botId"
                      params={{ botId: bot.id }}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-sm shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="View details"
                    >
                      <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
