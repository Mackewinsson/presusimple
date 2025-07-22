"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FEATURES } from "@/lib/features";
import { Crown, Lock, CheckCircle, XCircle } from "lucide-react";

export default function FeaturesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/signin");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return <div>Loading...</div>;
  }

  const plans = ["free", "pro"] as const;

  return (
    <div className="min-h-screen gradient-bg-dark">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Feature Flags Dashboard</h1>
          <p className="text-slate-300">
            Manage which features are available to different subscription plans
          </p>
        </div>

        <div className="grid gap-6">
          {/* Feature Overview */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Feature Overview</CardTitle>
              <CardDescription className="text-slate-300">
                All features and their plan availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(FEATURES).map(([key, feature]) => (
                  <div key={key} className="border border-white/10 rounded-lg p-4 bg-white/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{feature.label}</h3>
                        <p className="text-sm text-slate-300 mt-1">{feature.description}</p>
                      </div>
                      <Badge variant="outline" className="border-purple-500 text-purple-300">
                        {key}
                      </Badge>
                    </div>
                    
                                         <div className="flex items-center gap-4">
                       {plans.map((plan) => {
                         const hasAccess = feature.plans.includes(plan as any);
                         return (
                          <div key={plan} className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {hasAccess ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                              <span className={`text-sm font-medium ${
                                hasAccess ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {plan === "pro" ? (
                                  <span className="flex items-center gap-1">
                                    <Crown className="h-3 w-3" />
                                    Pro
                                  </span>
                                ) : (
                                  "Free"
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plan Comparison */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Plan Comparison</CardTitle>
              <CardDescription className="text-slate-300">
                What each plan includes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div key={plan} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      {plan === "pro" ? (
                        <Crown className="h-5 w-5 text-amber-400" />
                      ) : (
                        <Lock className="h-5 w-5 text-slate-400" />
                      )}
                      <h3 className={`font-semibold text-lg ${
                        plan === "pro" ? "text-amber-400" : "text-white"
                      }`}>
                        {plan === "pro" ? "Pro Plan" : "Free Plan"}
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                                             {Object.entries(FEATURES)
                         .filter(([_, feature]) => feature.plans.includes(plan as any))
                         .map(([key, feature]) => (
                          <div key={key} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-slate-300">{feature.label}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Feature Statistics</CardTitle>
              <CardDescription className="text-slate-300">
                Summary of feature distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-white/10 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {Object.keys(FEATURES).length}
                  </div>
                  <div className="text-sm text-slate-300">Total Features</div>
                </div>
                <div className="text-center p-4 border border-white/10 rounded-lg">
                                     <div className="text-2xl font-bold text-green-400">
                     {Object.entries(FEATURES).filter(([_, feature]) => 
                       feature.plans.includes("free" as any)
                     ).length}
                   </div>
                  <div className="text-sm text-slate-300">Free Features</div>
                </div>
                <div className="text-center p-4 border border-white/10 rounded-lg">
                                     <div className="text-2xl font-bold text-amber-400">
                     {Object.entries(FEATURES).filter(([_, feature]) => 
                       feature.plans.includes("pro" as any) && !feature.plans.includes("free" as any)
                     ).length}
                   </div>
                  <div className="text-sm text-slate-300">Pro-Only Features</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 