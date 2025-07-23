"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { useUserSubscription } from "@/lib/hooks";
import { Clock, Crown, CreditCard } from "lucide-react";
import { calculateTrialDaysLeft, getSubscriptionStatus } from "@/lib/utils";

const SubscriptionButton = () => {
  const { data: session } = useSession();
  const { data: subscription, isLoading } = useUserSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start subscription");
      }
    } catch (err) {
      setError("Failed to start subscription");
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while loading to prevent flashing
  if (isLoading) {
    return null;
  }

  const trialDaysLeft = calculateTrialDaysLeft(subscription?.trialEnd || null);
  const subscriptionStatus = getSubscriptionStatus(subscription || {});

  // Show thank you message briefly when user becomes paid
  useEffect(() => {
    if (subscriptionStatus === "paid" && !showThankYou) {
      setShowThankYou(true);
      const timer = setTimeout(() => {
        setShowThankYou(false);
      }, 5000); // Show for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [subscriptionStatus, showThankYou]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  // User is paid - show brief thank you message then hide
  if (subscriptionStatus === "paid") {
    if (showThankYou) {
      return (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <Crown className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            You have an active subscription. Thank you for supporting Simple
            Budget!
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  // User is in trial - show trial banner
  if (subscriptionStatus === "trial") {
    return (
      <div className="space-y-3">
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {trialDaysLeft === 1
              ? "Your free trial ends tomorrow!"
              : `Your free trial ends in ${trialDaysLeft} days.`}
          </AlertDescription>
        </Alert>
        <Button
          onClick={handleSubscribe}
          disabled={loading || !session?.user?.email}
          className="w-full"
        >
          {loading ? "Redirecting..." : "Upgrade Now"}
        </Button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    );
  }

  // User has no subscription - show start trial button
  return (
    <div className="space-y-3">
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
        <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          Start your 30-day free trial to unlock all features!
        </AlertDescription>
      </Alert>
      <Button
        onClick={handleSubscribe}
        disabled={loading || !session?.user?.email}
        className="w-full"
      >
        {loading ? "Redirecting..." : "Start Free Trial"}
      </Button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default SubscriptionButton;
