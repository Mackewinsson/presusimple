"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Utensils, Bus, ShoppingCart, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils/formatMoney";

export interface PresetItem {
  id: string;
  labelKey: string;
  defaultDescription: string;
  defaultAmount: number;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const PRESETS: PresetItem[] = [
  {
    id: "coffee",
    labelKey: "coffeePreset",
    defaultDescription: "Coffee",
    defaultAmount: 3.5,
    icon: Coffee,
    keywords: ["coffee", "café", "cafe", "drinks", "bebidas", "desayuno"],
  },
  {
    id: "lunch",
    labelKey: "lunchPreset",
    defaultDescription: "Lunch",
    defaultAmount: 12.0,
    icon: Utensils,
    keywords: ["food", "lunch", "almuerzo", "comida", "restaurant", "restaurante"],
  },
  {
    id: "transit",
    labelKey: "transitPreset",
    defaultDescription: "Transit",
    defaultAmount: 2.5,
    icon: Bus,
    keywords: ["transit", "transport", "transporte", "bus", "metro", "uber", "taxi"],
  },
  {
    id: "groceries",
    labelKey: "groceriesPreset",
    defaultDescription: "Groceries",
    defaultAmount: 40.0,
    icon: ShoppingCart,
    keywords: ["groceries", "supermarket", "supermercado", "compras", "food"],
  },
];

interface QuickPresetChipsProps {
  categories: { _id?: string; id?: string; name: string }[];
  onSelectPreset: (preset: {
    description: string;
    amount: string;
    categoryId: string;
  }) => void;
}

export function QuickPresetChips({ categories, onSelectPreset }: QuickPresetChipsProps) {
  const { t } = useTranslation();

  const handleChipClick = (preset: PresetItem) => {
    // Find matching category by keyword
    const matchedCategory = categories.find((cat) =>
      preset.keywords.some((kw) => cat.name.toLowerCase().includes(kw.toLowerCase()))
    );

    const categoryId = matchedCategory?._id || matchedCategory?.id || categories[0]?._id || categories[0]?.id || "";

    onSelectPreset({
      description: preset.defaultDescription,
      amount: preset.defaultAmount.toString(),
      categoryId,
    });
  };

  return (
    <div className="space-y-2 py-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Sparkles className="h-3.5 w-3.5 text-accent-foreground/80" />
        <span>{t("quickPresets")}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const IconComponent = preset.icon;
          return (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleChipClick(preset)}
              className="h-8 gap-1.5 text-xs rounded-full border-border/70 hover:bg-accent hover:text-accent-foreground transition-all duration-150"
            >
              <IconComponent className="h-3.5 w-3.5" />
              <span>{t(preset.labelKey as any) || preset.defaultDescription}</span>
              <span className="text-[10px] opacity-75 font-mono">
                {formatMoney(preset.defaultAmount)}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
