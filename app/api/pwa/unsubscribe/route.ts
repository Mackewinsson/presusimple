export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { removeSub } from "@/lib/pushStore";

export async function POST(req: Request) {
  const { endpoint } = await req.json();
  if (endpoint) removeSub(endpoint);
  return NextResponse.json({ ok: true });
}
