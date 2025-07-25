"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Crown, DollarSign } from "lucide-react";

export default function WelcomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartBudgeting = () => {
    // Mark onboarding as complete in localStorage
    localStorage.setItem("onboardingComplete", "true");
    
    // Go directly to main app without any parameters
    // User will have immediate access to trial features
    router.replace("/budget");
  };

  // Show login page if no session
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center space-y-8 p-8 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex justify-center mb-4">
            <span className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-white text-slate-900 p-2 rounded-lg shadow-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome to Simple Budget!</h1>
          </div>
          <p className="text-lg text-slate-300 mb-6">
            Sign in to start managing your finances
          </p>
          <Button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-white text-slate-900 hover:bg-gray-100 font-semibold py-3 text-lg"
            size="lg"
          >
            Continue with Google
          </Button>
        </div>
      </div>
    );
  }

  // Show welcome for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-8 p-8 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex justify-center mb-4">
          <span className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8 text-white" />
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-white text-slate-900 p-2 rounded-lg shadow-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to Simple Budget!</h1>
        </div>
        <p className="text-lg text-slate-300 mb-6">
          You're all set up with your 30-day free trial. Start budgeting and take control of your finances!
        </p>
        <Button
          onClick={handleStartBudgeting}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-3 text-lg"
          size="lg"
        >
          Start Budgeting
        </Button>
      </div>
    </div>
  );
} 