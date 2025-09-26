"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewport } from "@/hooks/useViewport";
import { useTranslation } from "@/lib/i18n";
import { 
  Home, 
  History, 
  Settings, 
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  translationKey: string;
}

const tabItems: TabItem[] = [
  {
    href: "/budget",
    icon: Home,
    label: "Budget",
    translationKey: "budget"
  },
  {
    href: "/history",
    icon: History,
    label: "History",
    translationKey: "history"
  },
  {
    href: "/budget/settings",
    icon: Settings,
    label: "Settings",
    translationKey: "settings"
  }
];

export default function MobileBottomTab() {
  const { isMobile } = useViewport();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Only render on mobile devices
  if (!isMobile) {
    return null;
  }

  // Don't render on auth pages
  if (pathname.startsWith('/auth/') || pathname === '/' || pathname.startsWith('/welcome')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-2">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href === "/budget" && pathname.startsWith("/budget") && pathname !== "/budget/settings") ||
            (item.href === "/history" && pathname.startsWith("/history"));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200",
                "hover:bg-slate-100/50 dark:hover:bg-slate-800/50",
                "active:scale-95 active:bg-slate-200/50 dark:active:bg-slate-700/50",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 mb-1 transition-colors",
                  isActive && "text-blue-600 dark:text-blue-400"
                )} 
              />
              <span 
                className={cn(
                  "text-xs font-medium truncate max-w-full transition-colors",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                {t(item.translationKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
