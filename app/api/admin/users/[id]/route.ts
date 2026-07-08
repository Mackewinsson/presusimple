import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { requireAdminApi } from "@/lib/auth/admin";
import { getUserJoinedAt } from "@/lib/admin/user-dates";

function serializeAdminUser(user: {
  _id: unknown;
  email: string;
  name?: string;
  plan?: string;
  isPaid?: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  subscriptionType?: string;
  lemonSqueezyCustomerId?: string;
  lemonSqueezySubscriptionId?: string;
  streakCount?: number;
  lastActivityDate?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  currency?: string;
  decimalSeparator?: string;
  notificationEnabled?: boolean;
  password?: string;
}) {
  return {
    _id: String(user._id),
    email: user.email,
    name: user.name ?? "",
    plan: user.plan ?? "free",
    isPaid: user.isPaid ?? false,
    trialStart: user.trialStart ?? null,
    trialEnd: user.trialEnd ?? null,
    subscriptionType: user.subscriptionType ?? null,
    lemonSqueezyCustomerId: user.lemonSqueezyCustomerId ?? null,
    lemonSqueezySubscriptionId: user.lemonSqueezySubscriptionId ?? null,
    streakCount: user.streakCount ?? 0,
    lastActivityDate: user.lastActivityDate ?? null,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
    joinedAt: getUserJoinedAt({
      _id: String(user._id),
      createdAt: user.createdAt,
    })?.toISOString() ?? null,
    currency: user.currency ?? "USD",
    decimalSeparator: user.decimalSeparator ?? "dot",
    notificationEnabled: user.notificationEnabled ?? false,
    hasPassword: Boolean(user.password),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    await dbConnect();
    const user = await User.findById(id).select(
      "email name plan isPaid trialStart trialEnd subscriptionType lemonSqueezyCustomerId lemonSqueezySubscriptionId streakCount lastActivityDate lastLoginAt createdAt updatedAt currency decimalSeparator notificationEnabled password"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(serializeAdminUser(user));
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    ).select(
      "email name plan isPaid trialStart trialEnd subscriptionType lemonSqueezyCustomerId lemonSqueezySubscriptionId streakCount lastActivityDate lastLoginAt createdAt updatedAt currency decimalSeparator notificationEnabled password"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(serializeAdminUser(user));
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
