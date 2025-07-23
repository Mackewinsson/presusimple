"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
          Sign Out
        </span>
      )}
    </Button>
  );
} 