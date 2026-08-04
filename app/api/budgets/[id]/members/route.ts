import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import User from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const budget = await Budget.findById(id);
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({
      ownerId: budget.user,
      collaborators: budget.collaborators || [],
    });
  } catch (error) {
    console.error("Error fetching budget members:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { email, role = "editor" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const budget = await Budget.findById(id);
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Find if user already exists
    const invitedUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (!budget.collaborators) {
      budget.collaborators = [];
    }

    // Check if already invited
    const exists = budget.collaborators.some(
      (c: any) => c.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (exists) {
      return NextResponse.json({ error: "User already invited" }, { status: 400 });
    }

    budget.collaborators.push({
      user: invitedUser?._id,
      email: email.toLowerCase().trim(),
      role,
      status: invitedUser ? "accepted" : "pending",
    });

    await budget.save();

    return NextResponse.json({
      message: "Collaborator added successfully",
      collaborators: budget.collaborators,
    });
  } catch (error) {
    console.error("Error adding budget member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
