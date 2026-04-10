import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const liveIndicatorVariants = cva("flex items-center gap-1.5", {
  variants: {
    status: {
      connected: "",
      reconnecting: "",
      disconnected: "",
    },
  },
  defaultVariants: { status: "connected" },
});

const dotVariants = cva("w-1.5 h-1.5 rounded-full", {
  variants: {
    status: {
      connected: "bg-trading-connected animate-pulse",
      reconnecting: "bg-trading-reconnecting animate-pulse",
      disconnected: "bg-trading-disconnected",
    },
  },
  defaultVariants: { status: "connected" },
});

const labelVariants = cva("text-[10px] font-mono uppercase", {
  variants: {
    status: {
      connected: "text-trading-connected",
      reconnecting: "text-trading-reconnecting",
      disconnected: "text-trading-disconnected",
    },
  },
  defaultVariants: { status: "connected" },
});

export type LiveIndicatorProps = VariantProps<typeof liveIndicatorVariants> & {
  className?: string | undefined;
};

const STATUS_LABEL: Record<string, string> = {
  connected: "Live",
  reconnecting: "Reconnecting",
  disconnected: "Offline",
};

export function LiveIndicator({ status, className }: LiveIndicatorProps) {
  return (
    <div className={cn(liveIndicatorVariants({ status }), className)}>
      <span className={dotVariants({ status })} />
      <span className={labelVariants({ status })}>{STATUS_LABEL[status ?? "connected"]}</span>
    </div>
  );
}
