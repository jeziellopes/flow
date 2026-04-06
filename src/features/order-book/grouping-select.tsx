import { useId } from "react";
import { Label } from "@/ui/label";
import { Select } from "@/ui/select";

interface GroupingSelectProps {
  value: number;
  options: number[];
  onChange: (tickSize: number) => void;
}

/**
 * Price grouping selector for the order book.
 * Uses DS Select + Label components with proper htmlFor/id association.
 *
 * @example
 * <GroupingSelect value={tickSize} options={options} onChange={setTickSize} />
 */
export function GroupingSelect({ value, options, onChange }: GroupingSelectProps) {
  const id = useId();

  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={id} className="mb-0 font-mono text-[10px] cursor-default">
        Group
      </Label>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-6 w-auto text-[10px] font-mono px-1 py-0 border-border/60 bg-muted/60"
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
