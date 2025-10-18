"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Flag, Bell, Users, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Settings className="h-8 w-8" />
              Admin Dashboard Test
            </h1>
            <p className="text-muted-foreground mt-2">
              Test the unified admin dashboard functionality
            </p>
          </div>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              The unified admin dashboard consolidates all admin functionality into one place.
              Access it at <code>/admin</code> (requires admin authorization).
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Unified Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Unified Admin Dashboard
                </CardTitle>
                <CardDescription>
                  All admin features in one place
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Feature Flag Management</li>
                    <li>• Push Notifications</li>
                    <li>• Manual Subscriptions</li>
                    <li>• Static Features Overview</li>
                    <li>• System Statistics</li>
                  </ul>
                </div>
                <Link href="/admin">
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Open Unified Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Individual Admin Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Individual Admin Pages
                </CardTitle>
                <CardDescription>
                  Legacy individual admin pages (still functional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Link href="/admin/feature-flags">
                    <Button variant="outline" className="w-full justify-start">
                      <Flag className="h-4 w-4 mr-2" />
                      Feature Flags
                    </Button>
                  </Link>
                  <Link href="/admin/notifications">
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                  </Link>
                  <Link href="/admin/manual-subscription">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Manual Subscriptions
                    </Button>
                  </Link>
                  <Link href="/admin/features">
                    <Button variant="outline" className="w-full justify-start">
                      <Crown className="h-4 w-4 mr-2" />
                      Static Features
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Features */}
          <Card>
            <CardHeader>
              <CardTitle>Unified Dashboard Features</CardTitle>
              <CardDescription>
                What you can do in the unified admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Feature Flags
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create new feature flags</li>
                    <li>• Enable/disable features</li>
                    <li>• Set rollout percentages</li>
                    <li>• Target specific users</li>
                    <li>• Platform-specific controls</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Send push notifications</li>
                    <li>• View subscriber statistics</li>
                    <li>• Check notification history</li>
                    <li>• Configure notification settings</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Subscriptions
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Grant Pro subscriptions</li>
                    <li>• Revoke subscriptions</li>
                    <li>• Check user status</li>
                    <li>• View user information</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Static Features
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• View hard-coded features</li>
                    <li>• Plan comparison</li>
                    <li>• Feature statistics</li>
                    <li>• Plan availability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Information */}
          <Card>
            <CardHeader>
              <CardTitle>Access Information</CardTitle>
              <CardDescription>
                How to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Authorization</h4>
                  <p className="text-sm text-muted-foreground">
                    Only authorized admin emails can access the dashboard. Current authorized admin: <code>mackewinsson@gmail.com</code>
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Current User</h4>
                  <p className="text-sm text-muted-foreground">
                    Logged in as: <strong>{session?.user?.email}</strong>
                  </p>
                  {session?.user?.email === 'mackewinsson@gmail.com' ? (
                    <p className="text-sm text-green-600 mt-1">✅ You have admin access</p>
                  ) : (
                    <p className="text-sm text-red-600 mt-1">❌ You don't have admin access</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">URLs</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <code>/admin</code> - Unified admin dashboard</li>
                    <li>• <code>/admin/feature-flags</code> - Feature flags only</li>
                    <li>• <code>/admin/notifications</code> - Notifications only</li>
                    <li>• <code>/admin/manual-subscription</code> - Subscriptions only</li>
                    <li>• <code>/admin/features</code> - Static features only</li>
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
