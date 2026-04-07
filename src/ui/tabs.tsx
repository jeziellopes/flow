import { cva, type VariantProps } from "class-variance-authority";
import { createContext, use } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// ── CVA ───────────────────────────────────────────────────────────────────────

const tabListVariants = cva("flex", {
  variants: {
    variant: {
      pill: "gap-1.5 bg-muted p-1 rounded-md",
      underline: "border-b border-border",
      header: "min-h-9",
    },
  },
  defaultVariants: { variant: "pill" },
});

const tabVariants = cva(
  "cursor-pointer transition-colors select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]",
  {
    variants: {
      variant: {
        pill: "",
        underline: "px-3 py-2 text-sm -mb-px border-b-1",
        header:
          "self-stretch flex items-center px-3 text-xs leading-4 font-cypher font-semibold tracking-wide uppercase -mb-px border-b-1",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "underline",
        active: true,
        className: "border-primary text-foreground font-medium",
      },
      {
        variant: "underline",
        active: false,
        className: "border-transparent text-muted-foreground hover:text-foreground",
      },
      {
        variant: "header",
        active: true,
        className: "border-primary text-foreground",
      },
      {
        variant: "header",
        active: false,
        className: "border-transparent text-muted-foreground hover:text-foreground",
      },
    ],
    defaultVariants: { variant: "pill", active: false },
  },
);

// ── Context ───────────────────────────────────────────────────────────────────

type TabVariant = NonNullable<VariantProps<typeof tabListVariants>["variant"]>;

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: TabVariant;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error("<Tab> must be inside <TabList>");
  return ctx;
}

// ── TabList ───────────────────────────────────────────────────────────────────

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  variant?: TabVariant;
}

export function TabList({
  value,
  onValueChange,
  variant = "pill",
  className,
  children,
  ...props
}: TabListProps) {
  return (
    <TabsContext value={{ value, onValueChange, variant }}>
      <div role="tablist" className={cn(tabListVariants({ variant }), className)} {...props}>
        {children}
      </div>
    </TabsContext>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function Tab({ value, children, className, ...props }: TabProps) {
  const { value: activeValue, onValueChange, variant } = useTabsContext();
  const isActive = value === activeValue;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const tablist = e.currentTarget.closest('[role="tablist"]');
    const allTabs = Array.from(tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const idx = allTabs.findIndex((t) => t.dataset.tab === value);
    const next =
      e.key === "ArrowRight"
        ? allTabs[(idx + 1) % allTabs.length]
        : allTabs[(idx - 1 + allTabs.length) % allTabs.length];
    if (next?.dataset.tab) {
      onValueChange(next.dataset.tab);
      next.focus();
    }
    props.onKeyDown?.(e);
  };

  if (variant === "underline" || variant === "header") {
    return (
      <button
        type="button"
        role="tab"
        data-tab={value}
        aria-selected={isActive}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onValueChange(value)}
        onKeyDown={handleKeyDown}
        className={cn(tabVariants({ variant, active: isActive }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <Button
      type="button"
      role="tab"
      data-tab={value}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      intent={isActive ? "primary" : "segment"}
      size="sm"
      onClick={() => onValueChange(value)}
      onKeyDown={handleKeyDown}
      className={cn("flex-1 rounded-sm", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

// ── TabPanel ──────────────────────────────────────────────────────────────────

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue: string;
}

export function TabPanel({ value, activeValue, className, children, ...props }: TabPanelProps) {
  if (value !== activeValue) return null;
  return (
    <div role="tabpanel" className={cn(className)} {...props}>
      {children}
    </div>
  );
}
