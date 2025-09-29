export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { listSubs } from "@/lib/pushStore";
import { webpush } from "@/lib/webpush";

export async function POST(req: Request) {
  const body = await req.json();
  const payload = JSON.stringify(body || { title: "Simple Budget", body: "It works!", url: "/" });

  const subs = listSubs();
  await Promise.allSettled(subs.map((s) => webpush.sendNotification(s as any, payload)));

  return NextResponse.json({ sent: subs.length });
}
