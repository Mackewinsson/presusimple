"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
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
  Zap,
  Shield,
  BarChart3
} from "lucide-react";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { 
        callbackUrl: "/app",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  // Auto-advance steps for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const steps = [
    {
      icon: <Crown className="h-10 w-10 text-amber-400" />,
      title: "Professional Budgeting",
      description: "Enterprise-grade tools for personal finance management",
      progress: 25
    },
    {
      icon: <Sparkles className="h-10 w-10 text-purple-400" />,
      title: "AI-Powered Insights",
      description: "Advanced analytics and intelligent recommendations",
      progress: 50
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-green-400" />,
      title: "Smart Automation",
      description: "Automated categorization and expense tracking",
      progress: 75
    },
    {
      icon: <Target className="h-10 w-10 text-blue-400" />,
      title: "Ready to Transform",
      description: "Start your journey to financial freedom today",
      progress: 100
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Simple Budget
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              The professional budgeting platform that transforms your financial life with AI-powered insights and enterprise-grade tools.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <Badge variant="outline" className="border-amber-500 text-amber-400 px-4 py-2 text-sm font-medium">
              <Crown className="h-4 w-4 mr-2" />
              30-Day Free Trial
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400 px-4 py-2 text-sm font-medium">
              <Shield className="h-4 w-4 mr-2" />
              Enterprise Security
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-slate-400 font-medium">
            <span>Initializing your workspace...</span>
            <span>{currentStep + 1} of {steps.length}</span>
          </div>
          <Progress value={steps[currentStep]?.progress || 0} className="h-3 bg-slate-700" />
        </div>

        {/* Current Step */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm max-w-3xl mx-auto">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="flex justify-center">
              {steps[currentStep]?.icon}
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl text-white font-bold">
                {steps[currentStep]?.title}
              </CardTitle>
              <CardDescription className="text-lg text-slate-300 leading-relaxed">
                {steps[currentStep]?.description}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg">AI Budget Creation</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Describe your financial goals in natural language and our AI creates personalized budgets instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg">Advanced Analytics</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Get deep insights into spending patterns with professional-grade charts and reports.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg">Enterprise Security</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Bank-level encryption and security protocols protect your financial data at all times.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sign In Button */}
        <div className="text-center space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-12 py-4 text-lg shadow-2xl hover:shadow-amber-500/25 transition-all duration-300"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-slate-400 text-sm">
            Secure authentication powered by Google
          </p>
        </div>

        {/* Trial Info */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-slate-300 text-sm leading-relaxed">
              Your 30-day free trial includes all enterprise features. No credit card required. 
              Cancel anytime during your trial period.
            </p>
          </div>
          
          <p className="text-slate-400 text-xs">
            By continuing, you agree to our{" "}
            <a href="#" className="text-white hover:underline font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-white hover:underline font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
