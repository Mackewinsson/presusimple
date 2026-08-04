"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/SignOutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function Navigation() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground">
              {t("budgetApp")}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {status === "authenticated" ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("dashboard")}
                </Link>
                <SignOutButton
                  variant="outline"
                  size="sm"
                  showText={true}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                />
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/login">{t("signIn")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
