import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/mobile-example - Example protected route using JWT
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  const { user } = authResult;

  return NextResponse.json({
    message: "Mobile authentication successful",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    timestamp: new Date().toISOString(),
  });
}

// POST /api/mobile-example - Example protected route for creating data
export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  const { user } = authResult;
  const body = await request.json();

  return NextResponse.json({
    message: "Data created successfully",
    user: {
      id: user.id,
      email: user.email,
    },
    data: body,
    timestamp: new Date().toISOString(),
  });
}
