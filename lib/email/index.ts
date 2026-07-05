import type { ReactElement } from "react";
import { Resend } from "resend";
import { PasswordResetEmail } from "./templates/PasswordResetEmail";
import { WelcomeEmail } from "./templates/WelcomeEmail";
import { TrialExpiryEmail } from "./templates/TrialExpiryEmail";
import { getAppUrl, getFromAddress, isEmailConfigured } from "./constants";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set in environment variables");
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

async function sendEmail(params: {
  to: string;
  subject: string;
  react: ReactElement;
}): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[email] Skipping send — RESEND_API_KEY or RESEND_FROM not set");
      return { success: true, skipped: true };
    }
    return { success: false, error: "Email is not configured" };
  }

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: params.subject,
      react: params.react,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Send failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: "Reset your Presusimple password",
    react: PasswordResetEmail({ resetUrl }),
  });
}

export async function sendWelcomeEmail(
  to: string,
  name?: string | null
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const appUrl = getAppUrl();

  return sendEmail({
    to,
    subject: "Welcome to Presusimple",
    react: WelcomeEmail({ name: name ?? "", appUrl }),
  });
}

export async function sendTrialExpiryEmail(
  to: string,
  name: string | null | undefined,
  daysLeft: number
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const subject =
    daysLeft <= 0
      ? "Your Presusimple trial has ended"
      : `Your Presusimple trial ends in ${daysLeft} days`;

  return sendEmail({
    to,
    subject,
    react: TrialExpiryEmail({ name: name ?? "", daysLeft, appUrl }),
  });
}

export { isEmailConfigured, getAppUrl } from "./constants";
export {
  generatePasswordResetToken,
  hashPasswordResetToken,
  verifyPasswordResetToken,
  getPasswordResetExpiry,
  PASSWORD_RESET_EXPIRY_MS,
} from "./password-reset-token";
