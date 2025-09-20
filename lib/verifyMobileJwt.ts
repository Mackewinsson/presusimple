// lib/verifyMobileJwt.ts
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.MOBILE_JWT_SECRET!);

export async function verifyMobileJwt(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { sub: string; email?: string };
}
