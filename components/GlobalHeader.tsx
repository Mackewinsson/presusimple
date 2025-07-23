"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function GlobalHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Don't show on auth pages or home page when not authenticated
  const isAuthPage = pathname?.startsWith("/auth/");
  const isHomePage = pathname === "/";
  
  if (isAuthPage || (isHomePage && status !== "authenticated")) {
    return null;
  }

  // Only show on authenticated pages or specific routes
  const shouldShow = status === "authenticated" || 
    pathname?.startsWith("/app") || 
    pathname?.startsWith("/dashboard") || 
    pathname?.startsWith("/history");

  if (!shouldShow) {
    return null;
  }

  return (
    <header className="fixed top-0 right-0 z-50 p-4 flex items-center gap-2">
      <ThemeToggle />
      {status === "authenticated" && (
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      )}
    </header>
  );
} 