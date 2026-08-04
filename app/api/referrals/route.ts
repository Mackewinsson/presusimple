import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    let user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate referral code if not already set
    if (!user.referralCode) {
      user.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
      await user.save();
    }

    const referredCount = await User.countDocuments({ referredBy: user.referralCode });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://presusimple.com";
    const referralLink = `${baseUrl}?ref=${user.referralCode}`;

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink,
      referredCount,
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
