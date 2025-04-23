import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { BudgetCategory, BudgetSection } from "@/lib/store/budgetSlice";
import { Expense } from "@/lib/store/expenseSlice";
import { formatMoney } from "./formatMoney";

export const exportToPdf = (
  sections: BudgetSection[],
  categories: BudgetCategory[],
  expenses: Expense[],
  totalBudgeted: number,
  totalSpent: number
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 15; // Start position

  // Title
  doc.setFontSize(20);
  doc.text("Budget Report", pageWidth / 2, yPos, { align: "center" });
  yPos += 20;

  // Date
  doc.setFontSize(12);
  doc.text(`Generated on ${format(new Date(), "PPP")}`, pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 20;

  // Summary
  doc.setFontSize(14);
  doc.text("Summary", 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [["Total Budgeted", "Total Spent", "Remaining"]],
    body: [
      [
        formatMoney(totalBudgeted),
        formatMoney(totalSpent),
        formatMoney(totalBudgeted - totalSpent),
      ],
    ],
    didDrawPage: (data) => {
      if (data.cursor) {
        yPos = data.cursor.y + 15;
      }
    },
  });

  // Categories by Section
  sections.forEach((section) => {
    // Add page if needed
    if (yPos > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 15;
    }

    doc.setFontSize(14);
    doc.text(section.name, 14, yPos);
    yPos += 10;

    const sectionCategories = categories.filter(
      (c) => c.sectionId === section.id
    );

    if (sectionCategories.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [["Category", "Budgeted", "Spent", "Remaining"]],
        body: sectionCategories.map((category) => [
          category.name,
          formatMoney(category.budgeted),
          formatMoney(category.spent),
          formatMoney(category.budgeted - category.spent),
        ]),
        didDrawPage: (data) => {
          if (data.cursor) {
            yPos = data.cursor.y + 15;
          }
        },
      });
    }
  });

  // Transactions
  doc.addPage();
  yPos = 15;
  doc.setFontSize(14);
  doc.text("Transactions", 14, yPos);
  yPos += 10;

  if (expenses.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Category", "Description", "Amount", "Type"]],
      body: expenses.map((expense) => {
        const category = categories.find((c) => c.id === expense.categoryId);
        return [
          format(new Date(expense.date), "PP"),
          category?.name || "Unknown",
          expense.description || "-",
          formatMoney(expense.amount),
          expense.type,
        ];
      }),
    });
  }

  // Save the PDF
  doc.save("budget-report.pdf");
};
