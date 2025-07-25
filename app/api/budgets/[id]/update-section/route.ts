import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import Category from "@/models/Category";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await dbConnect();
    const body = await request.json();
    const { oldSectionName, newSectionName } = body;

    console.log("API: Section update request:", { id, oldSectionName, newSectionName });

    if (!oldSectionName || !newSectionName) {
      return NextResponse.json(
        { error: "Missing required fields: oldSectionName, newSectionName" },
        { status: 400 }
      );
    }

    // Find the budget
    const budget = await Budget.findById(id);
    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    console.log("API: Budget found:", {
      budgetId: budget._id,
      sections: budget.sections.map((s: any) => ({ name: s.name, displayName: s.displayName })),
      totalSections: budget.sections.length
    });

    // Check if the new section name already exists
    const existingSection = budget.sections.find((s: any) => s.name === newSectionName);
    if (existingSection) {
      return NextResponse.json(
        { error: "A section with this name already exists" },
        { status: 400 }
      );
    }

    // Update the section in the budget
    const updatedSections = budget.sections.map((section: any) => {
      if (section.name === oldSectionName) {
        return {
          _id: section._id,
          name: newSectionName,
          displayName: newSectionName,
        };
      }
      return {
        _id: section._id,
        name: section.name,
        displayName: section.displayName,
      };
    });
    
    console.log("API: Updated sections:", {
      oldSections: budget.sections.map((s: any) => ({ name: s.name, displayName: s.displayName })),
      newSections: updatedSections.map((s: any) => ({ name: s.name, displayName: s.displayName }))
    });

    // Update the budget with new section names
    console.log("API: About to update budget with sections:", updatedSections);
    
    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { sections: updatedSections },
      { new: true }
    );

    if (!updatedBudget) {
      console.error("API: Failed to update budget - no budget returned");
      return NextResponse.json(
        { error: "Failed to update budget" },
        { status: 500 }
      );
    }

    console.log("API: Budget after update:", {
      budgetId: updatedBudget._id,
      sections: updatedBudget.sections.map((s: any) => ({ name: s.name, displayName: s.displayName })),
      totalSections: updatedBudget.sections.length
    });

    // Get all categories for this budget to see what sectionIds they have
    const allCategoriesInDB = await Category.find({});
    console.log("API: All categories in database:", {
      totalCategories: allCategoriesInDB.length,
      categories: allCategoriesInDB.map(cat => ({ name: cat.name, sectionId: cat.sectionId }))
    });

    // Find the section in the budget to get its full name (in case it's a complex name)
    const sectionToUpdate = budget.sections.find((s: any) => s.name === oldSectionName);
    
    // Update all categories that reference the old section name
    // We need to check both the simple name and the complex name
    let categoriesToUpdate = await Category.find({ sectionId: oldSectionName });
    
    // If no categories found with simple name, try to find by complex name pattern
    if (categoriesToUpdate.length === 0 && sectionToUpdate) {
      // Look for categories that might be using the complex section name
      const complexSectionName = sectionToUpdate.name;
      if (complexSectionName !== oldSectionName) {
        categoriesToUpdate = await Category.find({ sectionId: complexSectionName });
        console.log("API: Found categories with complex section name:", {
          complexSectionName,
          categoriesCount: categoriesToUpdate.length
        });
      }
    }
    
    console.log("API: Found categories to update:", {
      oldSectionName,
      newSectionName,
      categoriesCount: categoriesToUpdate.length,
      categories: categoriesToUpdate.map(cat => ({ name: cat.name, sectionId: cat.sectionId }))
    });
    
    if (categoriesToUpdate.length > 0) {
      const updateResult = await Category.updateMany(
        { sectionId: { $in: [oldSectionName, sectionToUpdate?.name].filter(Boolean) } },
        { sectionId: newSectionName }
      );
      console.log("API: Categories updated:", updateResult);
    }

    // Recalculate budget totals
    const allCategories = await Category.find({
      sectionId: { $in: updatedSections.map((s: any) => s.name) }
    });
    
    const totalBudgeted = allCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
    const totalBudgetAmount = budget.totalBudgeted + budget.totalAvailable;
    const totalAvailable = totalBudgetAmount - totalBudgeted;

    // Update budget totals
    const finalBudget = await Budget.findByIdAndUpdate(
      id,
      {
        totalBudgeted,
        totalAvailable,
      },
      { new: true }
    );

    console.log("API: Final budget after totals update:", {
      budgetId: finalBudget._id,
      sections: finalBudget.sections.map((s: any) => ({ name: s.name, displayName: s.displayName })),
      totalSections: finalBudget.sections.length
    });

    return NextResponse.json({
      budget: finalBudget,
      updatedCategories: categoriesToUpdate.length
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
} 