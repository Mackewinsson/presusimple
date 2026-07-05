import { Text } from "@react-email/components";
import * as React from "react";
import { EmailButton, EmailLayout, paragraphStyle } from "./shared";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout
      preview="Reset your Presusimple password"
      heading="Reset your password"
    >
      <Text style={paragraphStyle}>
        We received a request to reset your password. Click the button below to
        choose a new one. This link expires in 1 hour.
      </Text>
      <EmailButton href={resetUrl} label="Reset password" />
      <Text style={paragraphStyle}>
        If you did not request this, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
