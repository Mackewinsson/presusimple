"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import CurrencySelector from "@/components/CurrencySelector";
import { AdminNavLink } from "@/components/admin/AdminNavLink";

export function BudgetQuickActions() {
  return (
    <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-50 flex items-center gap-2 hidden md:flex">
      <CurrencySelector />
      <AdminNavLink variant="icon" />
      <Link
        href="/budget/settings"
        className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-colors"
      >
        <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
      </Link>
    </div>
  );
}
