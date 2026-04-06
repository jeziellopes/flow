import { cn } from "@/lib/utils";
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
        <button
          key={mode}
          type="button"
          title={title}
          onClick={() => onChange(mode)}
          className={cn(
            "h-6 px-1.5 flex items-center gap-px rounded text-[9px] font-mono tabular-nums",
            "transition-colors cursor-pointer select-none",
            value === mode
              ? "bg-primary/15 ring-1 ring-primary/30 text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <ViewModeIcon mode={mode} active={value === mode} />
        </button>
      ))}
    </div>
  );
}

function ViewModeIcon({ mode, active }: { mode: ViewMode; active: boolean }) {
  if (mode === "both") {
    return (
      <>
        <span className={cn(active ? "text-trading-bid" : "inherit")}>■</span>
        <span className={cn(active ? "text-trading-ask" : "inherit")}>■</span>
      </>
    );
  }
  if (mode === "bids") {
    return (
      <>
        <span className={cn(active ? "text-trading-bid" : "inherit")}>■</span>
        <span className={cn(active ? "text-trading-bid" : "inherit")}>■</span>
      </>
    );
  }
  // asks
  return (
    <>
      <span className={cn(active ? "text-trading-ask" : "inherit")}>■</span>
      <span className={cn(active ? "text-trading-ask" : "inherit")}>■</span>
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
