"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Sparkles, 
  Target, 
  ArrowRight,
  CheckCircle,
  Zap,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NewUserOnboardingProps {
  onComplete: () => void;
}

export function NewUserOnboarding({ onComplete }: NewUserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const steps = [
    {
      icon: <Crown className="h-8 w-8 text-amber-400" />,
      title: "Welcome to Simple Budget!",
      description: "You're all set up with your 30-day free trial",
      progress: 25,
      action: "Get Started"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-purple-400" />,
      title: "AI-Powered Budgeting",
      description: "Create budgets using natural language with our AI assistant",
      progress: 50,
      action: "Try AI Budgeting"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-400" />,
      title: "Smart Analytics",
      description: "Get insights into your spending patterns and trends",
      progress: 75,
      action: "View Analytics"
    },
    {
      icon: <Target className="h-8 w-8 text-blue-400" />,
      title: "Ready to Start!",
      description: "Let's create your first budget and take control of your finances",
      progress: 100,
      action: "Create Budget"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Simple Budget!
            </h1>
            <p className="text-lg text-slate-300">
              Let's get you started with your first budget
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-400 font-medium">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round((currentStep + 1) / steps.length * 100)}% Complete</span>
          </div>
          <Progress value={steps[currentStep]?.progress || 0} className="h-2" />
        </div>

        {/* Current Step */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="flex justify-center">
              {steps[currentStep]?.icon}
            </div>
            <div className="space-y-3">
              <CardTitle className="text-2xl text-white font-bold">
                {steps[currentStep]?.title}
              </CardTitle>
              <CardDescription className="text-lg text-slate-300 leading-relaxed">
                {steps[currentStep]?.description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="border-amber-500 text-amber-400">
                <Crown className="h-3 w-3 mr-1" />
                30-Day Free Trial
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-3"
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {currentStep === steps.length - 1 ? "Start Budgeting" : steps[currentStep]?.action}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              {currentStep < steps.length - 1 && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  size="lg"
                >
                  Skip Tutorial
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
              <p className="text-xs text-slate-300">Natural language budget creation</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">Smart Analytics</h3>
              <p className="text-xs text-slate-300">Insights and spending patterns</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">Budget Tracking</h3>
              <p className="text-xs text-slate-300">Real-time expense monitoring</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 