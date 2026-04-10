import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Moon, Sun, Zap } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeId = "soft" | "night-city" | "maelstrom" | "corpo-ice" | "netrunner" | "flowa";
type ModeId = "dark" | "light" | "vibrant";

const THEME_STORAGE_KEY = "theme";
const MODE_STORAGE_KEY = "mode";

// One-time migration: copy old keys to new keys then remove old
(function migrateStorageKeys() {
  const oldTheme = localStorage.getItem("trading-theme");
  if (oldTheme && !localStorage.getItem("theme")) {
    localStorage.setItem("theme", oldTheme);
    localStorage.removeItem("trading-theme");
  }
  const oldMode = localStorage.getItem("trading-mode");
  if (oldMode && !localStorage.getItem("mode")) {
    localStorage.setItem("mode", oldMode);
    localStorage.removeItem("trading-mode");
  }
})();

const THEMES: { id: ThemeId; label: string; accent: string }[] = [
  { id: "soft", label: "Soft", accent: "oklch(0.62 0.22 280)" },
  { id: "night-city", label: "Night City", accent: "oklch(0.68 0.22 95)" },
  { id: "maelstrom", label: "Maelstrom", accent: "oklch(0.56 0.28 316)" },
  { id: "corpo-ice", label: "Corpo Ice", accent: "oklch(0.88 0.18 215)" },
  { id: "netrunner", label: "Netrunner", accent: "oklch(0.62 0.22 280)" },
  { id: "flowa", label: "Flowa", accent: "oklch(0.79 0.08  132)" },
];

const MODES: { id: ModeId; icon: ReactNode; label: string }[] = [
  { id: "dark", icon: <Moon size={11} />, label: "Dark" },
  { id: "light", icon: <Sun size={11} />, label: "Light" },
  { id: "vibrant", icon: <Zap size={11} />, label: "Vibrant" },
];

function applyTheme(theme: ThemeId, mode: ModeId) {
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
  el.setAttribute("data-mode", mode);
  if (mode === "light") el.classList.remove("dark");
  else el.classList.add("dark");
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  localStorage.setItem(MODE_STORAGE_KEY, mode);
}

export function ThemeDropdown() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const t =
      (localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null) ??
      (document.documentElement.getAttribute("data-theme") as ThemeId | null) ??
      "night-city";
    return THEMES.some((x) => x.id === t) ? (t as ThemeId) : "night-city";
  });
  const [mode, setModeState] = useState<ModeId>(() => {
    return (
      (localStorage.getItem(MODE_STORAGE_KEY) as ModeId | null) ??
      (document.documentElement.getAttribute("data-mode") as ModeId | null) ??
      "dark"
    );
  });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const current = THEMES.find((t) => t.id === theme);

  function selectTheme(t: ThemeId) {
    setThemeState(t);
    applyTheme(t, mode);
    setOpen(false);
  }

  function selectMode(m: ModeId) {
    setModeState(m);
    applyTheme(theme, m);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/40 hover:border-border transition-colors cursor-pointer text-muted-foreground"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: current?.accent }}
        />
        <span className="text-[10px] font-mono uppercase tracking-wider">
          {current?.label ?? theme}
        </span>
        <ChevronDown
          size={10}
          style={{
            transition: "transform 0.15s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border shadow-lg z-50 overflow-hidden bg-card">
          <div className="py-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTheme(t.id)}
                className={cn(
                  `
                    w-full flex items-center gap-2 px-3 py-1.5 text-xs
                    hover:bg-muted
                    transition-colors cursor-pointer text-left
                  `,
                  t.id === theme ? "text-primary" : "text-foreground",
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: t.accent }}
                />
                <span className="flex-1 font-mono">{t.label}</span>
                {t.id === theme && <Check size={10} />}
              </button>
            ))}
          </div>

          <div className="border-t border-border/40 px-3 py-2 flex items-center gap-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMode(m.id)}
                title={m.label}
                aria-label={m.label}
                className={cn(
                  `
                    flex items-center justify-center flex-1 h-6 rounded cursor-pointer
                    transition-colors
                  `,
                  m.id === mode
                    ? "bg-primary text-on-primary"
                    : "bg-transparent text-muted-foreground",
                )}
              >
                {m.icon}
              </button>
            ))}
          </div>

          <div className="border-t border-border/40 py-1">
            <Link
              to="/design-system"
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Design System
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
