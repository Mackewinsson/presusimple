export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { addSub } from "@/lib/pushStore";

export async function POST(req: Request) {
  const sub = await req.json();
  addSub(sub);
  return NextResponse.json({ ok: true }, { status: 201 });
}
