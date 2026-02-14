"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface SignOutButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export default function SignOutButton({ 
  variant = "outline", 
  size = "sm", 
  className = "",
  showText = true 
}: SignOutButtonProps) {
  const { t } = useTranslation();
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Button
      onClick={handleSignOut}
      variant={variant}
      size={size}
      className={className}
    >
      {showText && (
        <span className="text-sm sm:text-base">
          {t('signOut')}
        </span>
      )}
    </Button>
  );
} 