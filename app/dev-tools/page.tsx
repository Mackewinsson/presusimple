'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Trash2,
  AlertTriangle,
  Info,
  Wifi,
  WifiOff,
  Smartphone,
  Download,
  Settings,
  TestTube,
  Bug,
  Server,
  Key,
  Shield
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePWAStatus } from '@/hooks/usePWAStatus';

interface DebugInfo {
  serviceWorkerStatus: string;
  serviceWorkerScope: string;
  serviceWorkerState: string;
  notificationPermission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
  subscriptionEndpoint: string;
  vapidPublicKey: string;
  browserInfo: string;
  isSecureContext: boolean;
  errors: string[];
}

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

export default function DevToolsPage() {
  const {
    permission,
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError,
  } = useNotifications();

  const pwaInstall = usePWAInstall();
  const pwaStatus = usePWAStatus();

  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runDiagnostics = useCallback(async () => {
    setIsLoadingStats(true);
    const info: DebugInfo = {
      serviceWorkerStatus: 'Unknown',
      serviceWorkerScope: '',
      serviceWorkerState: '',
      notificationPermission: 'default',
      isSupported: false,
      isSubscribed: false,
      subscriptionEndpoint: '',
      vapidPublicKey: '',
      browserInfo: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      errors: [],
    };

    try {
      // Check service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          info.serviceWorkerStatus = 'Registered';
          info.serviceWorkerScope = registration.scope;
          info.serviceWorkerState = registration.active?.state || 'Unknown';
        } else {
          info.serviceWorkerStatus = 'Not Registered';
        }
      } else {
        info.serviceWorkerStatus = 'Not Supported';
      }

      // Check notification support
      info.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      info.notificationPermission = Notification.permission;

      // Check subscription
      if (subscription) {
        info.isSubscribed = true;
        info.subscriptionEndpoint = subscription.endpoint;
      }

      // Get VAPID public key
      try {
        const response = await fetch('/api/notifications/vapid-public-key');
        if (response.ok) {
          info.vapidPublicKey = await response.text();
        }
      } catch (error) {
        info.errors.push(`VAPID Key Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      setDebugInfo(info);
    } catch (error) {
      info.errors.push(`Diagnostic Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDebugInfo(info);
    } finally {
      setIsLoadingStats(false);
    }
  }, [subscription]);

  const loadNotificationStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('/api/admin/notifications/stats');
      if (response.ok) {
        const stats = await response.json();
        setNotificationStats(stats);
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const runComprehensiveTest = async () => {
    setIsRunningTests(true);
    setTestResults({});
    addLog('🧪 Starting comprehensive test suite...');
    
    const results: any = {};

    try {
      // Test 1: Browser Support
      addLog('🔍 Testing browser support...');
      results.browserSupport = {
        success: isSupported,
        message: isSupported ? 'Browser supports web push notifications' : 'Browser does not support web push notifications'
      };

      // Test 2: Permission
      addLog('🔐 Testing notification permission...');
      results.permission = {
        success: permission === 'granted',
        message: `Permission status: ${permission}`
      };

      // Test 3: Subscription
      addLog('📱 Testing push subscription...');
      results.subscription = {
        success: isSubscribed,
        message: isSubscribed ? 'User is subscribed to push notifications' : 'User is not subscribed to push notifications'
      };

      // Test 4: Service Worker
      addLog('⚙️ Testing service worker...');
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        results.serviceWorker = {
          success: !!registration,
          message: registration ? `Service worker registered: ${registration.scope}` : 'No service worker registration found'
        };
      } else {
        results.serviceWorker = {
          success: false,
          message: 'Service worker not supported'
        };
      }

      // Test 5: VAPID Configuration
      addLog('🔑 Testing VAPID configuration...');
      try {
        const response = await fetch('/api/notifications/vapid-public-key');
        results.vapid = {
          success: response.ok,
          message: response.ok ? 'VAPID public key accessible' : 'VAPID public key not accessible'
        };
      } catch (error) {
        results.vapid = {
          success: false,
          message: 'VAPID configuration error'
        };
      }

      // Test 6: Database Connection
      addLog('🗄️ Testing database connection...');
      try {
        const response = await fetch('/api/test-mongo');
        results.database = {
          success: response.ok,
          message: response.ok ? 'Database connection successful' : 'Database connection failed'
        };
      } catch (error) {
        results.database = {
          success: false,
          message: 'Database connection error'
        };
      }

      setTestResults(results);
      addLog('✅ Comprehensive test suite completed');
    } catch (error) {
      addLog(`❌ Test suite error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const sendTestNotificationToUser = async () => {
    addLog('📤 Sending test notification...');
    try {
      await sendTestNotification();
      addLog('✅ Test notification sent successfully');
    } catch (error) {
      addLog(`❌ Failed to send test notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearUserSubscription = async () => {
    addLog('🗑️ Clearing user subscription...');
    try {
      const response = await fetch('/api/notifications/clear-subscription', {
        method: 'POST',
      });
      if (response.ok) {
        addLog('✅ User subscription cleared');
        window.location.reload();
      } else {
        addLog('❌ Failed to clear subscription');
      }
    } catch (error) {
      addLog(`❌ Error clearing subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearStorage = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-accepted');
    sessionStorage.removeItem('user-interacted');
    addLog('🗑️ Storage cleared, reloading page...');
    window.location.reload();
  };

  useEffect(() => {
    runDiagnostics();
    loadNotificationStats();
  }, [subscription, runDiagnostics]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Developer Tools</h1>
          <p className="text-muted-foreground">
            Comprehensive testing and debugging tools for notifications and PWA features
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runDiagnostics} disabled={isLoadingStats} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={runComprehensiveTest} disabled={isRunningTests}>
            <TestTube className={`w-4 h-4 mr-2 ${isRunningTests ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button onClick={clearError} variant="outline" size="sm" className="ml-2">
              Clear
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="pwa">PWA</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Browser Support</CardTitle>
                {isSupported ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isSupported ? 'Supported' : 'Not Supported'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Web Push Notifications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Permission</CardTitle>
                <Bell className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{permission}</div>
                <p className="text-xs text-muted-foreground">
                  Notification Permission
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                {isSubscribed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isSubscribed ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Push Subscription
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PWA Status</CardTitle>
                {pwaStatus.isInstalled ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pwaStatus.isInstalled ? 'Installed' : 'Not Installed'}
                </div>
                <p className="text-xs text-muted-foreground">
                  PWA Installation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Secure Context</CardTitle>
                {typeof window !== 'undefined' && window.isSecureContext ? <Shield className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof window !== 'undefined' && window.isSecureContext ? 'Secure' : 'Insecure'}
                </div>
                <p className="text-xs text-muted-foreground">
                  HTTPS/Localhost
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Worker</CardTitle>
                {debugInfo?.serviceWorkerStatus === 'Registered' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {debugInfo?.serviceWorkerStatus || 'Unknown'}
                </div>
                <p className="text-xs text-muted-foreground">
                  SW Registration
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Controls</CardTitle>
                <CardDescription>Manage notification permissions and subscriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Permission</span>
                    <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                      {permission}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subscription</span>
                    <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                      {isSubscribed ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {permission !== 'granted' && (
                    <Button onClick={requestPermission} disabled={isLoading} className="w-full">
                      Request Permission
                    </Button>
                  )}
                  
                  {permission === 'granted' && !isSubscribed && (
                    <Button onClick={subscribe} disabled={isLoading} className="w-full">
                      Subscribe to Notifications
                    </Button>
                  )}
                  
                  {isSubscribed && (
                    <div className="space-y-2">
                      <Button onClick={sendTestNotificationToUser} disabled={isLoading} className="w-full">
                        Send Test Notification
                      </Button>
                      <Button onClick={unsubscribe} disabled={isLoading} variant="outline" className="w-full">
                        Unsubscribe
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Statistics</CardTitle>
                <CardDescription>Database statistics for notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {notificationStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{notificationStats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{notificationStats.usersWithSubscriptions}</div>
                        <p className="text-xs text-muted-foreground">With Subscriptions</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subscription Rate</span>
                        <span>{notificationStats.subscriptionRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Enabled Rate</span>
                        <span>{notificationStats.enabledRate}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No statistics available</p>
                    <Button onClick={loadNotificationStats} disabled={isLoadingStats} className="mt-2">
                      Load Statistics
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pwa" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>PWA Installation</CardTitle>
                <CardDescription>Manage PWA installation and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Installation Status</span>
                    <Badge variant={pwaStatus.isInstalled ? 'default' : 'secondary'}>
                      {pwaStatus.isInstalled ? 'Installed' : 'Not Installed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Can Install</span>
                    <Badge variant={pwaInstall.isInstallable ? 'default' : 'secondary'}>
                      {pwaInstall.isInstallable ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {pwaInstall.isInstallable && !pwaStatus.isInstalled && (
                    <Button onClick={pwaInstall.handleInstall} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Install PWA
                    </Button>
                  )}
                  
                  <Button onClick={clearStorage} variant="outline" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Storage & Reload
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PWA Debug Info</CardTitle>
                <CardDescription>Technical information about PWA status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>User Agent:</span>
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Secure Context:</span>
                    <Badge variant={typeof window !== 'undefined' && window.isSecureContext ? 'default' : 'destructive'}>
                      {typeof window !== 'undefined' && window.isSecureContext ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Standalone Mode:</span>
                    <Badge variant={typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? 'default' : 'secondary'}>
                      {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Worker:</span>
                    <Badge variant={typeof window !== 'undefined' && 'serviceWorker' in navigator ? 'default' : 'destructive'}>
                      {typeof window !== 'undefined' && 'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Connection Test</CardTitle>
              <CardDescription>Test MongoDB connection and retrieve database information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.open('/api/test-mongo', '_blank')} className="w-full">
                <Database className="w-4 h-4 mr-2" />
                Test Database Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Results from comprehensive testing suite</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(testResults).map(([key, result]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-sm text-muted-foreground">{result.message}</div>
                      </div>
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No test results available</p>
                  <p className="text-sm text-muted-foreground">Click "Run Tests" to execute the test suite</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Actions</CardTitle>
              <CardDescription>Advanced debugging and troubleshooting actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={clearUserSubscription} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear User Subscription (Fix VAPID)
              </Button>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Use this if you're experiencing VAPID credential mismatch errors. This will clear your current subscription and allow you to re-subscribe with the correct keys.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Debug Logs</CardTitle>
                <CardDescription>Real-time debugging information</CardDescription>
              </div>
              <Button onClick={clearLogs} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Logs
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No logs yet. Perform some actions to see debug information.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
