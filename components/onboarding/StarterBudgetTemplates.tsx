"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, GraduationCap, Briefcase, Sparkles, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export interface BudgetTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  categories: { name: string; percentage: number }[];
}

export const TEMPLATES: BudgetTemplate[] = [
  {
    id: "50-30-20",
    title: "50 / 30 / 20 Balanced",
    description: "The classic rule: Needs 50%, Wants 30%, Savings 20%",
    icon: PieChart,
    categories: [
      { name: "Needs (Housing, Food, Utilities)", percentage: 50 },
      { name: "Wants (Entertainment, Dining Out)", percentage: 30 },
      { name: "Savings & Debt Repayment", percentage: 20 },
    ],
  },
  {
    id: "student",
    title: "Student Essentials",
    description: "Tailored for college/university: Rent, Food, Books, Fun",
    icon: GraduationCap,
    categories: [
      { name: "Housing & Rent", percentage: 40 },
      { name: "Groceries & Food", percentage: 25 },
      { name: "Transport", percentage: 15 },
      { name: "Books & Study Supplies", percentage: 10 },
      { name: "Social & Leisure", percentage: 10 },
    ],
  },
  {
    id: "freelancer",
    title: "Freelancer / Self-Employed",
    description: "Includes tax buffer, variable income reserve, and business costs",
    icon: Briefcase,
    categories: [
      { name: "Fixed Living Costs", percentage: 40 },
      { name: "Tax Reserve", percentage: 25 },
      { name: "Business & Tools", percentage: 15 },
      { name: "Emergency Reserve", percentage: 20 },
    ],
  },
];

interface StarterBudgetTemplatesProps {
  onSelectTemplate: (template: BudgetTemplate) => void;
  selectedTemplateId?: string;
}

export function StarterBudgetTemplates({
  onSelectTemplate,
  selectedTemplateId,
}: StarterBudgetTemplatesProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Sparkles className="h-4 w-4 text-accent-foreground" />
        <span>1-Click Starter Budget Templates</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((template) => {
          const IconComponent = template.icon;
          const isSelected = selectedTemplateId === template.id;

          return (
            <Card
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`cursor-pointer transition-all duration-200 hover:border-accent ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-sm ring-1 ring-accent"
                  : "border-border/60 bg-card hover:bg-muted/20"
              }`}
            >
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <div className="rounded-md bg-muted p-1.5">
                    <IconComponent className="h-4 w-4 text-foreground" />
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-accent-foreground font-bold" />}
                </div>
                <CardTitle className="text-sm font-semibold pt-1">{template.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-[11px] text-muted-foreground space-y-1">
                {template.categories.slice(0, 3).map((cat, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-1">{cat.name}</span>
                    <span className="font-mono font-medium">{cat.percentage}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
