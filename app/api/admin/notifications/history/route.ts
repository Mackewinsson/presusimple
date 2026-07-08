import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { requireAdminApi } from "@/lib/auth/admin";
import { serializeNotificationBroadcast } from "@/lib/admin/notification-broadcast-utils";
import NotificationBroadcast from "@/models/NotificationBroadcast";

const HISTORY_LIMIT = 20;

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();

    const broadcasts = await NotificationBroadcast.find()
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .select(
        "title body recipientCount sentCount failedCount createdAt"
      )
      .lean<
        Array<{
          _id: unknown;
          title: string;
          body: string;
          recipientCount: number;
          sentCount: number;
          failedCount: number;
          createdAt: Date;
        }>
      >();

    return NextResponse.json(
      broadcasts.map((broadcast) => serializeNotificationBroadcast(broadcast))
    );
  } catch (error) {
    console.error("Error getting notification history:", error);
    return NextResponse.json(
      { error: "Failed to get notification history" },
      { status: 500 }
    );
  }
}
