"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, KeyRound, Loader2, Save, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  formatAdminDateTime,
  formatAdminRelative,
} from "@/lib/admin/user-dates";

export interface AdminUserDetailData {
  _id: string;
  email: string;
  name: string;
  plan: "free" | "pro";
  isPaid: boolean;
  trialStart: string | null;
  trialEnd: string | null;
  subscriptionType: string | null;
  lemonSqueezyCustomerId: string | null;
  lemonSqueezySubscriptionId: string | null;
  streakCount: number;
  lastActivityDate: string | null;
  lastLoginAt: string | null;
  joinedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  currency: string;
  decimalSeparator: string;
  notificationEnabled: boolean;
  hasPassword: boolean;
}

interface AdminUserDetailProps {
  userId: string;
  onBack: () => void;
  onUpdated?: () => void;
}

const SUBSCRIPTION_ACTIONS = [
  { value: "activate_paid", label: "Activate paid (Pro)" },
  { value: "activate_trial", label: "Activate trial (30 days)" },
  { value: "extend_trial", label: "Extend trial (30 days)" },
  { value: "set_pro_plan", label: "Set Pro plan only" },
  { value: "set_free_plan", label: "Set free plan" },
  { value: "deactivate", label: "Deactivate subscription" },
] as const;

function InfoItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm">{value}</div>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function AdminUserDetail({
  userId,
  onBack,
  onUpdated,
}: AdminUserDetailProps) {
  const [user, setUser] = useState<AdminUserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [subscriptionAction, setSubscriptionAction] = useState("");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to load user");
      }
      const data: AdminUserDetailData = await response.json();
      setUser(data);
      setNameDraft(data.name);
    } catch (error) {
      console.error("Error loading user detail:", error);
      toast.error("Failed to load user details");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSaveName = async () => {
    if (!user) return;
    try {
      setSavingName(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameDraft }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update name");
      }
      setUser(data);
      toast.success("Name updated");
      onUpdated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update name"
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleSubscriptionAction = async () => {
    if (!user || !subscriptionAction) return;
    try {
      setSubscriptionLoading(true);
      setSubscriptionMessage("");
      const response = await fetch("/api/users/manual-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          action: subscriptionAction,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Subscription action failed");
      }
      setSubscriptionMessage(data.message);
      toast.success(data.message);
      await loadUser();
      onUpdated?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Subscription action failed";
      setSubscriptionMessage(message);
      toast.error(message);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user || !newPassword.trim()) {
      toast.error("Enter a new password");
      return;
    }
    try {
      setPasswordLoading(true);
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          newPassword: newPassword.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }
      toast.success(data.message || "Password updated");
      setNewPassword("");
      await loadUser();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading user...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </Button>
      </div>
    );
  }

  const joined = user.joinedAt ?? user.createdAt;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold truncate">{user.email}</h2>
          <p className="text-sm text-muted-foreground">
            {user.name || "No display name"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Account identity and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-user-name">Display name</Label>
              <div className="flex gap-2">
                <Input
                  id="admin-user-name"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                />
                <Button
                  onClick={handleSaveName}
                  disabled={savingName || nameDraft === user.name}
                >
                  {savingName ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Email" value={user.email} />
              <InfoItem
                label="Mobile password"
                value={
                  <Badge variant={user.hasPassword ? "default" : "secondary"}>
                    {user.hasPassword ? "Set" : "Not set"}
                  </Badge>
                }
              />
              <InfoItem label="Currency" value={user.currency} />
              <InfoItem label="Decimal separator" value={user.decimalSeparator} />
              <InfoItem
                label="Notifications"
                value={user.notificationEnabled ? "Enabled" : "Disabled"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Login and engagement signals</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              label="Joined"
              value={formatAdminDateTime(joined)}
              sub={formatAdminRelative(joined)}
            />
            <InfoItem
              label="Last login"
              value={formatAdminDateTime(user.lastLoginAt)}
              sub={formatAdminRelative(user.lastLoginAt)}
            />
            <InfoItem
              label="Last activity"
              value={formatAdminDateTime(user.lastActivityDate)}
              sub={formatAdminRelative(user.lastActivityDate)}
            />
            <InfoItem
              label="Streak"
              value={user.streakCount > 0 ? `${user.streakCount} days` : "—"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Plan, billing, and manual overrides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                label="Plan"
                value={
                  <Badge variant={user.plan === "pro" ? "default" : "secondary"}>
                    {user.plan}
                  </Badge>
                }
              />
              <InfoItem
                label="Paid"
                value={
                  <Badge variant={user.isPaid ? "default" : "secondary"}>
                    {user.isPaid ? "Yes" : "No"}
                  </Badge>
                }
              />
              <InfoItem
                label="Subscription type"
                value={user.subscriptionType || "—"}
              />
              <InfoItem
                label="Trial end"
                value={formatAdminDateTime(user.trialEnd)}
              />
              {user.lemonSqueezyCustomerId && (
                <InfoItem
                  label="Lemon Squeezy customer"
                  value={
                    <span className="font-mono text-xs break-all">
                      {user.lemonSqueezyCustomerId}
                    </span>
                  }
                />
              )}
              {user.lemonSqueezySubscriptionId && (
                <InfoItem
                  label="Lemon Squeezy subscription"
                  value={
                    <span className="font-mono text-xs break-all">
                      {user.lemonSqueezySubscriptionId}
                    </span>
                  }
                />
              )}
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Subscription action</Label>
              <Select
                value={subscriptionAction}
                onValueChange={setSubscriptionAction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_ACTIONS.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSubscriptionAction}
                disabled={!subscriptionAction || subscriptionLoading}
                className="w-full sm:w-auto"
              >
                {subscriptionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : subscriptionAction === "deactivate" ? (
                  <UserX className="h-4 w-4 mr-2" />
                ) : (
                  <UserCheck className="h-4 w-4 mr-2" />
                )}
                Apply action
              </Button>
              {subscriptionMessage ? (
                <Alert>
                  <AlertDescription>{subscriptionMessage}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Reset mobile login password (does not require current password)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="admin-new-password">New password</Label>
              <Input
                id="admin-new-password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <Button
              onClick={handleResetPassword}
              disabled={passwordLoading || !newPassword.trim()}
              variant="outline"
            >
              {passwordLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Reset password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
