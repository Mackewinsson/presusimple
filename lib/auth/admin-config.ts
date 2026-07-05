const DEFAULT_ADMIN_EMAILS = ["mackewinsson@gmail.com"];

function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getAuthorizedAdminEmails(): string[] {
  const fromAdminEnv = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (fromAdminEnv.length > 0) {
    return fromAdminEnv;
  }

  const fromPublicEnv = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
  if (fromPublicEnv.length > 0) {
    return fromPublicEnv;
  }

  return DEFAULT_ADMIN_EMAILS.map((email) => email.toLowerCase());
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAuthorizedAdminEmails().includes(email.trim().toLowerCase());
}
