import { BudgetQuickActions } from "@/components/admin/BudgetQuickActions";

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BudgetQuickActions />
      {children}
    </>
  );
}
