import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import crypto from "crypto";
import { CodesStore } from "../_store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect");
  
  if (!redirect || typeof redirect !== "string" || !redirect.startsWith("myapp://")) {
    return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  // Issue a one-time code valid for 60s
  const code = crypto.randomUUID();
  const exp = Date.now() + 60_000;
  CodesStore.set(code, { 
    sub: String(session.user.id), 
    email: session.user.email ?? undefined, 
    exp 
  });

  // Best-effort cleanup
  setTimeout(() => CodesStore.del(code), 5 * 60_000).unref?.();

  const url = new URL(redirect);
  url.searchParams.set("code", code);
  
  return NextResponse.redirect(url.toString());
}
