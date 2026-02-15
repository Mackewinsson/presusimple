'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, CheckCircle, AlertTriangle, Target } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useBudgetStatus } from '@/hooks/useBudgetStatus';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';

interface NotificationPromptProps {
  onDismiss?: () => void;
  showForExistingUsers?: boolean;
}

export default function NotificationPrompt({ 
  onDismiss, 
  showForExistingUsers = true 
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
    requestPermission,
    subscribe,
    clearError,
  } = useNotifications();

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  // Check if user should see the prompt
  useEffect(() => {
    if (!session?.user?.email || !showForExistingUsers) return;

    // Don't show if:
    // - Still loading budget status
    // - User doesn't have a budget
    // - Notifications not supported
    // - Already granted permission
    // - Already subscribed
    // - Previously dismissed
    // - Currently loading
    if (
      budgetLoading ||
      !hasBudget ||
      !isSupported ||
      permission === 'granted' ||
      isSubscribed ||
      hasBeenDismissed ||
      isLoading
    ) {
      return;
    }

    // Check if user has been dismissed before
    const dismissedKey = `notification-prompt-dismissed-${session.user.email}`;
    const wasDismissed = localStorage.getItem(dismissedKey);
    
    if (wasDismissed) {
      setHasBeenDismissed(true);
      return;
    }

    // Show prompt after a short delay to let the page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [session, hasBudget, budgetLoading, isSupported, permission, isSubscribed, hasBeenDismissed, isLoading, showForExistingUsers]);

  const handleEnableNotifications = async () => {
    try {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      
      if (!isSubscribed) {
        await subscribe();
      }
      
      // Mark as completed
      const completedKey = `notification-prompt-completed-${session?.user?.email}`;
      localStorage.setItem(completedKey, Date.now().toString());
      
      setIsVisible(false);
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
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

  if (!isVisible || !isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
      <Card className="shadow-lg border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg text-foreground">
                {t('stayUpdated')}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-muted-foreground">
            {t('getNotifiedDescription')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-2 rounded-md border border-border bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                onClick={clearError}
                variant="outline"
                size="sm"
                className="mt-1"
              >
                {t('clearError')}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>{t('budgetAlertsWhenApproaching')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <span>{t('expenseRemindersAndTips')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 text-accent" />
              <span>{t('goalAchievementsAndMilestones')}</span>
            </div>
          </div>

          <div className="flex gap-2">
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
            >
              {t('later')}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDontAskAgain}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t('dontAskAgain')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
