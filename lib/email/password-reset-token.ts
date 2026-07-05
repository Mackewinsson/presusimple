import crypto from "node:crypto";
import { hashPassword, comparePassword } from "@/lib/password";

export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashPasswordResetToken(token: string): Promise<string> {
  return hashPassword(token);
}

export async function verifyPasswordResetToken(
  token: string,
  hashedToken: string
): Promise<boolean> {
  return comparePassword(token, hashedToken);
}

export function getPasswordResetExpiry(): Date {
  return new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
}
