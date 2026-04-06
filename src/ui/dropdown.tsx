import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Dropdown — lightweight controlled/uncontrolled dropdown primitive.
// Handles click-outside and Escape key. Composes via sub-components.
//
// Usage:
//   <Dropdown>
//     <Dropdown.Trigger>Open</Dropdown.Trigger>
//     <Dropdown.Menu align="right">
//       <Dropdown.Item onSelect={() => {}} active>Option A</Dropdown.Item>
//       <Dropdown.Item onSelect={() => {}}>Option B</Dropdown.Item>
//     </Dropdown.Menu>
//   </Dropdown>
// ---------------------------------------------------------------------------

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

import { createContext, use } from "react";

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = use(DropdownContext);
  if (!ctx) throw new Error("Dropdown sub-components must be used inside <Dropdown>");
  return ctx;
}

interface DropdownProps {
  children: ReactNode;
  className?: string;
}

function DropdownRoot({ children, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <DropdownContext value={{ open, setOpen }}>
      <div ref={containerRef} className={cn("relative", className)}>
        {children}
      </div>
    </DropdownContext>
  );
}

interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { open, setOpen } = useDropdownContext();
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={() => setOpen(!open)}
      className={className}
    >
      {children}
    </button>
  );
}

interface DropdownMenuProps {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

function DropdownMenu({ children, align = "left", className }: DropdownMenuProps) {
  const { open } = useDropdownContext();
  if (!open) return null;
  return (
    <ul
      role="listbox"
      className={cn(
        "absolute top-full mt-1 z-50 min-w-full rounded border border-border bg-card shadow-lg py-0.5",
        align === "right" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </ul>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onSelect: () => void;
  active?: boolean;
  className?: string;
}

function DropdownItem({ children, onSelect, active, className }: DropdownItemProps) {
  const { setOpen } = useDropdownContext();
  return (
    <li
      role="option"
      aria-selected={active}
      onClick={() => {
        onSelect();
        setOpen(false);
      }}
      className={cn(
        "px-2.5 py-1 cursor-pointer transition-colors",
        active
          ? "text-foreground bg-primary/10"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </li>
  );
}

export const Dropdown = {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Item: DropdownItem,
};
