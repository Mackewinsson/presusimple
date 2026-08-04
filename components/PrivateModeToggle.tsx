"use client";

import { Eye, EyeOff } from "lucide-react";
import { usePrivateMode } from "@/components/PrivateModeProvider";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const toggleClassName =
  "p-2 rounded-lg border border-border bg-card text-foreground transition-all duration-200 hover:bg-muted";

export default function PrivateModeToggle() {
  const { isPrivateMode, togglePrivateMode } = usePrivateMode();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={togglePrivateMode}
      className={cn(
        toggleClassName,
        isPrivateMode && "ring-1 ring-accent/40 bg-accent/10"
      )}
      aria-label={isPrivateMode ? t("privateModeActive") : t("privateModeOff")}
      aria-pressed={isPrivateMode}
      title={isPrivateMode ? t("privateModeActive") : t("privateModeOff")}
    >
      {isPrivateMode ? (
        <EyeOff className="h-5 w-5 text-accent-foreground" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  );
}
