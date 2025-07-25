# Redux Store Documentation

## Store Configuration
The application uses Redux Toolkit with Redux Persist for state management. The store is configured in `lib/store/index.ts`.

### Key Features
- Persists state to localStorage
- Handles server-side rendering compatibility
- Combines multiple reducers for different features

## Slices

### Budget Slice (`budgetSlice.ts`)
Manages the current budget state including sections, categories, and totals.

#### State Interface
```typescript
interface BudgetState {
  sections: BudgetSection[];
  categories: BudgetCategory[];
  totalBudgeted: number;
  totalSpent: number;
  totalAvailable: number;
}
```

#### Key Actions
- `setTotalAvailable`: Updates available budget amount
- `addSection`: Creates a new budget section
- `removeSection`: Deletes a section and its categories
- `addCategory`: Adds a new category to a section
- `updateCategory`: Modifies category details
- `addExpenseToCategory`: Updates category spent amount
- `resetBudget`: Resets spending while keeping categories
- `resetAll`: Completely resets the budget state

### Expense Slice (`expenseSlice.ts`)
Handles transaction tracking and management.

#### State Interface
```typescript
interface ExpenseState {
  expenses: Expense[];
}
```

#### Key Actions
- `addExpense`: Records a new transaction
- `updateExpense`: Modifies transaction details
- `removeExpense`: Deletes a transaction
- `clearExpenses`: Removes all transactions
- `resetAll`: Resets the expense state

### Monthly Budget Slice (`monthlyBudgetSlice.ts`)
Stores historical budget data.

#### State Interface
```typescript
interface MonthlyBudgetState {
  budgets: MonthlyBudget[];
}
```

#### Key Actions
- `saveBudget`: Archives current budget state
- `deleteBudget`: Removes a saved budget

### Budget Template Slice (`budgetTemplateSlice.ts`)
Manages reusable budget templates.

#### State Interface
```typescript
interface BudgetTemplateState {
  templates: BudgetTemplate[];
}
```

#### Key Actions
- `saveTemplate`: Creates a new template
- `deleteTemplate`: Removes a template

// ### Savings Goal Slice (`savingsGoalSlice.ts`)
// Tracks savings targets and progress.

// #### State Interface
// ```typescript
// interface SavingsGoalState {
//   goals: SavingsGoal[];
// }
// ```

// #### Key Actions
// - `addGoal`: Creates a new savings goal
// - `updateGoalProgress`: Updates progress towards goal
// - `deleteGoal`: Removes a savings goal