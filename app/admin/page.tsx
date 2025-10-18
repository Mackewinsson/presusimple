"use client";

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Settings, 
  Bell, 
  Flag, 
  Users, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Monitor, 
  Smartphone,
  Send,
  BarChart3,
  History,
  UserCheck,
  UserX
} from "lucide-react";
import { FEATURES } from "@/lib/features";

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

// Types
interface Feature {
  _id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  platforms: ('web' | 'mobile')[];
  userTypes: ('free' | 'pro' | 'admin')[];
  rolloutPercentage: number;
  targetUsers?: string[];
  excludeUsers?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

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

export default function UnifiedAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");
  
  // Feature Flags state
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isCreateFeatureDialogOpen, setIsCreateFeatureDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [featureFormData, setFeatureFormData] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
    platforms: [] as ('web' | 'mobile')[],
    userTypes: [] as ('free' | 'pro' | 'admin')[],
    rolloutPercentage: 100,
    targetUsers: '',
    excludeUsers: '',
    metadata: '',
  });

  // Notifications state
  const [notificationFormData, setNotificationFormData] = useState({
    title: '',
    body: '',
    url: '/budget',
    requireInteraction: false,
    silent: false,
  });
  const [notificationStats, setNotificationStats] = useState<NotificationStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    notificationsSent: 0,
    lastNotificationSent: null,
  });
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);

  // Manual Subscription state
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    email: '',
    action: '',
  });
  const [userData, setUserData] = useState<any>(null);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  // Loading states
  const [loading, setLoading] = useState(false);

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

  // Load data when component mounts
  useEffect(() => {
    if (session?.user?.email && AUTHORIZED_ADMINS.includes(session.user.email)) {
      loadFeatureFlags();
      loadNotificationStats();
      loadNotificationHistory();
    }
  }, [session]);

  // Feature Flags functions
  const loadFeatureFlags = async () => {
    try {
      const response = await fetch('/api/admin/features');
      if (response.ok) {
        const data = await response.json();
        setFeatures(data);
      }
    } catch (error) {
      console.error('Error loading features:', error);
    }
  };

  const handleCreateFeature = async () => {
    try {
      setLoading(true);
      
      const payload = {
        ...featureFormData,
        targetUsers: featureFormData.targetUsers ? featureFormData.targetUsers.split(',').map(id => id.trim()) : [],
        excludeUsers: featureFormData.excludeUsers ? featureFormData.excludeUsers.split(',').map(id => id.trim()) : [],
        metadata: featureFormData.metadata ? JSON.parse(featureFormData.metadata) : {},
      };

      const response = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Feature created successfully');
        setIsCreateFeatureDialogOpen(false);
        resetFeatureForm();
        loadFeatureFlags();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create feature');
      }
    } catch (error) {
      console.error('Error creating feature:', error);
      toast.error('Failed to create feature');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async (feature: Feature) => {
    try {
      const response = await fetch(`/api/admin/features/${feature.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !feature.enabled }),
      });

      if (response.ok) {
        toast.success(`Feature ${!feature.enabled ? 'enabled' : 'disabled'} successfully`);
        loadFeatureFlags();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update feature');
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Failed to update feature');
    }
  };

  const handleDeleteFeature = async (feature: Feature) => {
    if (!confirm(`Are you sure you want to delete the feature "${feature.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/features/${feature.key}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Feature deleted successfully');
        loadFeatureFlags();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete feature');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error('Failed to delete feature');
    } finally {
      setLoading(false);
    }
  };

  const resetFeatureForm = () => {
    setFeatureFormData({
      key: '',
      name: '',
      description: '',
      enabled: false,
      platforms: [],
      userTypes: [],
      rolloutPercentage: 100,
      targetUsers: '',
      excludeUsers: '',
      metadata: '',
    });
  };

  // Notifications functions
  const loadNotificationStats = async () => {
    try {
      const response = await fetch('/api/admin/notifications/stats');
      if (response.ok) {
        const data = await response.json();
        setNotificationStats(data);
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const response = await fetch('/api/admin/notifications/history');
      if (response.ok) {
        const data = await response.json();
        setNotificationHistory(data);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  };

  const sendNotification = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationFormData),
      });

      if (response.ok) {
        toast.success('Notification sent successfully');
        setNotificationFormData({
          title: '',
          body: '',
          url: '/budget',
          requireInteraction: false,
          silent: false,
        });
        loadNotificationStats();
        loadNotificationHistory();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  // Manual Subscription functions
  const fetchUserData = async (email: string) => {
    try {
      const response = await fetch(`/api/users/manual-subscription?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSubscriptionAction = async () => {
    try {
      setLoading(true);
      setSubscriptionMessage('');

      const response = await fetch('/api/users/manual-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscriptionMessage(data.message);
        toast.success(data.message);
        // Fetch updated user data after successful action
        if (subscriptionFormData.action === 'check') {
          await fetchUserData(subscriptionFormData.email);
        } else {
          // For other actions, fetch user data to show updated status
          await fetchUserData(subscriptionFormData.email);
        }
      } else {
        toast.error(data.error || 'Failed to perform subscription action');
        setSubscriptionMessage(data.error || 'Failed to perform subscription action');
      }
    } catch (error) {
      console.error('Error performing subscription action:', error);
      toast.error('Failed to perform subscription action');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const plans = ["free", "pro"] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Settings className="h-8 w-8" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Unified management for all admin features
            </p>
            <p className="text-sm text-green-600 mt-1">
              Logged in as: {session?.user?.email}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="feature-flags">Feature Flags</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="static-features">Static Features</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Feature Flags</CardTitle>
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{features.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Dynamic feature flags
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Notification Subscribers</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{notificationStats.totalSubscribers}</div>
                    <p className="text-xs text-muted-foreground">
                      Total subscribers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{notificationStats.activeSubscribers}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Static Features</CardTitle>
                    <Crown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Object.keys(FEATURES).length}</div>
                    <p className="text-xs text-muted-foreground">
                      Hard-coded features
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Feature Flags</CardTitle>
                    <CardDescription>
                      Latest dynamic feature flags
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {features.slice(0, 5).map((feature) => (
                        <div key={feature._id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            <p className="text-sm text-muted-foreground">{feature.key}</p>
                          </div>
                          <Badge variant={feature.enabled ? "default" : "secondary"}>
                            {feature.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      ))}
                      {features.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No feature flags yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Admin Users</CardTitle>
                    <CardDescription>
                      Authorized admin users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {AUTHORIZED_ADMINS.map((email) => (
                        <div key={email} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{email}</p>
                            <p className="text-sm text-muted-foreground">Admin</p>
                          </div>
                          <Badge variant={email === session?.user?.email ? "default" : "secondary"}>
                            {email === session?.user?.email ? "Current User" : "Admin"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Stats</CardTitle>
                  <CardDescription>
                    Push notification statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span>Total Sent</span>
                      <span className="font-medium">{notificationStats.notificationsSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sent</span>
                      <span className="font-medium">
                        {notificationStats.lastNotificationSent 
                          ? new Date(notificationStats.lastNotificationSent).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feature Flags Tab */}
            <TabsContent value="feature-flags" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Feature Flags</h2>
                  <p className="text-muted-foreground">Manage dynamic feature flags</p>
                </div>
                <Dialog open={isCreateFeatureDialogOpen} onOpenChange={setIsCreateFeatureDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Feature Flag
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Feature Flag</DialogTitle>
                      <DialogDescription>
                        Create a new feature flag that can be controlled across web and mobile platforms.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="key">Feature Key</Label>
                          <Input
                            id="key"
                            value={featureFormData.key}
                            onChange={(e) => setFeatureFormData({ ...featureFormData, key: e.target.value })}
                            placeholder="e.g., new_dashboard"
                          />
                        </div>
                        <div>
                          <Label htmlFor="name">Feature Name</Label>
                          <Input
                            id="name"
                            value={featureFormData.name}
                            onChange={(e) => setFeatureFormData({ ...featureFormData, name: e.target.value })}
                            placeholder="e.g., New Dashboard"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={featureFormData.description}
                          onChange={(e) => setFeatureFormData({ ...featureFormData, description: e.target.value })}
                          placeholder="Describe what this feature does..."
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enabled"
                          checked={featureFormData.enabled}
                          onCheckedChange={(checked) => setFeatureFormData({ ...featureFormData, enabled: checked })}
                        />
                        <Label htmlFor="enabled">Enabled by default</Label>
                      </div>

                      <div>
                        <Label>Platforms</Label>
                        <div className="flex space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="web"
                              checked={featureFormData.platforms.includes('web')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFeatureFormData({ ...featureFormData, platforms: [...featureFormData.platforms, 'web'] });
                                } else {
                                  setFeatureFormData({ ...featureFormData, platforms: featureFormData.platforms.filter(p => p !== 'web') });
                                }
                              }}
                            />
                            <Label htmlFor="web" className="flex items-center">
                              <Monitor className="h-4 w-4 mr-1" />
                              Web
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="mobile"
                              checked={featureFormData.platforms.includes('mobile')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFeatureFormData({ ...featureFormData, platforms: [...featureFormData.platforms, 'mobile'] });
                                } else {
                                  setFeatureFormData({ ...featureFormData, platforms: featureFormData.platforms.filter(p => p !== 'mobile') });
                                }
                              }}
                            />
                            <Label htmlFor="mobile" className="flex items-center">
                              <Smartphone className="h-4 w-4 mr-1" />
                              Mobile
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>User Types</Label>
                        <div className="flex space-x-4 mt-2">
                          {['free', 'pro', 'admin'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={type}
                                checked={featureFormData.userTypes.includes(type as any)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFeatureFormData({ ...featureFormData, userTypes: [...featureFormData.userTypes, type as any] });
                                  } else {
                                    setFeatureFormData({ ...featureFormData, userTypes: featureFormData.userTypes.filter(t => t !== type) });
                                  }
                                }}
                              />
                              <Label htmlFor={type} className="capitalize">{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="rollout">Rollout Percentage</Label>
                        <Input
                          id="rollout"
                          type="number"
                          min="0"
                          max="100"
                          value={featureFormData.rolloutPercentage}
                          onChange={(e) => setFeatureFormData({ ...featureFormData, rolloutPercentage: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateFeatureDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateFeature} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Create Feature
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {features.map((feature) => (
                  <Card key={feature._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {feature.name}
                            <Badge variant={feature.enabled ? "default" : "secondary"}>
                              {feature.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={feature.enabled}
                            onCheckedChange={() => handleToggleFeature(feature)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFeature(feature)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <strong>Key:</strong> <code>{feature.key}</code>
                        </div>
                        <div>
                          <strong>Platforms:</strong> {feature.platforms.join(', ')}
                        </div>
                        <div>
                          <strong>User Types:</strong> {feature.userTypes.join(', ')}
                        </div>
                        <div>
                          <strong>Rollout:</strong> {feature.rolloutPercentage}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {features.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No feature flags yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first feature flag to start controlling features across your applications.
                    </p>
                    <Button onClick={() => setIsCreateFeatureDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Feature Flag
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-muted-foreground">Send push notifications to users</p>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{notificationStats.totalSubscribers}</div>
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
                    <div className="text-2xl font-bold">{notificationStats.activeSubscribers}</div>
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
                    <div className="text-2xl font-bold">{notificationStats.notificationsSent}</div>
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
                    <div className="text-2xl font-bold">
                      {notificationStats.lastNotificationSent 
                        ? new Date(notificationStats.lastNotificationSent).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Most recent notification
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Send Notification</CardTitle>
                  <CardDescription>
                    Send a push notification to all subscribed users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={notificationFormData.title}
                      onChange={(e) => setNotificationFormData({ ...notificationFormData, title: e.target.value })}
                      placeholder="Notification title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Message</Label>
                    <Textarea
                      id="body"
                      value={notificationFormData.body}
                      onChange={(e) => setNotificationFormData({ ...notificationFormData, body: e.target.value })}
                      placeholder="Notification message"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={notificationFormData.url}
                      onChange={(e) => setNotificationFormData({ ...notificationFormData, url: e.target.value })}
                      placeholder="/budget"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireInteraction"
                        checked={notificationFormData.requireInteraction}
                        onCheckedChange={(checked) => setNotificationFormData({ ...notificationFormData, requireInteraction: checked })}
                      />
                      <Label htmlFor="requireInteraction">Require Interaction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="silent"
                        checked={notificationFormData.silent}
                        onCheckedChange={(checked) => setNotificationFormData({ ...notificationFormData, silent: checked })}
                      />
                      <Label htmlFor="silent">Silent</Label>
                    </div>
                  </div>
                  <Button onClick={sendNotification} disabled={loading || !notificationFormData.title || !notificationFormData.body}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification History</CardTitle>
                  <CardDescription>
                    Recent notifications sent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {notificationHistory.map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.body}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={notification.success ? "default" : "destructive"}>
                            {notification.success ? "Success" : "Failed"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.recipients} recipients
                          </p>
                        </div>
                      </div>
                    ))}
                    {notificationHistory.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No notifications sent yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Manual Subscription Management</h2>
                <p className="text-muted-foreground">Manually manage user subscriptions</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Actions</CardTitle>
                  <CardDescription>
                    Grant or revoke Pro subscriptions for specific users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">User Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={subscriptionFormData.email}
                      onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="action">Action</Label>
                    <Select value={subscriptionFormData.action} onValueChange={(value) => setSubscriptionFormData({ ...subscriptionFormData, action: value })}>
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
                    onClick={handleSubscriptionAction} 
                    disabled={loading || !subscriptionFormData.email || !subscriptionFormData.action}
                  >
                    {subscriptionFormData.action === 'activate_paid' && <UserCheck className="h-4 w-4 mr-2" />}
                    {subscriptionFormData.action === 'activate_trial' && <UserCheck className="h-4 w-4 mr-2" />}
                    {subscriptionFormData.action === 'deactivate' && <UserX className="h-4 w-4 mr-2" />}
                    {subscriptionFormData.action === 'set_pro_plan' && <UserCheck className="h-4 w-4 mr-2" />}
                    {subscriptionFormData.action === 'set_free_plan' && <UserX className="h-4 w-4 mr-2" />}
                    {subscriptionFormData.action === 'extend_trial' && <Users className="h-4 w-4 mr-2" />}
                    {subscriptionFormData.action === 'activate_paid' && 'Activate Paid'}
                    {subscriptionFormData.action === 'activate_trial' && 'Activate Trial'}
                    {subscriptionFormData.action === 'deactivate' && 'Deactivate'}
                    {subscriptionFormData.action === 'set_pro_plan' && 'Set Pro Plan'}
                    {subscriptionFormData.action === 'set_free_plan' && 'Set Free Plan'}
                    {subscriptionFormData.action === 'extend_trial' && 'Extend Trial'}
                    {!subscriptionFormData.action && 'Select Action'}
                  </Button>
                </CardContent>
              </Card>

              {subscriptionMessage && (
                <Alert>
                  <AlertDescription>{subscriptionMessage}</AlertDescription>
                </Alert>
              )}

              {userData && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Static Features Tab */}
            <TabsContent value="static-features" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Static Features</h2>
                <p className="text-muted-foreground">Hard-coded features and their plan availability</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Overview</CardTitle>
                  <CardDescription>
                    All features and their plan availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(FEATURES).map(([key, feature]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{feature.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                          </div>
                          <Badge variant="outline">
                            {key}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {plans.map((plan) => {
                            const hasAccess = feature.plans.includes(plan as any);
                            return (
                              <div key={plan} className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {hasAccess ? (
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-400" />
                                  )}
                                  <span className={`text-sm font-medium ${
                                    hasAccess ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {plan === "pro" ? (
                                      <span className="flex items-center gap-1">
                                        <Crown className="h-3 w-3" />
                                        Pro
                                      </span>
                                    ) : (
                                      "Free"
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Comparison</CardTitle>
                  <CardDescription>
                    What each plan includes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                      <div key={plan} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          {plan === "pro" ? (
                            <Crown className="h-5 w-5 text-amber-400" />
                          ) : (
                            <Users className="h-5 w-5 text-slate-400" />
                          )}
                          <h3 className={`font-semibold text-lg ${
                            plan === "pro" ? "text-amber-400" : "text-foreground"
                          }`}>
                            {plan === "pro" ? "Pro Plan" : "Free Plan"}
                          </h3>
                        </div>
                        
                        <div className="space-y-2">
                          {Object.entries(FEATURES)
                            .filter(([_, feature]) => feature.plans.includes(plan as any))
                            .map(([key, feature]) => (
                              <div key={key} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span className="text-sm">{feature.label}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
