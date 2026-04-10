import { cn } from "@/lib/utils";

interface ConnectionBannerProps {
  status: "connected" | "reconnecting" | "disconnected";
}

export function ConnectionBanner({ status }: ConnectionBannerProps) {
  if (status === "connected") return null;

  const base = "w-full py-1 px-3 text-xs font-mono flex items-center gap-2 border-b";

  if (status === "reconnecting") {
    return (
      <div className={cn(base, "bg-trading-reconnecting-bg border-trading-reconnecting-border")}>
        <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0 bg-trading-reconnecting" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className={cn(base, "bg-trading-disconnected-bg border-trading-disconnected-border")}>
      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-trading-disconnected" />
      <span>Disconnected — check connection</span>
    </div>
  );
}
