"use client";

import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface NewUserOnboardingProps {
  onComplete: () => void;
}

export function NewUserOnboarding({ onComplete }: NewUserOnboardingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-8 p-8 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex justify-center mb-4">
          <span className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8 text-white" />
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Presusimple!</h1>
        <p className="text-lg text-slate-300 mb-6">
          You're all set up with your 30-day free trial. Start budgeting and take control of your finances!
        </p>
        <Button
          onClick={onComplete}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-3 text-lg"
          size="lg"
        >
          Start Budgeting
        </Button>
      </div>
    </div>
  );
} 