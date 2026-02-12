import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { requireAuth } from "@/lib/auth-middleware";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { startOfDay, differenceInDays, format } from "date-fns";

export interface StreakResponse {
  streakCount: number;
  lastActivityDate: string | null;
}

async function getUserEmail(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const authResult = requireAuth(request);
    if ("error" in authResult) return null;
    return authResult.user.email;
  }
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

function getTodayUtc(): Date {
  return startOfDay(new Date());
}

function getDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function parseLastActivity(last: Date | undefined): Date | null {
  if (!last) return null;
  return startOfDay(new Date(last));
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserEmail(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { streakCount: 0, lastActivityDate: null } satisfies StreakResponse
      );
    }

    const today = getTodayUtc();
    const lastActivity = parseLastActivity(user.lastActivityDate);

    if (!lastActivity) {
      return NextResponse.json({
        streakCount: user.streakCount ?? 0,
        lastActivityDate: null,
      } satisfies StreakResponse);
    }

    const daysSince = differenceInDays(today, lastActivity);

    if (daysSince > 1) {
      return NextResponse.json({
        streakCount: 0,
        lastActivityDate: getDateKey(lastActivity),
      } satisfies StreakResponse);
    }

    return NextResponse.json({
      streakCount: user.streakCount ?? 0,
      lastActivityDate: getDateKey(lastActivity),
    } satisfies StreakResponse);
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = await getUserEmail(request);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = getTodayUtc();
    const lastActivity = parseLastActivity(user.lastActivityDate);

    if (lastActivity) {
      const daysSince = differenceInDays(today, lastActivity);

      if (daysSince === 0) {
        return NextResponse.json({
          streakCount: user.streakCount ?? 0,
          lastActivityDate: getDateKey(today),
        } satisfies StreakResponse);
      }

      if (daysSince === 1) {
        const newStreak = (user.streakCount ?? 0) + 1;
        await User.updateOne(
          { email: userEmail },
          { streakCount: newStreak, lastActivityDate: today }
        );
        return NextResponse.json({
          streakCount: newStreak,
          lastActivityDate: getDateKey(today),
        } satisfies StreakResponse);
      }
    }

    await User.updateOne(
      { email: userEmail },
      { streakCount: 1, lastActivityDate: today }
    );
    return NextResponse.json({
      streakCount: 1,
      lastActivityDate: getDateKey(today),
    } satisfies StreakResponse);
  } catch (error) {
    console.error("Error recording streak:", error);
    return NextResponse.json(
      { error: "Failed to record streak" },
      { status: 500 }
    );
  }
}
