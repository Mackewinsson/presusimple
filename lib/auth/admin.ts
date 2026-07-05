import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth/admin-config";

export { getAuthorizedAdminEmails, isAdminEmail } from "@/lib/auth/admin-config";

function sessionIsAdmin(session: {
  user?: { email?: string | null; isAdmin?: boolean };
} | null): boolean {
  if (!session?.user) return false;
  if (session.user.isAdmin === true) return true;
  return isAdminEmail(session.user.email);
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!sessionIsAdmin(session)) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/login?callbackUrl=/admin");
  }
  if (!sessionIsAdmin(session)) {
    redirect("/admin-access-denied");
  }
  return session;
}

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) {
    return {
      error: "Access denied. Admin privileges required.",
      status: 403 as const,
    };
  }
  return { session };
}
