import { Settings } from "lucide-react";
import Link from "next/link";
import CurrencySelector from "@/components/CurrencySelector";

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-50 flex items-center gap-2">
        <CurrencySelector />
        <Link
          href="/app/settings"
          className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
      </div>
      {children}
    </>
  );
}
