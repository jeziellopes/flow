import { useId } from "react";
import { Select } from "@/ui/select";

interface GroupingSelectProps {
  value: number;
  options: number[];
  onChange: (tickSize: number) => void;
}

/**
 * Compact price-grouping selector for the order book controls bar.
 * Uses the DS Select primitive with a compact size override (h-6, text-[10px]).
 * Renders its own inline label so it can be dropped into any flex row.
 */
export function GroupingSelect({ value, options, onChange }: GroupingSelectProps) {
  const id = useId();

  return (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[10px] text-muted-foreground cursor-default select-none"
      >
        Group
      </label>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-6 w-auto text-[10px] font-mono px-1 py-0"
        aria-label="Price grouping"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
    </div>
  );
}
