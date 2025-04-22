import React from 'react';
import Link from 'next/link';
import BudgetSetupSection from '@/components/budget/BudgetSetupSection';
import DailySpendingTracker from '@/components/expenses/DailySpendingTracker';
import ResetButton from '@/components/ResetButton';
import Summary from '@/components/Summary';
import { DollarSign } from 'lucide-react';

export default function BudgetApp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 w-fit hover:opacity-90 transition-opacity">
            <div className="bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-xl">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Simple Budget
            </h1>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-6 sm:space-y-8">
            <BudgetSetupSection />
            <ResetButton />
          </div>
          <div className="space-y-6 sm:space-y-8">
            <DailySpendingTracker />
            <Summary />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4 sm:py-6 mt-6 sm:mt-8 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Simple Budget. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}