"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Crown, Clock } from 'lucide-react';
import { toast } from 'sonner';

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

export default function ManualSubscriptionTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/login");
      return;
    }
  }, [session, status, router]);

  const handleAction = async () => {
    if (!email || !action) {
      toast.error("Please enter email and select action");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/users/manual-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setMessage(data.message);
        // Fetch updated user data
        await fetchUserData(email);
      } else {
        toast.error(data.error || 'Failed to perform action');
        setMessage(data.error || 'Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/users/manual-subscription?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const isAdmin = session?.user?.email && AUTHORIZED_ADMINS.includes(session.user.email);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Users className="h-8 w-8" />
              Manual Subscription Test
            </h1>
            <p className="text-muted-foreground mt-2">
              Test the manual subscription management functionality
            </p>
            <p className="text-sm text-green-600 mt-1">
              Logged in as: {session?.user?.email}
            </p>
            {isAdmin ? (
              <Badge variant="default" className="mt-2">✅ Admin Access</Badge>
            ) : (
              <Badge variant="destructive" className="mt-2">❌ No Admin Access</Badge>
            )}
          </div>

          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              This page tests the manual subscription API endpoints. Only authorized admins can perform subscription actions.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Test Form */}
            <Card>
              <CardHeader>
                <CardTitle>Test Subscription Actions</CardTitle>
                <CardDescription>
                  Test the manual subscription API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="action">Action</Label>
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activate_paid">Activate Paid Subscription</SelectItem>
                      <SelectItem value="activate_trial">Activate Trial (30 days)</SelectItem>
                      <SelectItem value="deactivate">Deactivate Subscription</SelectItem>
                      <SelectItem value="set_pro_plan">Set Pro Plan Only</SelectItem>
                      <SelectItem value="set_free_plan">Set Free Plan Only</SelectItem>
                      <SelectItem value="extend_trial">Extend Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAction} 
                  disabled={loading || !email || !action || !isAdmin}
                  className="w-full"
                >
                  {action === 'activate_paid' && <UserCheck className="h-4 w-4 mr-2" />}
                  {action === 'activate_trial' && <Clock className="h-4 w-4 mr-2" />}
                  {action === 'deactivate' && <UserX className="h-4 w-4 mr-2" />}
                  {action === 'set_pro_plan' && <Crown className="h-4 w-4 mr-2" />}
                  {action === 'set_free_plan' && <UserX className="h-4 w-4 mr-2" />}
                  {action === 'extend_trial' && <Clock className="h-4 w-4 mr-2" />}
                  {loading ? 'Processing...' : 'Execute Action'}
                </Button>
              </CardContent>
            </Card>

            {/* User Data Display */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Current user subscription status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Email:</strong> {userData.email}
                      </div>
                      <div>
                        <strong>Plan:</strong> 
                        <Badge variant={userData.plan === 'pro' ? "default" : "secondary"} className="ml-2">
                          {userData.plan}
                        </Badge>
                      </div>
                      <div>
                        <strong>Is Paid:</strong> 
                        <Badge variant={userData.isPaid ? "default" : "secondary"} className="ml-2">
                          {userData.isPaid ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <strong>Subscription Type:</strong> {userData.subscriptionType || "None"}
                      </div>
                      {userData.trialStart && (
                        <div>
                          <strong>Trial Start:</strong> {new Date(userData.trialStart).toLocaleDateString()}
                        </div>
                      )}
                      {userData.trialEnd && (
                        <div>
                          <strong>Trial End:</strong> {new Date(userData.trialEnd).toLocaleDateString()}
                        </div>
                      )}
                      {userData.stripeCustomerId && (
                        <div>
                          <strong>Stripe Customer:</strong> {userData.stripeCustomerId}
                        </div>
                      )}
                      {userData.stripeSubscriptionId && (
                        <div>
                          <strong>Stripe Subscription:</strong> {userData.stripeSubscriptionId}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Enter an email and perform an action to see user data
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Display */}
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Admin Information */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
              <CardDescription>
                Current admin access and authorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current User</h4>
                  <p className="text-sm text-muted-foreground">
                    Logged in as: <strong>{session?.user?.email}</strong>
                  </p>
                  {isAdmin ? (
                    <p className="text-sm text-green-600 mt-1">✅ You have admin access</p>
                  ) : (
                    <p className="text-sm text-red-600 mt-1">❌ You don't have admin access</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Authorized Admins</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {AUTHORIZED_ADMINS.map((adminEmail) => (
                      <li key={adminEmail} className="flex items-center gap-2">
                        {adminEmail === session?.user?.email ? (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                        {adminEmail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Available Actions</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>activate_paid</strong> - Activate paid subscription</li>
                    <li>• <strong>activate_trial</strong> - Activate 30-day trial</li>
                    <li>• <strong>deactivate</strong> - Deactivate subscription</li>
                    <li>• <strong>set_pro_plan</strong> - Set to Pro plan only</li>
                    <li>• <strong>set_free_plan</strong> - Set to Free plan only</li>
                    <li>• <strong>extend_trial</strong> - Extend trial period</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
