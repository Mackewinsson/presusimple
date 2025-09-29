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
  Trash2,
  AlertTriangle,
  Info,
  Wifi,
  WifiOff
} from 'lucide-react';

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

export default function NotificationDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const info: DebugInfo = {
      serviceWorkerStatus: 'Unknown',
      serviceWorkerScope: '',
      serviceWorkerState: '',
      notificationPermission: 'default',
      isSupported: false,
      isSubscribed: false,
      subscriptionEndpoint: '',
      vapidPublicKey: '',
      browserInfo: '',
      isSecureContext: false,
      errors: []
    };

    try {
      // Check browser support
      info.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      info.notificationPermission = 'Notification' in window ? Notification.permission : 'denied';
      info.isSecureContext = window.isSecureContext;
      info.browserInfo = navigator.userAgent;

      // Check service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            info.serviceWorkerStatus = 'Registered';
            info.serviceWorkerScope = registration.scope;
            info.serviceWorkerState = registration.active?.state || 'No active worker';
          } else {
            info.serviceWorkerStatus = 'Not Registered';
          }
        } catch (error) {
          info.serviceWorkerStatus = 'Error';
          info.errors.push(`Service Worker Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Check subscription
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            info.isSubscribed = true;
            info.subscriptionEndpoint = subscription.endpoint;
          }
        } catch (error) {
          info.errors.push(`Subscription Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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

    } catch (error) {
      info.errors.push(`General Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  const testServiceWorkerMessage = async () => {
    setIsRunningTests(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        throw new Error('No active service worker found');
      }

      // Create a message channel for response
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        console.log('Response from service worker:', event.data);
        setTestResults((prev: any) => ({
          ...prev,
          messageTest: {
            success: true,
            response: event.data
          }
        }));
        setIsRunningTests(false);
      };

      // Send test message
      registration.active.postMessage(
        { 
          type: 'TEST_MESSAGE', 
          data: 'Testing service worker communication',
          timestamp: Date.now()
        },
        [messageChannel.port2]
      );

      console.log('📤 Test message sent to service worker');

    } catch (error) {
      console.error('Error testing service worker message:', error);
      setTestResults((prev: any) => ({
        ...prev,
        messageTest: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }));
      setIsRunningTests(false);
    }
  };

  const testLocalNotification = async () => {
    if (debugInfo?.notificationPermission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission is required for this test');
        return;
      }
    }

    try {
      const notification = new Notification('Local Test Notification', {
        body: 'This is a test notification from the main thread',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });

      notification.onclick = () => {
        console.log('Local notification clicked');
        notification.close();
      };

      setTestResults((prev: any) => ({
        ...prev,
        localTest: {
          success: true,
          message: 'Local notification created successfully'
        }
      }));

    } catch (error) {
      console.error('Error creating local notification:', error);
      setTestResults((prev: any) => ({
        ...prev,
        localTest: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }));
    }
  };

  const testPushNotification = async () => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          title: 'Debug Test Notification',
          body: 'This is a test notification from the debug page',
          message: 'Testing notification delivery'
        })
      });

      const result = await response.json();
      console.log('Test notification result:', result);
      
      setTestResults((prev: any) => ({
        ...prev,
        pushTest: {
          success: response.ok,
          result
        }
      }));

    } catch (error) {
      console.error('Error testing push notification:', error);
      setTestResults((prev: any) => ({
        ...prev,
        pushTest: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }));
    }
  };

  const clearSubscription = async () => {
    try {
      const response = await fetch('/api/notifications/clear-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await runDiagnostics(); // Refresh diagnostics
        window.location.reload();
      } else {
        console.error('Failed to clear subscription:', await response.text());
      }
    } catch (error) {
      console.error('Error clearing subscription:', error);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

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
        {status ? 'Working' : 'Not Working'}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Debug Center</h1>
        <p className="text-muted-foreground">
          Comprehensive debugging for notification delivery issues
        </p>
        <div className="mt-4 flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Debug Mode
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Troubleshooting
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="diagnostics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Diagnostics
                </span>
                <Button 
                  onClick={runDiagnostics} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                Current status of your notification system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Running diagnostics...
                </div>
              ) : debugInfo ? (
                <div className="space-y-4">
                  {/* Browser Support */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(debugInfo.isSupported)}
                      <span className="font-medium">Browser Support</span>
                    </div>
                    {getStatusBadge(debugInfo.isSupported)}
                  </div>

                  {/* Secure Context */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {debugInfo.isSecureContext ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                      <span className="font-medium">Secure Context</span>
                    </div>
                    <Badge variant={debugInfo.isSecureContext ? 'default' : 'destructive'}>
                      {debugInfo.isSecureContext ? 'HTTPS/localhost' : 'Not Secure'}
                    </Badge>
                  </div>

                  {/* Service Worker */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(debugInfo.serviceWorkerStatus === 'Registered')}
                      <span className="font-medium">Service Worker</span>
                    </div>
                    <div className="text-right">
                      <Badge variant={debugInfo.serviceWorkerStatus === 'Registered' ? 'default' : 'destructive'}>
                        {debugInfo.serviceWorkerStatus}
                      </Badge>
                      {debugInfo.serviceWorkerScope && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Scope: {debugInfo.serviceWorkerScope}
                        </p>
                      )}
                      {debugInfo.serviceWorkerState && (
                        <p className="text-xs text-muted-foreground">
                          State: {debugInfo.serviceWorkerState}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notification Permission */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(debugInfo.notificationPermission === 'granted')}
                      <span className="font-medium">Notification Permission</span>
                    </div>
                    <Badge variant={debugInfo.notificationPermission === 'granted' ? 'default' : debugInfo.notificationPermission === 'denied' ? 'destructive' : 'secondary'}>
                      {debugInfo.notificationPermission}
                    </Badge>
                  </div>

                  {/* Subscription */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(debugInfo.isSubscribed)}
                      <span className="font-medium">Push Subscription</span>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(debugInfo.isSubscribed)}
                      {debugInfo.subscriptionEndpoint && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {debugInfo.subscriptionEndpoint.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* VAPID Key */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(!!debugInfo.vapidPublicKey)}
                      <span className="font-medium">VAPID Public Key</span>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(!!debugInfo.vapidPublicKey)}
                      {debugInfo.vapidPublicKey && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {debugInfo.vapidPublicKey.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Errors */}
                  {debugInfo.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Errors Found:</strong>
                        <ul className="list-disc list-inside mt-2">
                          {debugInfo.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Refresh" to run diagnostics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Notification Testing
              </CardTitle>
              <CardDescription>
                Test different aspects of the notification system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={testServiceWorkerMessage}
                  disabled={isRunningTests || debugInfo?.serviceWorkerStatus !== 'Registered'}
                  className="w-full"
                >
                  Test Service Worker
                </Button>

                <Button 
                  onClick={testLocalNotification}
                  disabled={isRunningTests}
                  className="w-full"
                >
                  Test Local Notification
                </Button>

                <Button 
                  onClick={testPushNotification}
                  disabled={isRunningTests}
                  className="w-full"
                >
                  Test Push Notification
                </Button>
              </div>

              {/* Test Results */}
              {Object.keys(testResults).length > 0 && (
                <div className="space-y-3">
                  {testResults.messageTest && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        {testResults.messageTest.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">Service Worker Message Test</span>
                      </div>
                      <AlertDescription>
                        {testResults.messageTest.success 
                          ? `✅ ${testResults.messageTest.response?.message || 'Message received successfully'}`
                          : `❌ ${testResults.messageTest.error}`
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  {testResults.localTest && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        {testResults.localTest.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">Local Notification Test</span>
                      </div>
                      <AlertDescription>
                        {testResults.localTest.success 
                          ? `✅ ${testResults.localTest.message}`
                          : `❌ ${testResults.localTest.error}`
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  {testResults.pushTest && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        {testResults.pushTest.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">Push Notification Test</span>
                      </div>
                      <AlertDescription>
                        {testResults.pushTest.success 
                          ? `✅ ${testResults.pushTest.result?.message || 'Push notification sent successfully'}`
                          : `❌ ${testResults.pushTest.error}`
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solutions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Common Solutions
              </CardTitle>
              <CardDescription>
                Solutions for common notification issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Issue: Service Worker Not Registered</strong>
                    <p className="mt-2">Solution: Enable PWA in development</p>
                    <code className="block mt-2 p-2 bg-muted rounded text-sm">
                      ENABLE_PWA_DEV=true npm run dev
                    </code>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Issue: Permission Not Granted</strong>
                    <p className="mt-2">Solution: Re-subscribe to notifications</p>
                    <p className="text-sm text-muted-foreground">Visit /web-push-example and click "Subscribe to Notifications"</p>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Issue: Notifications Sent But Not Received</strong>
                    <p className="mt-2">Solution: Check browser notification settings</p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>Chrome: Settings → Privacy → Site Settings → Notifications</li>
                      <li>Firefox: Settings → Privacy → Permissions → Notifications</li>
                      <li>Check if notifications are blocked for localhost</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Issue: VAPID Mismatch</strong>
                    <p className="mt-2">Solution: Clear subscription and re-subscribe</p>
                    <Button 
                      onClick={clearSubscription}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Subscription
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
