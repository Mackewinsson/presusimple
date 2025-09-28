"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell, Send, Users, BarChart3, History, Settings } from "lucide-react";

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

interface NotificationStats {
  totalSubscribers: number;
  activeSubscribers: number;
  notificationsSent: number;
  lastNotificationSent: string | null;
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  recipients: number;
  success: boolean;
}

export default function NotificationsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/budget");
  const [requireInteraction, setRequireInteraction] = useState(false);
  const [silent, setSilent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Stats and history
  const [stats, setStats] = useState<NotificationStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    notificationsSent: 0,
    lastNotificationSent: null,
  });
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  // Check if user is authorized
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    const userEmail = session.user?.email;
    if (!userEmail || !AUTHORIZED_ADMINS.includes(userEmail)) {
      toast.error("Access denied. You are not authorized to view this page.");
      router.replace("/budget");
      return;
    }
  }, [session, status, router]);

  // Load stats and history
  useEffect(() => {
    if (session?.user?.email && AUTHORIZED_ADMINS.includes(session.user.email)) {
      loadStats();
      loadHistory();
    }
  }, [session]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/notifications/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/admin/notifications/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          message: 'Test notification from admin panel',
        }),
      });

      if (response.ok) {
        toast.success("Test notification sent successfully!");
        loadStats();
        loadHistory();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send test notification");
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error("Failed to send test notification");
    } finally {
      setLoading(false);
    }
  };

  const sendCustomNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in title and body");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || '/budget',
          requireInteraction,
          silent,
        }),
      });

      if (response.ok) {
        toast.success("Notification sent successfully!");
        setTitle("");
        setBody("");
        setUrl("/budget");
        setRequireInteraction(false);
        setSilent(false);
        loadStats();
        loadHistory();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send notification");
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show unauthorized message
  if (!session || !AUTHORIZED_ADMINS.includes(session.user?.email || "")) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You are not authorized to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Bell className="h-8 w-8" />
              Notification Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Send notifications to users and manage subscriptions
            </p>
            <p className="text-sm text-green-600 mt-1">
              Logged in as: {session.user?.email}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
                <p className="text-xs text-muted-foreground">
                  Users with notifications enabled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.notificationsSent}</div>
                <p className="text-xs text-muted-foreground">
                  Total notifications sent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Sent</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {stats.lastNotificationSent 
                    ? new Date(stats.lastNotificationSent).toLocaleDateString()
                    : 'Never'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Most recent notification
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Send Test Notification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Send Test Notification
                </CardTitle>
                <CardDescription>
                  Send a test notification to yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    This will send a test notification to your own device to verify the system is working.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={sendTestNotification} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Test Notification"}
                </Button>
              </CardContent>
            </Card>

            {/* Send Custom Notification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Custom Notification
                </CardTitle>
                <CardDescription>
                  Send a custom notification to all subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">URL (optional)</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/budget"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireInteraction"
                      checked={requireInteraction}
                      onCheckedChange={setRequireInteraction}
                    />
                    <Label htmlFor="requireInteraction">Require Interaction</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="silent"
                      checked={silent}
                      onCheckedChange={setSilent}
                    />
                    <Label htmlFor="silent">Silent Notification</Label>
                  </div>
                </div>

                <Button 
                  onClick={sendCustomNotification} 
                  disabled={loading || !title.trim() || !body.trim()}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send to All Subscribers"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notification History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>
                History of sent notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No notifications sent yet
                </p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 10).map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge variant={notification.success ? "default" : "destructive"}>
                            {notification.success ? "Sent" : "Failed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.recipients} recipients • {new Date(notification.sentAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
