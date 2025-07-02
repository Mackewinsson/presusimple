import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

// GET /api/users - Get all users or filter by email
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      // Filter by email
      const user = await User.findOne({ email }).select("-__v");
      return NextResponse.json(user ? [user] : []);
    } else {
      // Get all users
      const users = await User.find({}).select("-__v");
      return NextResponse.json(users);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    const user = new User({
      email,
      name: name || "Test User",
    });

    const savedUser = await user.save();
    return NextResponse.json(savedUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
