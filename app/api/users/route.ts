import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

// GET /api/users - Get all users or filter by email
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/users - Connecting to database...");
    await dbConnect();
    console.log("GET /api/users - Database connected");

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    console.log("GET /api/users - Email:", email);

    if (email) {
      // Filter by email
      console.log("GET /api/users - Searching for user with email:", email);
      const user = await User.findOne({ email }).select("-__v");
      console.log("GET /api/users - Found user:", user ? user._id : "null");
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
    console.log("POST /api/users - Connecting to database...");
    await dbConnect();
    console.log("POST /api/users - Database connected");

    const body = await request.json();
    console.log("POST /api/users - Request body:", body);

    const { email, name } = body;

    if (!email) {
      console.log("POST /api/users - Email is required");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    console.log("POST /api/users - Checking if user exists:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("POST /api/users - User already exists:", existingUser._id);
      return NextResponse.json(existingUser);
    }

    console.log("POST /api/users - Creating new user:", { email, name });
    const user = new User({
      email,
      name: name || "Test User",
      isPaid: false,
    });

    const savedUser = await user.save();
    console.log("POST /api/users - User created successfully:", savedUser._id);
    return NextResponse.json(savedUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Update user subscription status
export async function PATCH(request: NextRequest) {
  try {
    console.log("PATCH /api/users - Connecting to database...");
    await dbConnect();
    console.log("PATCH /api/users - Database connected");

    const body = await request.json();
    console.log("PATCH /api/users - Request body:", body);

    const {
      email,
      stripeCustomerId,
      stripeSubscriptionId,
      isPaid,
      trialStart,
      trialEnd,
    } = body;

    if (!email) {
      console.log("PATCH /api/users - Email is required");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Update user subscription fields
    console.log("PATCH /api/users - Updating user subscription:", email);
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        ...(stripeCustomerId && { stripeCustomerId }),
        ...(stripeSubscriptionId && { stripeSubscriptionId }),
        ...(typeof isPaid !== "undefined" && { isPaid }),
        ...(trialStart && { trialStart: new Date(trialStart) }),
        ...(trialEnd && { trialEnd: new Date(trialEnd) }),
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log("PATCH /api/users - User not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(
      "PATCH /api/users - User updated successfully:",
      updatedUser._id
    );
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
