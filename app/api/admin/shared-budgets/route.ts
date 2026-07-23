import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";

export async function GET() {
  try {
    const authResult = await requireAdminApi();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await dbConnect();

    // Find budgets with collaborators
    const sharedBudgets = await Budget.find({
      "collaborators.0": { $exists: true },
    })
      .populate("user", "email name")
      .select("user month year totalBudgeted totalAvailable collaborators createdAt");

    return NextResponse.json({
      totalSharedBudgets: sharedBudgets.length,
      sharedBudgets,
    });
  } catch (error) {
    console.error("Error fetching admin shared budgets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await requireAdminApi();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { budgetId, collaboratorEmail } = await request.json();
    if (!budgetId || !collaboratorEmail) {
      return NextResponse.json({ error: "budgetId and collaboratorEmail are required" }, { status: 400 });
    }

    await dbConnect();
    const budget = await Budget.findById(budgetId);
    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    if (budget.collaborators) {
      budget.collaborators = budget.collaborators.filter(
        (c: any) => c.email.toLowerCase() !== collaboratorEmail.toLowerCase().trim()
      );
      await budget.save();
    }

    return NextResponse.json({
      message: `Collaborator ${collaboratorEmail} removed from budget`,
      collaborators: budget.collaborators,
    });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
