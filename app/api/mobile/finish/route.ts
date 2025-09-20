import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { CodesStore } from "../_store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect");
  
  console.log('=== MOBILE FINISH ROUTE CALLED ===');
  console.log('Mobile finish route called with redirect:', redirect);
  console.log('Request URL:', request.url);
  
  if (!redirect || typeof redirect !== "string" || !redirect.startsWith("exp://")) {
    console.error('Invalid redirect URL:', redirect);
    return NextResponse.json({ error: "Invalid redirect" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  console.log('Session check result:', { 
    hasSession: !!session, 
    hasUser: !!session?.user, 
    hasUserId: !!session?.user?.id,
    userEmail: session?.user?.email 
  });
  
  if (!session?.user?.id) {
    console.error('No session found - redirecting to signin');
    // If no session, redirect to signin with the same callback URL
    const signinUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/signin?callbackUrl=${encodeURIComponent(request.url)}`;
    return NextResponse.redirect(signinUrl);
  }

  console.log('Session found for user:', session.user.email);
  console.log('Session details:', { id: session.user.id, email: session.user.email, name: session.user.name });

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
  
  console.log('Redirecting to:', url.toString());
  console.log('Code generated:', code);
  console.log('Code stored in memory store');
  
  return NextResponse.redirect(url.toString());
}
