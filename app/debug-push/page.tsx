'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function DebugPushPage() {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  const testServiceWorkerStatus = async () => {
    addLog('🔍 Checking service worker status...');
    
    if (!('serviceWorker' in navigator)) {
      addLog('❌ Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        addLog(`✅ Service worker registered: ${registration.scope}`);
        addLog(`📱 Active worker: ${registration.active?.state || 'none'}`);
        addLog(`📱 Installing worker: ${registration.installing?.state || 'none'}`);
        addLog(`📱 Waiting worker: ${registration.waiting?.state || 'none'}`);
        addLog(`🔔 Push manager: ${registration.pushManager ? 'available' : 'not available'}`);
      } else {
        addLog('❌ No service worker registration found');
      }
    } catch (error) {
      addLog(`❌ Error checking service worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testNotificationPermission = async () => {
    addLog('🔔 Checking notification permission...');
    
    if (!('Notification' in window)) {
      addLog('❌ Notifications not supported');
      return;
    }

    const permission = Notification.permission;
    addLog(`📋 Current permission: ${permission}`);

    if (permission === 'default') {
      addLog('⚠️ Permission is default, requesting...');
      const newPermission = await Notification.requestPermission();
      addLog(`📋 New permission: ${newPermission}`);
    }
  };

  const testLocalNotification = async () => {
    addLog('🧪 Testing local notification...');
    
    if (Notification.permission !== 'granted') {
      addLog('❌ Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification('Debug Test', {
        body: 'This is a test notification from the main thread',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'debug-test'
      });

      notification.onclick = () => {
        addLog('✅ Local notification clicked');
        notification.close();
      };

      notification.onshow = () => {
        addLog('✅ Local notification shown');
      };

      notification.onerror = (error) => {
        addLog(`❌ Local notification error: ${error}`);
      };

      addLog('✅ Local notification created successfully');
    } catch (error) {
      addLog(`❌ Error creating local notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testPushNotification = async () => {
    setIsLoading(true);
    addLog('🚀 Testing push notification...');
    
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          message: 'Debug push notification test'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        addLog(`✅ Push notification sent successfully: ${result.message}`);
        addLog('🔍 Check service worker console for push event logs');
        addLog('🔍 Look for logs starting with 🔔, 📦, 🎯, ✅, or ❌');
      } else {
        addLog(`❌ Push notification failed: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Error sending push notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testServiceWorkerMessage = async () => {
    addLog('📨 Testing service worker message...');
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        addLog('❌ No active service worker');
        return;
      }

      // Create a message channel for response
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        addLog(`✅ Service worker responded: ${JSON.stringify(event.data)}`);
      };

      // Send test message
      registration.active.postMessage(
        { 
          type: 'TEST_MESSAGE', 
          data: 'Debug test message',
          timestamp: Date.now()
        },
        [messageChannel.port2]
      );

      addLog('📤 Test message sent to service worker');
      addLog('🔍 Check service worker console for message logs');
    } catch (error) {
      addLog(`❌ Error testing service worker message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAllTests = async () => {
    clearLogs();
    addLog('🚀 Starting comprehensive push notification debug...');
    
    await testServiceWorkerStatus();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testNotificationPermission();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testLocalNotification();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testServiceWorkerMessage();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testPushNotification();
    
    addLog('🏁 Debug test completed!');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Push Notification Debug</h1>
        <p className="text-muted-foreground">
          Comprehensive debugging for push notification issues
        </p>
      </div>

      <div className="grid gap-6">
        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
            <CardDescription>
              Run tests to identify push notification issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button onClick={testServiceWorkerStatus} variant="outline" size="sm">
                Check SW Status
              </Button>
              <Button onClick={testNotificationPermission} variant="outline" size="sm">
                Check Permission
              </Button>
              <Button onClick={testLocalNotification} variant="outline" size="sm">
                Test Local
              </Button>
              <Button onClick={testServiceWorkerMessage} variant="outline" size="sm">
                Test Message
              </Button>
              <Button onClick={testPushNotification} disabled={isLoading} variant="outline" size="sm">
                Test Push
              </Button>
              <Button onClick={clearLogs} variant="outline" size="sm">
                Clear Logs
              </Button>
            </div>
            
            <Button onClick={runAllTests} disabled={isLoading} className="w-full">
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </CardContent>
        </Card>

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
            <CardDescription>
              Real-time debugging information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run a test to see debug information.</div>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>Debug Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Run "Run All Tests" to get comprehensive debug info</li>
              <li>Open DevTools (F12) → Application → Service Workers</li>
              <li>Click the console link next to your service worker</li>
              <li>Look for logs with emojis: 🔔, 📦, 🎯, ✅, ❌</li>
              <li>Check if you see "Push event received" in service worker console</li>
              <li>Check if you see "Notification shown successfully" in service worker console</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
