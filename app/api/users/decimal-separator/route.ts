import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { requireAuth } from "@/lib/auth-middleware";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

const VALID_VALUES = ["dot", "comma"] as const;

// GET /api/users/decimal-separator - Get user's decimal separator preference
export async function GET(request: NextRequest) {
  try {
    let userEmail: string | null = null;

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const authResult = requireAuth(request);
      if ("error" in authResult) {
        return authResult.error;
      }
      userEmail = authResult.user.email;
    } else {
      const session = await getServerSession();
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userEmail = session.user.email;
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userDoc = await User.findOne({ email: userEmail });
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const decimalSeparator = userDoc.decimalSeparator && VALID_VALUES.includes(userDoc.decimalSeparator as typeof VALID_VALUES[number])
      ? userDoc.decimalSeparator
      : "dot";

    return NextResponse.json({ decimalSeparator });
  } catch (error) {
    console.error("Error getting decimal separator:", error);
    return NextResponse.json(
      { error: "Failed to get decimal separator" },
      { status: 500 }
    );
  }
}

// PUT /api/users/decimal-separator - Update user's decimal separator preference
export async function PUT(request: NextRequest) {
  try {
    let userEmail: string | null = null;

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const authResult = requireAuth(request);
      if ("error" in authResult) {
        return authResult.error;
      }
      userEmail = authResult.user.email;
    } else {
      const session = await getServerSession();
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userEmail = session.user.email;
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { decimalSeparator } = body;

    if (!decimalSeparator || !VALID_VALUES.includes(decimalSeparator)) {
      return NextResponse.json(
        { error: "decimalSeparator must be 'dot' or 'comma'" },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { decimalSeparator },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ decimalSeparator: updatedUser.decimalSeparator });
  } catch (error) {
    console.error("Error updating decimal separator:", error);
    return NextResponse.json(
      { error: "Failed to update decimal separator" },
      { status: 500 }
    );
  }
}
