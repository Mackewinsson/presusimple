"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BudgetSetupSection from "@/components/budget/BudgetSetupSection";
import DailySpendingTracker from "@/components/expenses/DailySpendingTracker";
import ResetButton from "@/components/ResetButton";
import Summary from "@/components/Summary";
import { DollarSign, History } from "lucide-react";

export default function BudgetApp() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 w-fit hover:opacity-90 transition-opacity"
            >
              <div className="bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-xl">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Simple Budget
              </h1>
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <History className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline text-sm sm:text-base">
                History
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2">
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <BudgetSetupSection />
            <ResetButton />
          </div>
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <DailySpendingTracker />
            <Summary />
          </div>
        </div>
      </main>

      <footer className="border-t py-3 sm:py-4 md:py-6 mt-4 sm:mt-6 md:mt-8 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Simple Budget. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
