'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Bell, 
  Database, 
  Users, 
  Activity,
  RefreshCw,
  Send,
  Trash2
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationStats {
  totalUsers: number;
  usersWithSubscriptions: number;
  usersWithNotificationsEnabled: number;
  subscriptionRate: string;
  enabledRate: string;
  subscriptions: Array<{
    email: string;
    name: string;
    notificationEnabled: boolean;
    lastNotificationUpdate: string;
    hasValidSubscription: boolean;
    subscriptionEndpoint: string;
  }>;
  recentActivity: Array<{
    email: string;
    name: string;
    lastNotificationUpdate: string;
    notificationEnabled: boolean;
  }>;
}

export default function NotificationDashboard() {
  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError,
  } = useNotifications();

  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [isClearingSubscription, setIsClearingSubscription] = useState(false);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('/api/notifications/db-status');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.error('Failed to load stats:', await response.text());
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const sendNotificationToAll = async () => {
    setIsSendingNotification(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          title: 'Database Integration Test',
          body: 'This notification was sent through the MongoDB-integrated system!',
          message: 'Testing MongoDB notification integration'
        }),
      });

      if (response.ok) {
        await loadStats(); // Refresh stats after sending
      } else {
        console.error('Failed to send notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsSendingNotification(false);
    }
  };

  const clearSubscription = async () => {
    setIsClearingSubscription(true);
    try {
      const response = await fetch('/api/notifications/clear-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await loadStats(); // Refresh stats after clearing
        // Also refresh the notification hook state
        window.location.reload();
      } else {
        console.error('Failed to clear subscription:', await response.text());
      }
    } catch (error) {
      console.error('Error clearing subscription:', error);
    } finally {
      setIsClearingSubscription(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? 'default' : 'destructive'}>
        {status ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Dashboard</h1>
        <p className="text-muted-foreground">
          MongoDB-integrated web push notification management system
        </p>
        <div className="mt-4 flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            MongoDB Connected
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Web Push Ready
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users in database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribed</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.usersWithSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.subscriptionRate || 0}% subscription rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enabled</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.usersWithNotificationsEnabled || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.enabledRate || 0}% enabled rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isSubscribed ? '✅' : '❌'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isSubscribed ? 'Subscribed' : 'Not subscribed'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          {stats?.recentActivity && stats.recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest notification updates from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(activity.notificationEnabled)}
                        <div>
                          <p className="font-medium">{activity.name || activity.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Last update: {new Date(activity.lastNotificationUpdate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(activity.notificationEnabled)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Active Subscriptions
                </span>
                <Button 
                  onClick={loadStats} 
                  disabled={isLoadingStats}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                Users with active push notification subscriptions in MongoDB
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading subscriptions...
                </div>
              ) : stats?.subscriptions && stats.subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {stats.subscriptions.map((subscription, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(subscription.hasValidSubscription)}
                        <div>
                          <p className="font-medium">{subscription.name || subscription.email}</p>
                          <p className="text-sm text-muted-foreground">{subscription.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Endpoint: {subscription.subscriptionEndpoint}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last update: {new Date(subscription.lastNotificationUpdate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(subscription.notificationEnabled)}
                        {getStatusBadge(subscription.hasValidSubscription)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active subscriptions found</p>
                  <p className="text-sm">Users need to subscribe to push notifications first</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          {/* Your Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Your Notification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(isSupported)}
                      <span className="font-medium">Browser Support</span>
                    </div>
                    {getStatusBadge(isSupported)}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(permission === 'granted')}
                      <span className="font-medium">Permission</span>
                    </div>
                    <Badge variant={permission === 'granted' ? 'default' : permission === 'denied' ? 'destructive' : 'secondary'}>
                      {permission}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(isSubscribed)}
                      <span className="font-medium">Subscription</span>
                    </div>
                    {getStatusBadge(isSubscribed)}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="w-4 h-4" />
                    <AlertDescription>
                      {error}
                      <Button 
                        onClick={clearError} 
                        variant="outline" 
                        size="sm" 
                        className="ml-2"
                      >
                        Clear
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  {!isSupported && (
                    <Alert>
                      <XCircle className="w-4 h-4" />
                      <AlertDescription>
                        Your browser does not support web push notifications
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {isSupported && permission !== 'granted' && (
                    <Button 
                      onClick={requestPermission} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Requesting...' : 'Request Permission'}
                    </Button>
                  )}
                  
                  {permission === 'granted' && !isSubscribed && (
                    <Button 
                      onClick={subscribe} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Subscribing...' : 'Subscribe to Notifications'}
                    </Button>
                  )}
                  
                  {isSubscribed && (
                    <div className="space-y-2">
                      <Button 
                        onClick={sendTestNotification} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? 'Sending...' : 'Send Test Notification'}
                      </Button>
                      <Button 
                        onClick={unsubscribe} 
                        disabled={isLoading}
                        variant="outline"
                        className="w-full"
                      >
                        {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                      </Button>
                      <Button 
                        onClick={clearSubscription} 
                        disabled={isClearingSubscription}
                        variant="destructive"
                        className="w-full"
                      >
                        {isClearingSubscription ? 'Clearing...' : 'Clear Subscription (Fix VAPID)'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Admin Testing
              </CardTitle>
              <CardDescription>
                Send test notifications to all subscribed users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Send to All Subscribers</p>
                    <p className="text-sm text-muted-foreground">
                      Send a test notification to all users with active subscriptions
                    </p>
                  </div>
                  <Button 
                    onClick={sendNotificationToAll}
                    disabled={isSendingNotification || !stats?.usersWithSubscriptions}
                    variant="outline"
                  >
                    {isSendingNotification ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to All
                      </>
                    )}
                  </Button>
                </div>

                {stats?.usersWithSubscriptions === 0 && (
                  <Alert>
                    <Bell className="w-4 h-4" />
                    <AlertDescription>
                      No users are currently subscribed to notifications. 
                      Subscribe yourself first to test the system.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
