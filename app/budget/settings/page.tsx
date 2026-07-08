'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, User, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useUserSubscription, useUserData, useDecimalSeparator, useSetDecimalSeparator, useIsAdmin } from '@/lib/hooks';
import { useCheckout } from '@/hooks/useCheckout';
import { getSubscriptionStatus, calculateTrialDaysLeft } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Clock, CreditCard, Calendar, LogOut, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { AdminNavLink } from '@/components/admin/AdminNavLink';
import SignOutButton from '@/components/SignOutButton';
import { useViewport } from '@/hooks/useViewport';
import { useTranslation, useLocale } from '@/lib/i18n';
import { toast } from 'sonner';
import { getBudgetBasePath } from '@/lib/budget-routes';
// import BudgetTemplateSelector from '@/components/budget/BudgetTemplateSelector';
// import SavingsGoalList from '@/components/savings/SavingsGoalList';

function LanguageSetting() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { t } = useTranslation();

  const handleChange = (value: string) => {
    if (value === 'es' && !pathname.startsWith('/es')) {
      router.push(`/es${pathname}`);
    } else if (value === 'en' && pathname.startsWith('/es')) {
      router.push(pathname.replace('/es', '') || '/');
    }
  };

  return (
    <Select value={currentLocale} onValueChange={handleChange}>
      <SelectTrigger className="w-full max-w-[240px]" aria-label={t('language')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4}>
        <SelectItem value="en">{t('english')}</SelectItem>
        <SelectItem value="es">{t('spanish')}</SelectItem>
      </SelectContent>
    </Select>
  );
}

function DecimalSeparatorSetting() {
  const { data: decimalSeparator, isLoading } = useDecimalSeparator();
  const setDecimalSeparator = useSetDecimalSeparator();
  const { t } = useTranslation();

  const value = decimalSeparator ?? 'dot';

  const handleChange = (v: string) => {
    if (v === 'dot' || v === 'comma') {
      setDecimalSeparator.mutate(v);
    }
  };

  if (isLoading) {
    return <div className="h-10 bg-muted animate-pulse rounded-md w-48" />;
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full max-w-[240px]" aria-label={t('decimalSeparatorLabel')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4}>
        <SelectItem value="dot">{t('decimalSeparatorDot')}</SelectItem>
        <SelectItem value="comma">{t('decimalSeparatorComma')}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function SettingsPage() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: subscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { data: user, isLoading: userLoading } = useUserData();
  const { isMobile } = useViewport();
  const { t } = useTranslation();
  const { checkout, loading: checkoutLoading, canCheckout } = useCheckout();
  const isAdmin = useIsAdmin();
  const [portalLoading, setPortalLoading] = useState(false);

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLoading = subscriptionLoading || userLoading;
  const subscriptionStatus = getSubscriptionStatus(subscription || {});
  const trialDaysLeft = calculateTrialDaysLeft(subscription?.trialEnd || null);



  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('allPasswordFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('passwordChangedSuccess'));
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const codeMessages: Record<string, string> = {
          missing_fields: t('allPasswordFieldsRequired'),
          passwords_mismatch: t('passwordsDoNotMatch'),
          weak_password: data.details
            ? `${t('passwordValidationFailed')}: ${data.details.join(', ')}`
            : t('passwordValidationFailed'),
          no_password_set: t('noPasswordSet'),
          current_password_incorrect: t('currentPasswordIncorrect'),
        };
        toast.error(codeMessages[data.code] || t('failedToChangePassword'));
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      toast.error(t('failedToChangePassword'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.user?.email) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/lemonsqueezy/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || t("failedToCreatePortal") || "Could not open billing portal.");
      }
    } catch (err) {
      console.error("Failed to open portal:", err);
      toast.error(t("failedToCreatePortal") || "Could not open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const getPlanBadge = () => {
    switch (subscriptionStatus) {
      case "paid":
        return <Badge className="bg-success/20 text-success-foreground">{t('proPlan')}</Badge>;
      case "trial":
        return <Badge className="bg-info/20 text-info-foreground">{t('trial')}</Badge>;
      case "expired":
        return <Badge className="bg-destructive/20 text-destructive-foreground">{t('expired')}</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">{t('freePlan')}</Badge>;
    }
  };

  const getTrialInfo = () => {
    if (!subscription?.trialEnd) return null;

    const trialEnd = new Date(subscription.trialEnd);
    const isExpired = trialDaysLeft <= 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('trialPeriod')}</span>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>{t('start')}: {subscription.trialStart ? new Date(subscription.trialStart).toLocaleDateString() : 'N/A'}</div>
          <div>{t('end')}: {trialEnd.toLocaleDateString()}</div>
          <div className={isExpired ? 'text-destructive' : 'text-info'}>
            {isExpired ? t('expired') : `${trialDaysLeft} ${t('daysRemaining')}`}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Mobile Header */}
      <MobileHeader title={t('settings')} />
      
      {/* Desktop Header */}
      <header className="hidden md:block border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link 
                href={getBudgetBasePath(pathname)} 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                {t('backToBudget')}
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">{t('settings')}</h1>
            </div>
            <AdminNavLink />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" variant="accent" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('profile')}
              </TabsTrigger>
              <TabsTrigger value="settings" variant="accent" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('settings')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t('accountInformation')}
                  </CardTitle>
                  <CardDescription>
                    {t('accountDetailsAndSubscription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  ) : (
                    <>
                      {/* User Info */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{session?.user?.name || t('unknown')}</div>
                            <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
                          </div>
                          {getPlanBadge()}
                        </div>
                      </div>

                      {/* Subscription Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{t('subscriptionDetails')}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">{t('status')}:</span>
                            <div className="text-muted-foreground">
                              {subscriptionStatus === 'paid'
                                ? t('statusPaid')
                                : subscriptionStatus === 'trial'
                                ? t('trial')
                                : subscriptionStatus === 'expired'
                                ? t('expired')
                                : t('free')}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">{t('plan')}:</span>
                            <div className="text-muted-foreground">
                              {subscription?.isPaid ? t('pro') : t('free')}
                            </div>
                          </div>
                          {subscription?.lemonSqueezyCustomerId && (
                            <div>
                              <span className="font-medium">{t('customerId')}:</span>
                              <div className="text-muted-foreground font-mono text-xs">
                                {subscription.lemonSqueezyCustomerId}
                              </div>
                            </div>
                          )}
                          {subscription?.lemonSqueezySubscriptionId && (
                            <div>
                              <span className="font-medium">{t('subscriptionId')}:</span>
                              <div className="text-muted-foreground font-mono text-xs">
                                {subscription.lemonSqueezySubscriptionId}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Manage Subscription for paid users */}
                        {subscriptionStatus === "paid" && subscription?.lemonSqueezySubscriptionId && (
                          <div className="pt-4">
                            <Button
                              variant="outline"
                              onClick={handleManageSubscription}
                              disabled={portalLoading}
                              className="w-full"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              {portalLoading ? t('redirecting') : t('manageSubscription')}
                            </Button>
                          </div>
                        )}

                        {/* Trial Information */}
                        {getTrialInfo()}

                        {/* Upgrade Button for non-paid users */}
                        {subscriptionStatus !== "paid" && (
                          <div className="pt-4">
                            <Button
                              onClick={checkout}
                              disabled={checkoutLoading || !canCheckout}
                              className="w-full"
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              {checkoutLoading ? t('redirecting') : t('upgradeToPro')}
                            </Button>
                          </div>
                        )}

                        {/* Sign Out Button - Mobile Accessible */}
                        <div className="pt-6 border-t border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <LogOut className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t('accountActions')}</span>
                          </div>
                          <SignOutButton 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            showText={true}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {isAdmin && (
                <Card className="border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {t('platformAdmin')}
                    </CardTitle>
                    <CardDescription>
                      {t('adminDashboardDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href="/admin">{t('openAdminDashboard')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    {t('changePassword')}
                  </CardTitle>
                  <CardDescription>
                    {t('updatePasswordDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder={t('enterCurrentPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('newPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder={t('enterNewPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder={t('confirmNewPasswordPlaceholder')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{t('passwordRequirements')}</p>
                    <ul className="list-disc list-inside">
                      <li>{t('passwordMinChars')}</li>
                      <li>{t('passwordUppercase')}</li>
                      <li>{t('passwordLowercase')}</li>
                      <li>{t('passwordNumber')}</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {passwordLoading ? t('changingPassword') : t('changePassword')}
                  </Button>
                </CardContent>
              </Card>

              {/* Application Settings Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('applicationSettings')}
                  </CardTitle>
                  <CardDescription>
                    {t('configurePreferences')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">{t('language')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('languageDescription')}
                    </p>
                    <LanguageSetting />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Decimal separator</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose how numbers are displayed and entered (e.g. in amounts).
                    </p>
                    <DecimalSeparatorSetting />
                  </div>

                  {/* Mobile Sign Out - Alternative Access */}
                  {isMobile && (
                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t('account')}</span>
                      </div>
                      <SignOutButton 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        showText={true}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}