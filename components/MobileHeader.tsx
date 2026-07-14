"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewport } from "@/hooks/useViewport";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreakWidget } from "@/components/streak/StreakWidget";
import PrivateModeToggle from "@/components/PrivateModeToggle";
import { getBudgetBasePath, getHistoryBasePath, isBudgetAddPath, isHistoryListPath, isHistorySubPath } from "@/lib/budget-routes";

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
  className?: string;
}

export default function MobileHeader({ 
  title, 
  showBackButton = true, 
  backHref,
  className 
}: MobileHeaderProps) {
  const { isMobile } = useViewport();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Only render on mobile devices
  if (!isMobile) {
    return null;
  }

  // Don't render on auth pages, landing page, or welcome page
  if (pathname.startsWith('/auth/') || pathname === '/' || pathname.startsWith('/welcome')) {
    return null;
  }

  const budgetBase = getBudgetBasePath(pathname);
  const historyBase = getHistoryBasePath(pathname);

  // Determine back href if not provided
  const getBackHref = () => {
    if (backHref) return backHref;
    if (isBudgetAddPath(pathname)) return budgetBase;
    if (pathname.startsWith(budgetBase + "/settings")) return budgetBase;
    if (isHistorySubPath(pathname)) return historyBase;
    if (isHistoryListPath(pathname)) return budgetBase;
    return budgetBase;
  };

  // Determine if back button should be shown
  const shouldShowBackButton = () => {
    if (!showBackButton) return false;
    if (pathname === budgetBase) return false;
    return (
      isBudgetAddPath(pathname) ||
      pathname.startsWith(budgetBase + "/settings") ||
      isHistoryListPath(pathname) ||
      isHistorySubPath(pathname)
    );
  };

  // Determine title if not provided
  const getTitle = () => {
    if (title) return title;
    if (isBudgetAddPath(pathname)) return t("addTransaction");
    if (pathname.startsWith(budgetBase + "/settings")) return t("settings");
    if (pathname.startsWith("/history") || pathname.startsWith("/es/history")) {
      if (isHistorySubPath(pathname) && pathname.includes("/insights")) {
        return t("viewInsights");
      }
      if (isHistorySubPath(pathname)) return t("budgetDetails");
      return t("budgetHistory");
    }
    if (pathname === budgetBase) return t("appName");
    return t("appName");
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border",
      "pt-[env(safe-area-inset-top)]",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {shouldShowBackButton() && (
            <Link
              href={getBackHref()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </Link>
          )}
          {shouldShowBackButton() && (
            <h1 className="text-lg font-semibold text-foreground">
              {getTitle()}
            </h1>
          )}
        </div>
        
        {/* Centered title for main budget page */}
        {!shouldShowBackButton() && (
          <h1 className="text-lg font-semibold text-foreground text-center flex-1">
            {getTitle()}
          </h1>
        )}
        
        <div className="flex items-center gap-2">
          {pathname === budgetBase && <StreakWidget />}
          <PrivateModeToggle />
          {/* Home button for quick access to main budget page */}
          {pathname !== budgetBase && !pathname.startsWith(budgetBase + "/") && (
            <Link
              href={budgetBase}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <Home className="h-4 w-4 text-foreground" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
