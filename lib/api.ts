// lib/api.ts
export interface Budget {
  _id: string;
  month: number;
  year: number;
  totalBudgeted: number;
  totalAvailable: number;
  user: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  budgeted: number;
  spent: number;
  budgetId: string;
}

export interface Expense {
  _id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  type: "expense" | "income";
}

export interface MonthlyBudget {
  _id: string;
  name: string;
  month: string;
  year: number;
  categories: {
    name: string;
    budgeted: number;
    spent: number;
  }[];
  totalBudgeted: number;
  totalSpent: number;
  expensesCount: number;
  createdAt: string;
}

// User API
export const getUserByEmail = async (email: string) => {
  const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const users = await res.json();
  return users[0];
};

// Budget API functions
export const budgetApi = {
  // Get budget for a user
  getBudget: async (userId: string): Promise<Budget | null> => {
    const response = await fetch(`/api/budgets?user=${userId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch budget");
    }
    const budgets = await response.json();
    // Return the most recent budget (first in the sorted list)
    return budgets[0] || null;
  },

  // Create a new budget
  createBudget: async (budgetData: {
    month: number;
    year: number;
    totalBudgeted: number;
    totalAvailable: number;
    user: string;
  }): Promise<Budget> => {
    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budgetData),
    });
    if (!response.ok) throw new Error("Failed to create budget");
    return response.json();
  },

  // Update budget
  updateBudget: async (
    id: string,
    updates: Partial<Budget>
  ): Promise<Budget> => {
    const response = await fetch(`/api/budgets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update budget");
    return response.json();
  },

  // Update section name (atomic operation)
  updateSectionName: async (
    budgetId: string,
    oldSectionName: string,
    newSectionName: string
  ): Promise<{ budget: Budget; updatedCategories: number }> => {
    const response = await fetch(`/api/budgets/${budgetId}/update-section`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldSectionName, newSectionName }),
    });
    if (!response.ok) throw new Error("Failed to update section name");
    return response.json();
  },

  // Delete budget
  deleteBudget: async (id: string): Promise<void> => {
    const response = await fetch(`/api/budgets/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete budget");
  },

  // Reset budget (clear expenses and reset spent amounts)
  resetBudget: async (userId: string): Promise<void> => {
    const response = await fetch("/api/budgets/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error("Failed to reset budget");
  },
};

// Category API functions
export const categoryApi = {
  // Get categories for a user
  getCategories: async (userId: string): Promise<Category[]> => {
    const response = await fetch(`/api/categories?user=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },

  // Get categories for a budget
  getCategoriesByBudget: async (budgetId: string): Promise<Category[]> => {
    const response = await fetch(`/api/categories?budget=${budgetId}`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },

  // Create a new category
  createCategory: async (categoryData: {
    name: string;
    budgeted: number;
    budgetId: string;
    userId: string;
  }): Promise<Category> => {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create category");
    }
    return response.json();
  },

  // Update category
  updateCategory: async (
    id: string,
    updates: Partial<Category>
  ): Promise<Category> => {
    const response = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update category");
    return response.json();
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete category");
  },
};

// Expense API functions
export const expenseApi = {
  // Get expenses for a user
  getExpenses: async (userId: string): Promise<Expense[]> => {
    const response = await fetch(`/api/expenses?user=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch expenses");
    return response.json();
  },

  // Create a new expense
  createExpense: async (expenseData: {
    user: string;
    budget: string;
    categoryId: string;
    amount: number;
    description: string;
    date: string;
    type: "expense" | "income";
  }): Promise<Expense> => {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
    });
    if (!response.ok) throw new Error("Failed to create expense");
    return response.json();
  },

  // Update expense
  updateExpense: async (
    id: string,
    updates: Partial<Expense>
  ): Promise<Expense> => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update expense");
    return response.json();
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<void> => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete expense");
  },
};

// Monthly Budget API functions
export const monthlyBudgetApi = {
  // Get monthly budgets for a user
  getMonthlyBudgets: async (userId: string): Promise<MonthlyBudget[]> => {
    const response = await fetch(`/api/monthly-budgets?user=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch monthly budgets");
    return response.json();
  },

  // Save monthly budget snapshot
  saveMonthlyBudget: async (budgetData: {
    name: string;
    month: string;
    year: number;
    categories: {
      name: string;
      budgeted: number;
      spent: number;
    }[];
    totalBudgeted: number;
    totalSpent: number;
    expensesCount: number;
    userId: string;
  }): Promise<MonthlyBudget> => {
    const response = await fetch("/api/monthly-budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budgetData),
    });
    if (!response.ok) throw new Error("Failed to save monthly budget");
    return response.json();
  },

  // Delete monthly budget
  deleteMonthlyBudget: async (id: string): Promise<void> => {
    const response = await fetch(`/api/monthly-budgets/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete monthly budget");
  },
};
