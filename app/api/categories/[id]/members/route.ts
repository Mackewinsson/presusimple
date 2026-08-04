import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import Category from "@/models/Category";
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

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({
      categoryId: category._id,
      categoryName: category.name,
      collaborators: category.collaborators || [],
    });
  } catch (error) {
    console.error("Error fetching category members:", error);
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
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const invitedUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (!category.collaborators) {
      category.collaborators = [];
    }

    const exists = category.collaborators.some(
      (c: any) => c.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (exists) {
      return NextResponse.json({ error: "User already invited to this category" }, { status: 400 });
    }

    category.collaborators.push({
      user: invitedUser?._id,
      email: email.toLowerCase().trim(),
      role,
      status: invitedUser ? "accepted" : "pending",
    });

    await category.save();

    return NextResponse.json({
      message: "Category collaborator added successfully",
      collaborators: category.collaborators,
    });
  } catch (error) {
    console.error("Error adding category member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (category.collaborators) {
      category.collaborators = category.collaborators.filter(
        (c: any) => c.email.toLowerCase() !== email.toLowerCase().trim()
      );
      await category.save();
    }

    return NextResponse.json({
      message: "Category collaborator removed",
      collaborators: category.collaborators,
    });
  } catch (error) {
    console.error("Error deleting category member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
