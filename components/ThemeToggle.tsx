"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // Don't render until theme is loaded to prevent hydration mismatch
  if (!theme) {
    return (
      <button
        className="p-2 rounded-lg border transition-all duration-200
          bg-white/80 border-gray-300 text-slate-900
          dark:bg-white/10 dark:border-white/20 dark:text-white
          hover:bg-gray-200 hover:dark:bg-white/20"
        aria-label="Loading theme"
        disabled
      >
        <div className="h-5 w-5 animate-pulse bg-gray-300 dark:bg-gray-600 rounded" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border transition-all duration-200
        bg-white/80 border-gray-300 text-slate-900
        dark:bg-white/10 dark:border-white/20 dark:text-white
        hover:bg-gray-200 hover:dark:bg-white/20"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-slate-900" />
      ) : (
        <Sun className="h-5 w-5 text-white" />
      )}
    </button>
  );
}
