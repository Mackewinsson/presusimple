"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Calendar,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { useUserData } from "@/lib/hooks/useUserData";

export default function WelcomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: user, isLoading } = useUserData();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Only auto-advance if user is authenticated
    if (!session) {
      return;
    }

    console.log("Welcome page - Session:", session);
    console.log("Welcome page - isNewUser:", session.isNewUser);

    // Auto-advance steps with different timing for the last step
    const delay = currentStep === 3 ? 5000 : 3000; // 5 seconds for last step
    
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Add smooth transition for the last step
        setIsTransitioning(true);
        setTimeout(() => {
          setShowWelcome(false);
          // For new users, they should see the budget creation section
          // The main app page will handle showing the budget setup
          console.log("Welcome complete, redirecting to /app");
          router.push("/app");
        }, 500); // 500ms transition delay
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStep, session]);

  const steps = [
    {
      icon: <Crown className="h-8 w-8 text-amber-400" />,
      title: "Welcome to Simple Budget!",
      description: "You're all set up with your 30-day free trial",
      progress: 25
    },
    {
      icon: <Sparkles className="h-8 w-8 text-purple-400" />,
      title: "AI-Powered Budgeting",
      description: "Create budgets using natural language with our AI assistant",
      progress: 50
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-400" />,
      title: "Smart Analytics",
      description: "Get insights into your spending patterns and trends",
      progress: 75
    },
    {
      icon: <Target className="h-8 w-8 text-blue-400" />,
      title: "Ready to Start!",
      description: "Let's create your first budget and take control of your finances",
      progress: 100
    }
  ];

  // Show login page if no session
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome to Simple Budget
              </h1>
              <p className="text-lg text-slate-300">
                Sign in to start managing your finances
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-white text-slate-900 hover:bg-gray-100 font-semibold py-3"
              size="lg"
            >
              Continue with Google
            </Button>
            
            <p className="text-center text-sm text-slate-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showWelcome) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 pt-20 transition-opacity duration-500 ${
      isTransitioning ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome, {session?.user?.name}!
            </h1>
            <p className="text-xl text-slate-300">
              Your account is ready and your free trial is active
            </p>
          </div>

          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="border-amber-500 text-amber-400">
              <Crown className="h-3 w-3 mr-1" />
              Pro Trial Active
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Calendar className="h-3 w-3 mr-1" />
              30 Days Free
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Setting up your account...</span>
            <span>{currentStep + 1} of {steps.length}</span>
          </div>
          <Progress value={steps[currentStep]?.progress || 0} className="h-2" />
        </div>

        {/* Current Step */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {steps[currentStep]?.icon}
            </div>
            <div>
              <CardTitle className="text-2xl text-white">
                {steps[currentStep]?.title}
              </CardTitle>
              <CardDescription className="text-lg text-slate-300 mt-2">
                {steps[currentStep]?.description}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <h3 className="font-semibold text-white">AI Budget Creation</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Describe your income and expenses in plain English, and our AI will create a personalized budget for you.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-white">Smart Analytics</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Get detailed insights into your spending patterns with advanced charts and analytics.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={() => router.push("/app")}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-3"
            size="lg"
            disabled={currentStep === 3 && isTransitioning}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {currentStep === 3 && isTransitioning ? "Redirecting..." : "Start Budgeting Now"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Trial Info */}
        <div className="text-center text-sm text-slate-400">
          <p>
            Your 30-day free trial includes all Pro features. No credit card required.
          </p>
          <p className="mt-1">
            You can upgrade anytime to continue after the trial ends.
          </p>
        </div>
      </div>
    </div>
  );
} 