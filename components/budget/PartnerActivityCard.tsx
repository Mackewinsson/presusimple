"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, ArrowUpRight, ShoppingCart } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useFormatMoney } from "@/lib/hooks/useFormatMoney";
import { useCurrentCurrency, useCurrentDecimalSeparator } from "@/lib/hooks";

interface PartnerActivityCardProps {
  expenses?: any[];
  currentUserId?: string | null;
  collaborators?: { email: string; role: string; status: string }[];
  categoryName?: string;
}

export function PartnerActivityCard({
  expenses = [],
  currentUserId,
  collaborators = [],
  categoryName,
}: PartnerActivityCardProps) {
  const { t } = useTranslation();
  const { formatAmount } = useFormatMoney();
  const currentCurrency = useCurrentCurrency();
  const decimalSeparator = useCurrentDecimalSeparator();

  if (!collaborators || collaborators.length === 0) {
    return null;
  }

  // Calculate spending per user
  let mySpent = 0;
  let partnerSpent = 0;
  const partnerExpenses: any[] = [];

  expenses.forEach((exp) => {
    const expenseUserId = typeof exp.user === "object" ? exp.user?._id?.toString() : exp.user?.toString();
    const isMine = currentUserId && expenseUserId === currentUserId.toString();

    if (isMine) {
      mySpent += exp.amount || 0;
    } else {
      partnerSpent += exp.amount || 0;
      partnerExpenses.push(exp);
    }
  });

  const totalSpent = mySpent + partnerSpent;
  const myPct = totalSpent > 0 ? Math.round((mySpent / totalSpent) * 100) : 50;
  const partnerPct = totalSpent > 0 ? 100 - myPct : 50;

  return (
    <Card className="glass-card hover-card border-accent/20 bg-muted/10 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-accent-foreground" />
            <span>{t("partnerActivity")}</span>
            {categoryName && (
              <Badge variant="outline" className="text-xs font-normal">
                {categoryName}
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {collaborators.length} partner{collaborators.length > 1 ? "s" : ""}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {t("sharedContributions")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Progress / Ratio Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="flex items-center gap-1 text-foreground">
              <User className="h-3 w-3 text-primary" /> {t("youSpent")}:{" "}
              <strong className="font-semibold">
                {formatAmount(mySpent, currentCurrency, decimalSeparator)}
              </strong>{" "}
              ({myPct}%)
            </span>
            <span className="flex items-center gap-1 text-foreground">
              <User className="h-3 w-3 text-accent-foreground" /> {t("partnerSpent")}:{" "}
              <strong className="font-semibold">
                {formatAmount(partnerSpent, currentCurrency, decimalSeparator)}
              </strong>{" "}
              ({partnerPct}%)
            </span>
          </div>

          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${myPct}%` }}
              title={`You: ${myPct}%`}
            />
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${partnerPct}%` }}
              title={`Partner: ${partnerPct}%`}
            />
          </div>
        </div>

        {/* Partner Recent Transactions */}
        <div className="space-y-2 pt-2 border-t text-xs">
          <div className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
            Partner Logged Transactions ({partnerExpenses.length})
          </div>

          {partnerExpenses.length === 0 ? (
            <p className="text-muted-foreground py-2 text-center text-xs">
              No transactions logged by partner yet this period.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {partnerExpenses.slice(0, 5).map((exp) => (
                <div
                  key={exp._id || exp.id}
                  className="flex items-center justify-between p-2 rounded border bg-card/60 hover:bg-card transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-foreground truncate">{exp.description}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 font-semibold text-foreground">
                    <span>{formatAmount(exp.amount, currentCurrency, decimalSeparator)}</span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      Partner
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
