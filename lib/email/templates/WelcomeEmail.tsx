import { Text } from "@react-email/components";
import * as React from "react";
import { EmailButton, EmailLayout, paragraphStyle } from "./shared";

interface WelcomeEmailProps {
  name: string;
  appUrl: string;
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  const displayName = name.trim() || "there";

  return (
    <EmailLayout
      preview="Welcome to Presusimple — start your free trial"
      heading={`Welcome, ${displayName}!`}
    >
      <Text style={paragraphStyle}>
        Thanks for joining Presusimple. You now have access to Pro features
        during your free trial — track spending, set budgets, and stay on top of
        your finances.
      </Text>
      <EmailButton href={`${appUrl}/budget`} label="Open Presusimple" />
      <Text style={paragraphStyle}>
        Need help getting started? Visit our blog for tips on zero-based
        budgeting.
      </Text>
    </EmailLayout>
  );
}
