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
  { mode: "bids", title: "Bids only" },
  { mode: "asks", title: "Asks only" },
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
          className={cn(value === mode ? "opacity-100" : "opacity-40 hover:opacity-70")}
        >
          <ViewModeIcon mode={mode} />
        </Button>
      ))}
    </div>
  );
}

// SVG icons replicate Binance's order book type buttons exactly.
// Left column = side color indicator; right column = 3 neutral data rows.
// DS tokens: trading-bid (Buy), trading-ask (Sell), currentColor (IconNormal).
function ViewModeIcon({ mode }: { mode: ViewMode }) {
  if (mode === "both") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        role="presentation"
      >
        {/* Left col: top = ask, bottom = bid */}
        <path d="M2.667 2.667H7.333V7.333H2.667z" fill="var(--trading-ask)" />
        <path d="M2.667 8.667H7.333V13.333H2.667z" fill="var(--trading-bid)" />
        {/* Right col: 3 neutral rows */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.667 2.667H13.333V5.333H8.667zM8.667 6.667H13.333V9.333H8.667zM13.333 10.667H8.667V13.333H13.333z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (mode === "bids") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        role="presentation"
      >
        {/* Left col: full bid */}
        <path d="M2.667 2.667H7.333V13.333H2.667z" fill="var(--trading-bid)" />
        {/* Right col: 3 neutral rows */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.667 2.667H13.333V5.333H8.667zM8.667 6.667H13.333V9.333H8.667zM13.333 10.667H8.667V13.333H13.333z"
          fill="currentColor"
        />
      </svg>
    );
  }
  // asks
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      role="presentation"
    >
      {/* Left col: full ask */}
      <path d="M2.667 2.667H7.333V13.333H2.667z" fill="var(--trading-ask)" />
      {/* Right col: 3 neutral rows */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.667 2.667H13.333V5.333H8.667zM8.667 6.667H13.333V9.333H8.667zM13.333 10.667H8.667V13.333H13.333z"
        fill="currentColor"
      />
    </svg>
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
