import { cn } from "@/lib/utils";
import { Dropdown } from "@/ui/dropdown";

interface GroupingSelectProps {
  value: number;
  options: number[];
  onChange: (tickSize: number) => void;
}

/**
 * Compact price-grouping dropdown for the order book controls bar.
 * Uses the DS Dropdown primitive — consistent focus, keyboard, and click-outside handling.
 */
export function GroupingSelect({ value, options, onChange }: GroupingSelectProps) {
  return (
    <Dropdown.Root className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] text-muted-foreground select-none">Group</span>

      <Dropdown.Trigger
        className={cn(
          "h-6 px-1.5 flex items-center gap-1 font-mono text-[10px] tabular-nums",
          "rounded border border-input bg-input text-foreground",
          "cursor-pointer transition-colors select-none",
          "hover:border-ring/60",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]",
        )}
      >
        <span>{value}</span>
        <span className="text-[8px] text-muted-foreground">▾</span>
      </Dropdown.Trigger>

      <Dropdown.Menu align="right" className="text-[10px] font-mono tabular-nums">
        {options.map((opt) => (
          <Dropdown.Item key={opt} onSelect={() => onChange(opt)} active={opt === value}>
            {opt}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown.Root>
  );
}
