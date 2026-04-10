import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  `
    inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wide
    font-semibold
  `,
  {
    variants: {
      status: {
        running: "bg-trading-bid-muted text-trading-bid",
        paused: "bg-muted text-muted-foreground",
        stopped: "bg-trading-ask-muted text-trading-ask",
        active: "bg-trading-bid-muted text-trading-bid",
        filled: "bg-trading-profit/10 text-trading-profit",
        open: "bg-primary/10 text-primary",
        cancelled: "bg-muted text-muted-foreground",
        pending: "bg-muted text-muted-foreground",
        connected: "bg-trading-bid-muted text-trading-bid",
        reconnecting: "bg-trading-reconnecting-bg text-trading-reconnecting",
        disconnected: "bg-trading-ask-muted text-trading-ask",
      },
    },
    defaultVariants: { status: "pending" },
  },
);

export type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  className?: string;
  children?: React.ReactNode;
};

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>{children ?? status}</span>
  );
}
