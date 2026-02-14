"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewport } from "@/hooks/useViewport";
import { useTranslation } from "@/lib/i18n";
import { Wallet, Plus, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBudgetBasePath, isBudgetAddPath } from "@/lib/budget-routes";

interface TabItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  translationKey: string;
  isActive?: (pathname: string) => boolean;
}

function buildTabItems(pathname: string): TabItem[] {
  const budgetBase = getBudgetBasePath(pathname);
  return [
    {
      href: `${budgetBase}/add`,
      icon: Plus,
      label: "Add",
      translationKey: "add",
      isActive: isBudgetAddPath,
    },
    {
      href: budgetBase,
      icon: Wallet,
      label: "Budget",
      translationKey: "budget",
      isActive: (p) =>
        p === budgetBase ||
        (p.startsWith(budgetBase + "/") && p !== budgetBase + "/settings" && p !== budgetBase + "/add"),
    },
    {
      href: "/history",
      icon: History,
      label: "History",
      translationKey: "history",
      isActive: (p) => p === "/history" || p.startsWith("/history/"),
    },
    {
      href: `${budgetBase}/settings`,
      icon: Settings,
      label: "Settings",
      translationKey: "settings",
      isActive: (p) => p === budgetBase + "/settings",
    },
  ];
}

export default function MobileBottomTab() {
  const { isMobile } = useViewport();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render on mobile devices
  if (!isMobile) {
    return null;
  }

  // Don't render on auth pages
  if (pathname.startsWith('/auth/') || pathname === '/' || pathname.startsWith('/welcome')) {
    return null;
  }

  // Use transform: translateZ(0) to force GPU compositing - fixes iOS Safari fixed
  // position bug where the tab bar drifts to the middle of the screen when scrolling.
  const navContent = (
    <nav
      className="fixed inset-x-0 bottom-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 pb-[env(safe-area-inset-bottom)]"
      style={{
        transform: "translateZ(0)",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-0 pb-2">
        {buildTabItems(pathname).map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive ? item.isActive(pathname) : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-0 flex-1 pt-2 pb-1 px-1 rounded-b-lg transition-all duration-200",
                "hover:bg-slate-100/50 dark:hover:bg-slate-800/50",
                "active:scale-95 active:bg-slate-200/50 dark:active:bg-slate-700/50",
              )}
            >
              {/* Active indicator line */}
              <span
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-full transition-all duration-200",
                  isActive ? "w-8 bg-accent" : "w-0 bg-transparent"
                )}
              />
              <Icon 
                className={cn(
                  "h-5 w-5 mb-1 transition-colors",
                  isActive ? "text-black dark:text-white" : "text-slate-600 dark:text-slate-400"
                )} 
              />
              <span 
                className={cn(
                  "text-xs font-medium truncate max-w-full transition-colors",
                  isActive 
                    ? "text-black dark:text-white" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                {t(item.translationKey as any)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  // Portal to document.body ensures no ancestor (overflow, transform, etc.) can
  // create a containing block that breaks fixed positioning on mobile scroll.
  if (mounted && typeof document !== "undefined") {
    return createPortal(navContent, document.body);
  }

  return null;
}
