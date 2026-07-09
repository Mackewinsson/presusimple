'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useBudgetStatus } from '@/hooks/useBudgetStatus';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { ensureServiceWorkerRegistered } from '@/lib/push-subscription';

interface NotificationPromptProps {
  onDismiss?: () => void;
  showForExistingUsers?: boolean;
}

export default function NotificationPrompt({
  onDismiss,
  showForExistingUsers = true,
}: NotificationPromptProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { hasBudget, isLoading: budgetLoading } = useBudgetStatus();
  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    error,
    enableNotifications,
    clearError,
  } = useNotifications();

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    if (!session?.user?.email || !showForExistingUsers) return;

    if (
      budgetLoading ||
      !hasBudget ||
      !isSupported ||
      (permission === 'granted' && isSubscribed) ||
      isSubscribed ||
      hasBeenDismissed
    ) {
      return;
    }

    const dismissedKey = `notification-prompt-dismissed-${session.user.email}`;
    const wasDismissed = localStorage.getItem(dismissedKey);

    if (wasDismissed) {
      setHasBeenDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    session,
    hasBudget,
    budgetLoading,
    isSupported,
    permission,
    isSubscribed,
    hasBeenDismissed,
    showForExistingUsers,
  ]);

  useEffect(() => {
    if (!isVisible || !isSupported) return;
    void ensureServiceWorkerRegistered();
  }, [isVisible, isSupported]);

  const handleEnableNotifications = async () => {
    clearError();
    const success = await enableNotifications();

    if (!success) return;

    if (session?.user?.email) {
      const completedKey = `notification-prompt-completed-${session.user.email}`;
      localStorage.setItem(completedKey, Date.now().toString());
    }

    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismiss = () => {
    if (session?.user?.email) {
      const dismissedKey = `notification-prompt-dismissed-${session.user.email}`;
      localStorage.setItem(dismissedKey, Date.now().toString());
    }

    setHasBeenDismissed(true);
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDontAskAgain = () => {
    if (session?.user?.email) {
      const dismissedKey = `notification-prompt-dismissed-${session.user.email}`;
      localStorage.setItem(dismissedKey, 'permanent');
    }

    setHasBeenDismissed(true);
    setIsVisible(false);
    onDismiss?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      handleDismiss();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={isVisible} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-success" />
            <DialogTitle>{t('stayUpdated')}</DialogTitle>
          </div>
          <DialogDescription>{t('getNotifiedDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md border border-border bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {error || t('notificationEnableFailed')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>{t('budgetAlertsWhenApproaching')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-success" />
              <span>{t('expenseRemindersAndTips')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 text-success" />
              <span>{t('goalAchievementsAndMilestones')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="default"
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? t('enabling') : t('enableNotifications')}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              disabled={isLoading}
              className="flex-1"
            >
              {t('later')}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDontAskAgain}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t('dontAskAgain')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
