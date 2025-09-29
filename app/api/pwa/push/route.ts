export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { listSubs } from "@/lib/pushStore";
import { webpush } from "@/lib/webpush";
import { buildWebPushPayload, NotificationPayload } from "@/lib/notifications";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<NotificationPayload> | undefined;
  const payload = buildWebPushPayload({
    title: body?.title || "Simple Budget",
    body: body?.body || "It works!",
    icon: body?.icon || "/icons/icon-192x192.png",
    badge: body?.badge || "/icons/icon-72x72.png",
    url: body?.url || "/",
    defaultActionUrl: body?.defaultActionUrl || body?.url || "/",
    data: body?.data,
    actions: body?.actions,
    requireInteraction: body?.requireInteraction,
    silent: body?.silent,
    tag: body?.tag,
    renotify: body?.renotify,
    vibrate: body?.vibrate,
    mutable: body?.mutable,
    appBadge: body?.appBadge,
  });

  const subs = listSubs();
  await Promise.allSettled(subs.map((s) => webpush.sendNotification(s as any, JSON.stringify(payload))));

  return NextResponse.json({ sent: subs.length });
}
