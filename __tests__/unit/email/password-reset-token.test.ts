import {
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
  verifyPasswordResetToken,
  PASSWORD_RESET_EXPIRY_MS,
} from "@/lib/email/password-reset-token";

describe("password reset token helpers", () => {
  it("generates unique tokens", () => {
    const a = generatePasswordResetToken();
    const b = generatePasswordResetToken();
    expect(a).toHaveLength(64);
    expect(b).toHaveLength(64);
    expect(a).not.toBe(b);
  });

  it("hashes and verifies tokens", async () => {
    const token = generatePasswordResetToken();
    const hashed = await hashPasswordResetToken(token);

    expect(await verifyPasswordResetToken(token, hashed)).toBe(true);
    expect(await verifyPasswordResetToken("wrong-token", hashed)).toBe(false);
  });

  it("sets expiry approximately one hour ahead", () => {
    const before = Date.now();
    const expiry = getPasswordResetExpiry();
    const after = Date.now() + PASSWORD_RESET_EXPIRY_MS;

    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + PASSWORD_RESET_EXPIRY_MS - 1000);
    expect(expiry.getTime()).toBeLessThanOrEqual(after + 1000);
  });
});
