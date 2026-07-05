import { Text } from "@react-email/components";
import * as React from "react";
import { EmailButton, EmailLayout, paragraphStyle } from "./shared";

interface TrialExpiryEmailProps {
  name: string;
  daysLeft: number;
  appUrl: string;
}

export function TrialExpiryEmail({
  name,
  daysLeft,
  appUrl,
}: TrialExpiryEmailProps) {
  const displayName = name.trim() || "there";
  const isExpired = daysLeft <= 0;

  return (
    <EmailLayout
      preview={
        isExpired
          ? "Your Presusimple trial has ended"
          : `Your Presusimple trial ends in ${daysLeft} days`
      }
      heading={
        isExpired
          ? "Your trial has ended"
          : `Your trial ends in ${daysLeft} days`
      }
    >
      <Text style={paragraphStyle}>
        {isExpired
          ? `Hi ${displayName}, your free Pro trial on Presusimple has ended. Upgrade to keep all Pro features — budgets, history, and more.`
          : `Hi ${displayName}, your free Pro trial on Presusimple ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Upgrade now to keep uninterrupted access.`}
      </Text>
      <EmailButton href={`${appUrl}/budget`} label="Upgrade to Pro" />
      <Text style={paragraphStyle}>
        Questions? Reply to this email or contact us through the app settings.
      </Text>
    </EmailLayout>
  );
}
