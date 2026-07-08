"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const toggleClassName =
  "p-2 rounded-lg border border-border bg-card text-foreground transition-all duration-200 hover:bg-muted";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // Don't render until theme is loaded to prevent hydration mismatch
  if (!theme) {
    return (
      <button className={toggleClassName} aria-label="Loading theme" disabled>
        <div className="h-5 w-5 animate-pulse bg-muted rounded" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={toggleClassName}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
