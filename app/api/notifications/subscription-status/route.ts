import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

/**
 * @swagger
 * /api/notifications/subscription-status:
 *   get:
 *     summary: Get the current user's push subscription status
 *     description: Returns whether the authenticated user has a push subscription stored in the database, and its endpoint. Used by the client to re-sync the browser subscription after server-side pruning.
 *     responses:
 *       200:
 *         description: Subscription status
 *       401:
 *         description: Not authenticated
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email })
      .select("pushSubscription notificationEnabled")
      .lean<{ pushSubscription?: { endpoint?: string }; notificationEnabled?: boolean }>();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const endpoint = user.pushSubscription?.endpoint ?? null;

    return NextResponse.json({
      subscribed: Boolean(endpoint),
      endpoint,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
