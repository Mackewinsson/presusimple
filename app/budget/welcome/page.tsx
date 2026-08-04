"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { AppIcon } from "@/components/ui/app-icon";

function WelcomePanel({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-8 p-8 bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex justify-center mb-4">
          <span className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8" />
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <AppIcon size={24} />
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">{description}</p>
        <Button onClick={onAction} className="w-full font-semibold py-3 text-lg" size="lg">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartBudgeting = () => {
    localStorage.setItem("onboardingComplete", "true");
    router.replace("/budget");
  };

  if (!session) {
    return (
      <WelcomePanel
        title="Welcome to Presusimple!"
        description="Sign in to start managing your finances"
        actionLabel="Continue with Google"
        onAction={() => router.push("/auth/login")}
      />
    );
  }

  return (
    <WelcomePanel
      title="Welcome to Presusimple!"
      description="You're all set up with your 30-day free trial. Start budgeting and take control of your finances!"
      actionLabel="Start Budgeting"
      onAction={handleStartBudgeting}
    />
  );
}
