import { Settings } from 'lucide-react';
import Link from 'next/link';

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/app/settings"
          className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
      {children}
    </>
  );
}