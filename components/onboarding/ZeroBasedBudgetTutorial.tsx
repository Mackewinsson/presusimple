"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Target,
  Wallet,
  LayoutGrid,
  Receipt,
  History,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { useTranslation, useLocale, type TranslationKey } from "@/lib/i18n";
import { getZbbBlogPath } from "@/lib/constants/onboarding";
import { cn } from "@/lib/utils";

const SLIDES: Array<{
  icon: LucideIcon;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}> = [
  {
    icon: Target,
    titleKey: "zbbTutorialSlide1Title",
    bodyKey: "zbbTutorialSlide1Body",
  },
  {
    icon: Wallet,
    titleKey: "zbbTutorialSlide2Title",
    bodyKey: "zbbTutorialSlide2Body",
  },
  {
    icon: LayoutGrid,
    titleKey: "zbbTutorialSlide3Title",
    bodyKey: "zbbTutorialSlide3Body",
  },
  {
    icon: Receipt,
    titleKey: "zbbTutorialSlide4Title",
    bodyKey: "zbbTutorialSlide4Body",
  },
  {
    icon: History,
    titleKey: "zbbTutorialSlide5Title",
    bodyKey: "zbbTutorialSlide5Body",
  },
];

interface ZeroBasedBudgetTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function interpolateStep(text: string, current: number, total: number): string {
  return text
    .replace(/\{\{current\}\}/g, String(current))
    .replace(/\{\{total\}\}/g, String(total));
}

export function ZeroBasedBudgetTutorial({
  open,
  onOpenChange,
}: ZeroBasedBudgetTutorialProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
    }
  }, [open]);

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === SLIDES.length - 1;

  const handlePrevious = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(SLIDES.length - 1, prev + 1));
  };

  const handleComplete = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-auto top-[50%] max-h-[85dvh] translate-y-[-50%] rounded-2xl border border-border bg-card shadow-2xl inset-x-4 overflow-hidden sm:max-w-md [&>div:first-child]:hidden data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-top-[48%]">
        <DialogHeader className="relative flex flex-col items-center pt-2 pb-1">
          <DialogTitle className="text-lg font-semibold text-center text-foreground">
            {t("zbbTutorialTitle")}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {interpolateStep(
              t("zbbTutorialStepOf"),
              currentSlide + 1,
              SLIDES.length
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 px-1 py-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
            <Icon className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold text-foreground">
              {t(slide.titleKey)}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(slide.bodyKey)}
            </p>
            {isLastSlide && (
              <div className="pt-2">
                <Link
                  href={getZbbBlogPath(locale)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-success hover:underline"
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  {t("zbbTutorialReadFullGuide")}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("zbbTutorialReadFullGuideHint")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-2 py-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={interpolateStep(
                t("zbbTutorialStepOf"),
                index + 1,
                SLIDES.length
              )}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                index === currentSlide
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirstSlide}
            className="min-w-[5.5rem]"
          >
            {t("zbbTutorialPrevious")}
          </Button>

          {isLastSlide ? (
            <Button
              type="button"
              size="sm"
              onClick={handleComplete}
              className="min-w-[5.5rem] font-semibold"
            >
              {t("gotIt")}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleNext}
              className="min-w-[5.5rem] font-semibold"
            >
              {t("zbbTutorialNext")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
