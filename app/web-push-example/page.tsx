'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Bell, Smartphone, Wifi } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function WebPushExamplePage() {
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

  const [testResults, setTestResults] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  const runComprehensiveTest = async () => {
    setIsTesting(true);
    setTestResults({});
    
    const results: any = {};

    try {
      // Test 1: Check browser support
      results.browserSupport = {
        success: isSupported,
        message: isSupported ? 'Browser supports web push notifications' : 'Browser does not support web push notifications'
      };

      // Test 2: Check permission
      results.permission = {
        success: permission === 'granted',
        message: `Permission status: ${permission}`
      };

      // Test 3: Check subscription
      results.subscription = {
        success: isSubscribed,
        message: isSubscribed ? 'User is subscribed to push notifications' : 'User is not subscribed to push notifications'
      };

      // Test 4: Test notification sending
      if (isSubscribed) {
        try {
          await sendTestNotification();
          results.notificationSend = {
            success: true,
            message: 'Test notification sent successfully'
          };
        } catch (error) {
          results.notificationSend = {
            success: false,
            message: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      } else {
        results.notificationSend = {
          success: false,
          message: 'Cannot test notification sending - user not subscribed'
        };
      }

      setTestResults(results);
    } catch (error) {
      console.error('Error running comprehensive test:', error);
    } finally {
      setIsTesting(false);
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
        {status ? 'Working' : 'Not Working'}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Web Push Notifications Example</h1>
        <p className="text-muted-foreground">
          Implementation following the next-pwa web-push example pattern
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="mr-2">
            <Wifi className="w-3 h-3 mr-1" />
            next-pwa
          </Badge>
          <Badge variant="outline">
            <Smartphone className="w-3 h-3 mr-1" />
            PWA Ready
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Status
            </CardTitle>
            <CardDescription>
              Current state of web push notifications in your browser
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Error Display */}
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

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Actions</CardTitle>
            <CardDescription>
              Manage your push notification subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Test */}
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Test</CardTitle>
            <CardDescription>
              Run a complete test of the web push notification system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runComprehensiveTest}
              disabled={isTesting}
              className="w-full mb-4"
            >
              {isTesting ? 'Running Tests...' : 'Run Comprehensive Test'}
            </Button>

            {Object.keys(testResults).length > 0 && (
              <div className="space-y-3">
                {Object.entries(testResults).map(([key, result]: [string, any]) => (
                  <Alert key={key}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.success)}
                      <span className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <AlertDescription>
                      {result.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Implementation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>
              This implementation follows the next-pwa web-push example pattern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Features Implemented:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Service Worker with push event handling</li>
                  <li>VAPID key management and validation</li>
                  <li>Push subscription management</li>
                  <li>Notification click and action handling</li>
                  <li>Error handling and retry logic</li>
                  <li>Comprehensive testing interface</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Based on:</h4>
                <p className="text-sm text-muted-foreground">
                  <a 
                    href="https://github.com/shadowwalker/next-pwa/tree/master/examples/web-push" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    next-pwa web-push example
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
