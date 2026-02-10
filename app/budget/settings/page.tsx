'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useUserSubscription, useUserData } from '@/lib/hooks';
import { getSubscriptionStatus, calculateTrialDaysLeft } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Clock, CreditCard, Calendar, LogOut, Lock, Eye, EyeOff } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import SignOutButton from '@/components/SignOutButton';
import { useViewport } from '@/hooks/useViewport';
import { toast } from 'sonner';
// import BudgetTemplateSelector from '@/components/budget/BudgetTemplateSelector';
// import SavingsGoalList from '@/components/savings/SavingsGoalList';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: subscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { data: user, isLoading: userLoading } = useUserData();
  const { isMobile } = useViewport();

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
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
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
        toast.success(data.message || 'Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorMsg = data.details
          ? data.details.join(', ')
          : data.error || 'Failed to change password';
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      toast.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to start subscription:", err);
    }
  };

  const getPlanBadge = () => {
    switch (subscriptionStatus) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Pro Plan</Badge>;
      case "trial":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Trial</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Free Plan</Badge>;
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
          <span className="text-sm font-medium">Trial Period</span>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Start: {subscription.trialStart ? new Date(subscription.trialStart).toLocaleDateString() : 'N/A'}</div>
          <div>End: {trialEnd.toLocaleDateString()}</div>
          <div className={isExpired ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}>
            {isExpired ? 'Expired' : `${trialDaysLeft} days remaining`}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Mobile Header */}
      <MobileHeader title="Settings" />
      
      {/* Desktop Header */}
      <header className="hidden md:block border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/budget" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Budget
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your account details and subscription status
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
                            <div className="font-medium">{session?.user?.name || 'User'}</div>
                            <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
                          </div>
                          {getPlanBadge()}
                        </div>
                      </div>

                      {/* Subscription Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Subscription Details</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Status:</span>
                            <div className="text-muted-foreground capitalize">{subscriptionStatus}</div>
                          </div>
                          <div>
                            <span className="font-medium">Plan:</span>
                            <div className="text-muted-foreground">
                              {subscription?.isPaid ? 'Pro' : 'Free'}
                            </div>
                          </div>
                          {subscription?.stripeCustomerId && (
                            <div>
                              <span className="font-medium">Customer ID:</span>
                              <div className="text-muted-foreground font-mono text-xs">
                                {subscription.stripeCustomerId}
                              </div>
                            </div>
                          )}
                          {subscription?.stripeSubscriptionId && (
                            <div>
                              <span className="font-medium">Subscription ID:</span>
                              <div className="text-muted-foreground font-mono text-xs">
                                {subscription.stripeSubscriptionId}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Trial Information */}
                        {getTrialInfo()}

                        {/* Upgrade Button for non-paid users */}
                        {subscriptionStatus !== "paid" && (
                          <div className="pt-4">
                            <Button onClick={handleUpgrade} className="w-full">
                              <Crown className="h-4 w-4 mr-2" />
                              Upgrade to Pro
                            </Button>
                          </div>
                        )}

                        {/* Sign Out Button - Mobile Accessible */}
                        <div className="pt-6 border-t border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <LogOut className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Account Actions</span>
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
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your account password for mobile login
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
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
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
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
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
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
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one lowercase letter</li>
                      <li>At least one number</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {passwordLoading ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </CardContent>
              </Card>

              {/* Application Settings Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Application Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your budget and application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>More settings features coming soon...</p>
                  </div>
                  
                  {/* Future settings will go here */}
                  {/* <BudgetTemplateSelector /> */}
                  {/* <SavingsGoalList /> */}

                  {/* Mobile Sign Out - Alternative Access */}
                  {isMobile && (
                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Account</span>
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