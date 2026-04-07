import type { SymbolInfo } from "@/lib/symbols";
import { cn } from "@/lib/utils";

export interface SymbolRowProps {
  info: SymbolInfo;
  active: boolean;
  onSelect: (symbol: string) => void;
}

export function SymbolRow({ info, active, onSelect }: SymbolRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(info.symbol)}
      className={cn(
        `
          w-full cursor-pointer text-left px-3 py-1.5 flex items-center gap-1
          hover:bg-muted/60
          transition-colors
        `,
        active && "text-primary bg-trading-bid-muted",
      )}
    >
      <span className="font-semibold tabular-nums">{info.base}</span>
      <span className="text-muted-foreground">/{info.quote}</span>
      {active && <span className="ml-auto text-[10px] text-primary">●</span>}
    </button>
  );
}
