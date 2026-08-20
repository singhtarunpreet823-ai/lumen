"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "relative flex h-9 w-16 items-center rounded-full border border-border bg-surface-2 px-1 transition-colors cursor-pointer",
        className,
      )}
    >
      <span
        className={cn(
          "absolute h-7 w-7 rounded-full bg-surface shadow-md transition-transform duration-300 flex items-center justify-center",
          theme === "dark" ? "translate-x-0" : "translate-x-7",
        )}
      >
        {theme === "dark" ? <Moon className="h-3.5 w-3.5 text-primary" /> : <Sun className="h-3.5 w-3.5 text-warning" />}
      </span>
    </button>
  );
}