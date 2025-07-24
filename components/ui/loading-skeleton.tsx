import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Budget setup section skeleton
export const BudgetSetupSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </CardContent>
  </Card>
);

// Category skeleton
export const CategorySkeleton = () => (
  <Card className="border hover-card bg-card/50">
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-24" />
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </CardContent>
  </Card>
);

// Section skeleton
export const SectionSkeleton = () => (
  <Card className="w-full mb-4 shadow-sm overflow-hidden">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center space-x-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      <Skeleton className="h-4 w-48 mt-1" />
    </CardHeader>
    <CardContent className="pb-4">
      <div className="space-y-3">
        <CategorySkeleton />
        <CategorySkeleton />
      </div>
    </CardContent>
    <CardContent className="pt-0 pb-4">
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

// Expense skeleton
export const ExpenseSkeleton = () => (
  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  </div>
);

// Summary skeleton
export const SummarySkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Daily spending tracker skeleton
export const DailySpendingSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-4 w-56" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="space-y-2">
          <ExpenseSkeleton />
          <ExpenseSkeleton />
          <ExpenseSkeleton />
        </div>
      </div>
    </CardContent>
  </Card>
);

// History item skeleton
export const HistoryItemSkeleton = () => (
  <Card className="glass-card hover-card">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-8" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-8" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main app loading skeleton
export const AppLoadingSkeleton = () => (
  <div className="min-h-screen gradient-bg-dark flex flex-col">
    <header className="border-b border-slate-300/50 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
            <Skeleton className="h-6 w-32 sm:w-40" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        </div>
      </div>
    </header>

    <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
      <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <BudgetSetupSkeleton />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <DailySpendingSkeleton />
          <SummarySkeleton />
        </div>
      </div>
    </main>

    <footer className="mt-auto border-t border-slate-300/50 dark:border-white/10 py-3 sm:py-4 md:py-6 bg-white/5 dark:bg-white/5 backdrop-blur-sm sticky bottom-0 sm:static">
      <div className="container mx-auto px-4 sm:px-6">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </footer>
  </div>
);

// Button loading state
export const LoadingButton = ({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  size?: string;
}) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${props.className || ""} ${
      loading ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        Loading...
      </div>
    ) : (
      children
    )}
  </button>
);
