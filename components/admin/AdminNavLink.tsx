"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { useIsAdmin } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AdminNavLinkProps {
  variant?: "header" | "icon";
  className?: string;
}

export function AdminNavLink({ variant = "header", className }: AdminNavLinkProps) {
  const isAdmin = useIsAdmin();
  const { t } = useTranslation();
  const pathname = usePathname();

  if (!isAdmin) {
    return null;
  }

  const isActive = pathname.startsWith("/admin");

  if (variant === "icon") {
    return (
      <Link
        href="/admin"
        aria-label={t("admin")}
        className={cn(
          "flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg transition-colors",
          isActive
            ? "bg-accent text-accent-foreground hover:bg-accent/90"
            : "bg-card text-foreground border border-border hover:bg-muted",
          className
        )}
      >
        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/admin"
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 transition-colors",
        isActive
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="hidden sm:inline text-sm sm:text-base">{t("admin")}</span>
    </Link>
  );
}
