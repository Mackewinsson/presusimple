# MongoDB Integration Documentation

## Database Connection
The database connection is managed in `lib/db/connection.ts` using Mongoose.

### Connection Features
- Cached connection for development
- Environment variable configuration
- Type-safe models

## Models

### User Model (`models/User.ts`)
```typescript
interface IUser {
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Budget Model (`models/Budget.ts`)
```typescript
interface IBudget {
  userId: string;
  name: string;
  date: string;
  sections: Array<{
    id: string;
    name: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    budgeted: number;
    spent: number;
    sectionId: string;
  }>;
  expenses: Array<{
    id: string;
    amount: number;
    description: string;
    categoryId: string;
    date: string;
    type: 'expense' | 'income';
  }>;
  totalBudgeted: number;
  totalSpent: number;
}
```

### Budget Template Model (`models/BudgetTemplate.ts`)
```typescript
interface IBudgetTemplate {
  userId: string;
  name: string;
  isDefault: boolean;
  sections: Array<{
    id: string;
    name: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    budgeted: number;
    spent: number;
    sectionId: string;
  }>;
}
```

### Savings Goal Model (`models/SavingsGoal.ts`)
```typescript
interface ISavingsGoal {
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  categoryId?: string;
}
```

## Indexes
Each model includes optimized indexes for common queries:
- User email (unique)
- Budget userId + date
- Template userId + name
- SavingsGoal userId + categoryId

## Usage
Models are exported and ready to use with Mongoose:
```typescript
import { Budget } from '@/lib/db/models/Budget';

// Example: Create new budget
const budget = new Budget({
  userId: 'user123',
  name: 'January 2024',
  // ... other fields
});
await budget.save();
```