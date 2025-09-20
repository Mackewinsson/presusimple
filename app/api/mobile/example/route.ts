import { NextRequest, NextResponse } from "next/server";
import { verifyMobileJwt } from "@/lib/verifyMobileJwt";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  
  if (!token) {
    return NextResponse.json({ error: "Authorization header required" }, { status: 401 });
  }

  try {
    const user = await verifyMobileJwt(token);
    // Now you can use user.sub to identify the authenticated user
    return NextResponse.json({ 
      ok: true, 
      user: { id: user.sub, email: user.email },
      message: "Mobile authentication successful" 
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
