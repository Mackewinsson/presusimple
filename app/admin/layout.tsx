import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Admin | Presusimple",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Alert className="border-amber-500/40 bg-amber-500/10">
            <AlertDescription className="text-sm text-foreground">
              Platform operations — authorized operators only. Changes here affect
              live users, subscriptions, and feature access.
            </AlertDescription>
          </Alert>
          <AdminNav />
          {children}
        </div>
      </div>
    </div>
  );
}
