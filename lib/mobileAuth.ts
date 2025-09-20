// lib/mobileAuth.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyMobileJwt } from "./verifyMobileJwt";

export type AuthResult = {
  userId: string;
  isMobile: boolean;
  email?: string;
};

/**
 * Authenticates a request using either mobile JWT or NextAuth session
 * @param request - The NextRequest object
 * @returns AuthResult with userId and authentication method
 * @throws Error if authentication fails
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // Check for mobile JWT first
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  
  if (token) {
    // Mobile authentication
    try {
      const user = await verifyMobileJwt(token);
      return {
        userId: user.sub,
        isMobile: true,
        email: user.email,
      };
    } catch (error) {
      throw new Error("Invalid mobile token");
    }
  } else {
    // Web authentication (existing NextAuth)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("No session");
    }
    return {
      userId: String(session.user.id),
      isMobile: false,
      email: session.user.email,
    };
  }
}

/**
 * Creates a standardized error response for authentication failures
 */
export function createAuthErrorResponse(message: string = "Authentication required") {
  return Response.json({ error: message }, { status: 401 });
}
