import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { CodesStore } from "../_store";

const secret = process.env.MOBILE_JWT_SECRET || "dev-secret-change-me";
const JWT_SECRET = new TextEncoder().encode(secret);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  
  console.log('Exchange route called with code:', code);
  
  if (!code) {
    console.error('No code provided');
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  const entry = CodesStore.get(code);
  if (!entry) {
    console.error('Invalid code:', code);
    return NextResponse.json({ error: "invalid code" }, { status: 400 });
  }
  
  if (Date.now() > entry.exp) {
    console.error('Code expired:', code);
    CodesStore.del(code);
    return NextResponse.json({ error: "code expired" }, { status: 400 });
  }

  console.log('Code valid, generating JWT for user:', entry.sub);

  // consume the code
  CodesStore.del(code);

  const jwt = await new SignJWT({ sub: entry.sub, email: entry.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // adjust as needed
    .sign(JWT_SECRET);

  console.log('JWT generated successfully');

  return NextResponse.json({ 
    token: jwt,
    user: { id: entry.sub, email: entry.email }
  });
}
