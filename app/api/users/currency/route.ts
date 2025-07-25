import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

// GET /api/users/currency - Get user's currency preference
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ currency: user.currency || "USD" });
  } catch (error) {
    console.error("Error getting user currency:", error);
    return NextResponse.json(
      { error: "Failed to get user currency" },
      { status: 500 }
    );
  }
}

// PUT /api/users/currency - Update user's currency preference
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currency } = body;

    if (!currency) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { currency },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ currency: updatedUser.currency });
  } catch (error) {
    console.error("Error updating user currency:", error);
    return NextResponse.json(
      { error: "Failed to update user currency" },
      { status: 500 }
    );
  }
} 