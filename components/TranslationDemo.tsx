"use client";

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TranslationDemo() {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('welcome')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* <p><strong>{t('budget')}:</strong> {t('createBudget')}</p> */}
        {/* <p><strong>{t('expenses')}:</strong> {t('addTransaction')}</p> */}
        {/* <p><strong>{t('settings')}:</strong> {t('settings')}</p> */}
        {/* <p><strong>{t('history')}:</strong> {t('transactionHistory')}</p> */}
      </CardContent>
    </Card>
  );
} 