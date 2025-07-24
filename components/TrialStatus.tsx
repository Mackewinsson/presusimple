"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { useUserData } from "@/lib/hooks/useUserData";
import { calculateTrialDaysLeft } from "@/lib/utils";

export function TrialStatus() {
  const { data: session } = useSession();
  const { data: user, isLoading } = useUserData();
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Don't render anything while loading to prevent flashing
  if (isLoading) {
    return null;
  }

  // Don't show for new users who just completed onboarding
  const onboardingComplete = typeof window !== 'undefined' ? localStorage.getItem("onboardingComplete") : null;
  
  // Don't show for users with active trial (new users)
  const hasActiveTrial = user?.trialEnd && calculateTrialDaysLeft(user.trialEnd) > 0;
  
  // Don't show for users without trial data who haven't completed onboarding
  // This prevents showing upgrade prompts during the onboarding process
  const hasNoTrialData = !user?.trialEnd && !user?.isPaid;
  if (onboardingComplete || hasActiveTrial || hasNoTrialData) {
    return null;
  }

  const trialDaysLeft = calculateTrialDaysLeft(user?.trialEnd || null);
  const isTrialActive = user?.trialEnd && trialDaysLeft > 0;
  const isTrialExpired = user?.trialEnd && trialDaysLeft <= 0;
  const isPaid = user?.isPaid;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to start subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  // Don't show anything for paid users
  if (isPaid) {
    return null;
  }

  // Show trial expired message
  if (isTrialExpired) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 mb-6">
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          Your free trial has expired. Upgrade to continue using Simple Budget.
        </AlertDescription>
        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="mt-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          size="sm"
        >
          {loading ? "Redirecting..." : "Upgrade Now"}
        </Button>
      </Alert>
    );
  }

  // Show trial active message
  if (isTrialActive) {
    return (
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                Free Trial Active
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-300">
              <Clock className="h-3 w-3 mr-1" />
              {trialDaysLeft === 1 ? "1 day left" : `${trialDaysLeft} days left`}
            </Badge>
          </div>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            You have access to all Pro features during your trial period.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-600 dark:text-amber-400">
              {trialDaysLeft <= 7 
                ? "Trial ending soon! Upgrade to keep all features."
                : "Enjoy your trial! You can upgrade anytime."
              }
            </div>
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              size="sm"
            >
              {loading ? "Redirecting..." : "Upgrade Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show upgrade prompt for users without trial
  return (
    <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-slate-200 dark:border-slate-800 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
            Unlock Pro Features
          </CardTitle>
        </div>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Start your 30-day free trial to access AI-powered budgeting and advanced features.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          size="sm"
        >
          {loading ? "Redirecting..." : "Start Free Trial"}
        </Button>
      </CardContent>
    </Card>
  );
} 