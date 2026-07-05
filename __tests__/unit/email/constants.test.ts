import {
  getAppUrl,
  getFromAddress,
  isEmailConfigured,
  APP_NAME,
} from "@/lib/email/constants";

describe("email constants", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("getAppUrl normalizes missing protocol", () => {
    process.env.NEXT_PUBLIC_APP_URL = "www.presusimple.com";
    expect(getAppUrl()).toBe("https://www.presusimple.com");
  });

  it("getFromAddress formats plain email with app name", () => {
    process.env.RESEND_FROM = "noreply@presusimple.com";
    expect(getFromAddress()).toBe(`${APP_NAME} <noreply@presusimple.com>`);
  });

  it("isEmailConfigured requires API key and from address", () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
    expect(isEmailConfigured()).toBe(false);

    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM = "noreply@presusimple.com";
    expect(isEmailConfigured()).toBe(true);
  });
});
