import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string;
  pnl?: number;
}

interface BotStatsGridProps {
  stats: StatItem[];
  className?: string;
}

export function BotStatsGrid({ stats, className }: BotStatsGridProps) {
  return (
    <div
      className={cn(
        `
          grid grid-cols-2 gap-3
          sm:grid-cols-4
          lg:grid-cols-8
        `,
        className,
      )}
    >
      {stats.map(({ label, value, pnl }) => (
        <div key={label} className="rounded-md border border-border/60 p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
          <p
            className={cn(
              "font-mono text-sm font-semibold",
              pnl !== undefined && (pnl >= 0 ? "text-trading-profit" : "text-trading-loss"),
            )}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
