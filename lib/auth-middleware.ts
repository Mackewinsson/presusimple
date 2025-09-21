import { NextRequest } from "next/server";
import { verifyJwt, JwtPayload } from "./jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}

export function requireAuth(request: NextRequest): { user: JwtPayload } | { error: Response } {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return { 
      error: new Response(
        JSON.stringify({ error: "Authorization header required" }), 
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = verifyJwt(token);
    return { user };
  } catch (error) {
    return { 
      error: new Response(
        JSON.stringify({ error: "Invalid or expired token" }), 
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    };
  }
}

export function createAuthErrorResponse(message: string = "Authentication required") {
  return new Response(
    JSON.stringify({ error: message }), 
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

// Helper function to extract user from authenticated request
export function getAuthenticatedUser(request: NextRequest): JwtPayload | null {
  const authResult = requireAuth(request);
  if ("error" in authResult) {
    return null;
  }
  return authResult.user;
}
