"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Users, Award, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatAdminDateTime } from "@/lib/admin/user-dates";

interface ReferralItem {
  referralCode: string;
  referrer: { id: string; email: string; name?: string; plan?: string } | null;
  referredCount: number;
  referredUsers: { id: string; email: string; name?: string; plan?: string; createdAt?: string }[];
}

export function AdminReferralsPanel() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [totalReferrers, setTotalReferrers] = useState(0);
  const [totalReferredUsers, setTotalReferredUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [grantingId, setGrantingId] = useState<string | null>(null);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/referrals");
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referralList || []);
        setTotalReferrers(data.totalReferrers || 0);
        setTotalReferredUsers(data.totalReferredUsers || 0);
      }
    } catch (err) {
      console.error("Failed to load admin referrals:", err);
      toast.error("Failed to load referral statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleGrantBonus = async (userId: string, email: string) => {
    setGrantingId(userId);
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bonusDays: 30 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to grant bonus");
      }

      toast.success(`Granted 30 days Pro trial to ${email}`);
      fetchReferralData();
    } catch (err: any) {
      toast.error(err.message || "Error granting referral bonus");
    } finally {
      setGrantingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Loading referral data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Active Referrers</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent-foreground" />
              {totalReferrers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Referred Users</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-accent-foreground" />
              {totalReferredUsers}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Referral & Invite Program Management</CardTitle>
              <CardDescription>
                View all generated referral codes, referred users, and grant manual Pro bonuses.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchReferralData} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No referral activity recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <div>
                      <span className="font-semibold text-foreground">
                        {item.referrer?.email || "Unknown User"}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (Code: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{item.referralCode}</code>)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.referredCount} referred</Badge>
                      {item.referrer?.id && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGrantBonus(item.referrer!.id, item.referrer!.email)}
                          disabled={grantingId === item.referrer.id}
                          className="h-8 text-xs gap-1"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>+30 Days Pro Bonus</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {item.referredUsers.length > 0 && (
                    <div className="space-y-1.5 pl-2">
                      <div className="text-xs font-medium text-muted-foreground">Referred Friends:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.referredUsers.map((ru) => (
                          <div key={ru.id} className="flex items-center justify-between p-2 rounded border bg-card text-xs">
                            <span className="truncate">{ru.email}</span>
                            <Badge variant={ru.plan === "pro" ? "default" : "secondary"} className="text-[10px]">
                              {ru.plan || "free"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
