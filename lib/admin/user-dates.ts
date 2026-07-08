/** Join date from createdAt, or ObjectId generation time for legacy users. */
export function getUserJoinedAt(user: {
  _id?: string | { toString(): string };
  createdAt?: Date | string | null;
}): Date | null {
  if (user.createdAt) {
    return new Date(user.createdAt);
  }
  if (!user._id) return null;
  const id = String(user._id);
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  return new Date(parseInt(id.substring(0, 8), 16) * 1000);
}

export function formatAdminDateTime(
  value?: Date | string | null,
  locale = "en-GB"
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatAdminRelative(
  value?: Date | string | null,
  locale = "en-GB"
): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(locale, { dateStyle: "medium" });
}
