"use client";

// TODO: Implement budget templates feature later
// This component is temporarily disabled

import { useTranslation } from "@/lib/i18n";

const BudgetTemplateSelector = () => {
  const { t } = useTranslation();
  return (
    <div className="p-4 text-center text-muted-foreground">
      <p>{t('budgetTemplatesComingSoon')}</p>
    </div>
  );
};

export default BudgetTemplateSelector;
