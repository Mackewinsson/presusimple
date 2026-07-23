"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Check, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

export function ReferralCard() {
  const { t } = useTranslation();
  const [referralLink, setReferralLink] = useState("");
  const [referredCount, setReferredCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReferralData() {
      try {
        const res = await fetch("/api/referrals");
        if (res.ok) {
          const data = await res.json();
          setReferralLink(data.referralLink || "");
          setReferredCount(data.referredCount || 0);
        }
      } catch (err) {
        console.error("Failed to load referral info:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReferralData();
  }, []);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t("linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card via-card to-accent/5 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-accent/20 p-2 text-accent-foreground">
            <Gift className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{t("inviteFriends")}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {t("referralDesc")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            readOnly
            value={referralLink}
            className="font-mono text-xs bg-muted/30"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 shrink-0 hover:bg-accent hover:text-accent-foreground"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? t("linkCopied") : t("copyLink")}</span>
          </Button>
        </div>

        {referredCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-1">
            <Users className="h-3.5 w-3.5" />
            <span>
              {referredCount} {t("friendsJoined")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
