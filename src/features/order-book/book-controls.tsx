import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { GroupingSelect } from "./grouping-select";
import type { ViewMode } from "./use-order-book-panel-state";

// ---------------------------------------------------------------------------
// ViewModeToggle
// ---------------------------------------------------------------------------

interface ViewOption {
  mode: ViewMode;
  title: string;
}

const VIEW_OPTIONS: ViewOption[] = [
  { mode: "both", title: "Bids & Asks" },
  { mode: "asks", title: "Asks only" },
  { mode: "bids", title: "Bids only" },
];

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-0.5">
      {VIEW_OPTIONS.map(({ mode, title }) => (
        <Button
          key={mode}
          type="button"
          intent="segment"
          size="icon"
          title={title}
          onClick={() => onChange(mode)}
          className={cn(
            "flex-col gap-0",
            value === mode && "bg-primary/15 ring-1 ring-primary/30 text-foreground",
          )}
        >
          <ViewModeIcon mode={mode} active={value === mode} />
        </Button>
      ))}
    </div>
  );
}

function ViewModeIcon({ mode, active }: { mode: ViewMode; active: boolean }) {
  if (mode === "both") {
    return (
      <>
        <span className={cn("text-[7px] leading-none text-trading-ask")}>■</span>
        <span className={cn("text-[7px] leading-none text-trading-bid")}>■</span>
      </>
    );
  }
  if (mode === "bids") {
    return (
      <>
        <span className={cn("text-[7px] leading-none", active ? "text-trading-bid" : undefined)}>
          ■
        </span>
        <span className={cn("text-[7px] leading-none", active ? "text-trading-bid" : undefined)}>
          ■
        </span>
      </>
    );
  }
  // asks
  return (
    <>
      <span className={cn("text-[7px] leading-none", active ? "text-trading-ask" : undefined)}>
        ■
      </span>
      <span className={cn("text-[7px] leading-none", active ? "text-trading-ask" : undefined)}>
        ■
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// BookControls compound
// ---------------------------------------------------------------------------

interface BookControlsRootProps {
  children: React.ReactNode;
}

function BookControlsRoot({ children }: BookControlsRootProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1 border-b border-border shrink-0">
      {children}
    </div>
  );
}

export const BookControls = {
  Root: BookControlsRoot,
  ViewToggle: ViewModeToggle,
  GroupSelect: GroupingSelect,
};
