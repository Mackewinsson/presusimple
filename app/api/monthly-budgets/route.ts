import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import MonthlyBudget from "@/models/MonthlyBudget";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    if (userId) {
      // Get monthly budgets for specific user
      const monthlyBudgets = await MonthlyBudget.find({ user: userId }).sort({
        createdAt: -1,
      });
      return NextResponse.json(monthlyBudgets);
    } else {
      // Get all monthly budgets (for admin purposes)
      const monthlyBudgets = await MonthlyBudget.find({}).sort({
        createdAt: -1,
      });
      return NextResponse.json(monthlyBudgets);
    }
  } catch (error) {
    console.error("Error fetching monthly budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      month,
      year,
      categories,
      totalBudgeted,
      totalSpent,
      expensesCount,
    } = body;

    // Get the user ID
    const userRes = await fetch(
      `${request.nextUrl.origin}/api/users?email=${encodeURIComponent(
        session.user.email
      )}`
    );
    if (!userRes.ok) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const users = await userRes.json();
    const userId = users[0]?._id;

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const monthlyBudget = new MonthlyBudget({
      user: userId,
      name,
      month,
      year,
      categories,
      totalBudgeted,
      totalSpent,
      expensesCount,
    });

    const savedMonthlyBudget = await monthlyBudget.save();
    return NextResponse.json(savedMonthlyBudget, { status: 201 });
  } catch (error) {
    console.error("Error creating monthly budget:", error);
    return NextResponse.json(
      { error: "Failed to create monthly budget" },
      { status: 500 }
    );
  }
}
