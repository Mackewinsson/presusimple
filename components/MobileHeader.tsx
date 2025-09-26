"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewport } from "@/hooks/useViewport";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Determine back href if not provided
  const getBackHref = () => {
    if (backHref) return backHref;
    
    // Default back navigation logic
    if (pathname.startsWith('/budget/settings')) return '/budget';
    if (pathname.startsWith('/history')) return '/budget';
    
    return '/budget';
  };

  // Determine if back button should be shown
  const shouldShowBackButton = () => {
    if (!showBackButton) return false;
    
    // Don't show back button on main budget page
    if (pathname === '/budget') return false;
    
    // Show back button on sub-pages
    return pathname.startsWith('/budget/settings') || pathname.startsWith('/history');
  };

  // Determine title if not provided
  const getTitle = () => {
    if (title) return title;
    
    if (pathname.startsWith('/budget/settings')) return t('settings');
    if (pathname.startsWith('/history')) return t('history');
    if (pathname === '/budget') return 'Simple Budget'; // Main budget page shows app title
    
    return 'Simple Budget';
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50",
      "pt-[env(safe-area-inset-top)]",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {shouldShowBackButton() && (
            <Link
              href={getBackHref()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </Link>
          )}
          {shouldShowBackButton() && (
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {getTitle()}
            </h1>
          )}
        </div>
        
        {/* Centered title for main budget page */}
        {!shouldShowBackButton() && (
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white text-center flex-1">
            {getTitle()}
          </h1>
        )}
        
        {/* Home button for quick access to main budget page */}
        {pathname !== '/budget' && !pathname.startsWith('/budget/') && (
          <Link
            href="/budget"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Home className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </Link>
        )}
      </div>
    </header>
  );
}
