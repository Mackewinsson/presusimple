"use client";

// TODO: Implement savings goals feature later
// This component is temporarily disabled

import { useTranslation } from "@/lib/i18n";

const SavingsGoalList = () => {
  const { t } = useTranslation();
  return (
    <div className="p-4 text-center text-muted-foreground">
      <p>{t('savingsGoalsComingSoon')}</p>
    </div>
  );
};

export default SavingsGoalList;
