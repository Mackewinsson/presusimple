'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BudgetTemplateSelector from '@/components/budget/BudgetTemplateSelector';
// import SavingsGoalList from '@/components/savings/SavingsGoalList';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/app" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Budget
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <BudgetTemplateSelector />
          {/* <SavingsGoalList /> */}
        </div>
      </main>
    </div>
  );
}