'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Bell } from 'lucide-react';

export default function NotificationTestPage() {
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('Checking...');
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkServiceWorkerStatus();
    checkNotificationPermission();
  }, []);

  const checkServiceWorkerStatus = async () => {
    if (!('serviceWorker' in navigator)) {
      setServiceWorkerStatus('Not Supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        setServiceWorkerStatus('Registered');
        console.log('✅ Service worker found:', registration);
      } else {
        setServiceWorkerStatus('Not Registered');
      }
    } catch (error) {
      console.error('Error checking service worker:', error);
      setServiceWorkerStatus('Error');
    }
  };

  const checkNotificationPermission = () => {
    setNotificationPermission(Notification.permission);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  };

  const testServiceWorkerMessage = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        throw new Error('No active service worker');
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
        setIsLoading(false);
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
      console.log('🔍 Check service worker console for response');

    } catch (error) {
      console.error('Error testing service worker message:', error);
      setTestResults((prev: any) => ({
        ...prev,
        messageTest: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }));
      setIsLoading(false);
    }
  };

  const testPushNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          message: 'Test notification from notification test page'
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
    } finally {
      setIsLoading(false);
    }
  };

  const testLocalNotification = async () => {
    if (notificationPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        alert('Notification permission is required for this test');
        return;
      }
    }

    try {
      const notification = new Notification('Test Notification', {
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
          message: 'Local notification created'
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Event Listener Test</h1>
        <p className="text-muted-foreground">
          Test if your service worker event listeners are working correctly
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Service Worker Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={serviceWorkerStatus === 'Registered' ? 'default' : 'secondary'}>
                {serviceWorkerStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Permission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>
                  {notificationPermission}
                </Badge>
                {notificationPermission !== 'granted' && (
                  <Button size="sm" onClick={requestNotificationPermission}>
                    Request Permission
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        )}

        {/* Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Event Listener Tests</CardTitle>
            <CardDescription>
              Test different aspects of your notification system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={testServiceWorkerMessage}
                disabled={isLoading || serviceWorkerStatus !== 'Registered'}
                className="w-full"
              >
                Test Service Worker Message
              </Button>

              <Button 
                onClick={testPushNotification}
                disabled={isLoading || serviceWorkerStatus !== 'Registered'}
                className="w-full"
              >
                Test Push Notification
              </Button>

              <Button 
                onClick={testLocalNotification}
                disabled={isLoading}
                className="w-full"
              >
                Test Local Notification
              </Button>
            </div>

            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Instructions:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Open browser DevTools (F12)</li>
                  <li>Go to Application tab → Service Workers</li>
                  <li>Click on the console link next to your service worker</li>
                  <li>Run the tests and check both main console and service worker console</li>
                  <li>Look for logs starting with 🔔, 📨, ✅, or ❌</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}