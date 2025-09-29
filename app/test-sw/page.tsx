'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function TestSWPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const registerTestSW = async () => {
    addLog('🔧 Registering test service worker...');
    
    if (!('serviceWorker' in navigator)) {
      addLog('❌ Service Worker not supported');
      return;
    }

    try {
      // Unregister existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        addLog(`🗑️ Unregistering existing SW: ${registration.scope}`);
        await registration.unregister();
      }

      // Register the test service worker
      const registration = await navigator.serviceWorker.register('/test-sw.js', {
        scope: '/'
      });

      addLog(`✅ Test service worker registered: ${registration.scope}`);
      setSwRegistered(true);

      // Wait for the service worker to be ready
      if (registration.installing) {
        addLog('⏳ Service worker installing...');
        registration.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker;
          addLog(`📱 SW state: ${sw.state}`);
          if (sw.state === 'activated') {
            addLog('✅ Service worker activated and ready');
          }
        });
      } else if (registration.waiting) {
        addLog('⏳ Service worker waiting...');
      } else if (registration.active) {
        addLog('✅ Service worker already active');
      }

    } catch (error) {
      addLog(`❌ Error registering service worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          message: 'Test notification from test service worker'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        addLog(`✅ Push notification sent successfully: ${result.message}`);
        addLog('🔍 Check service worker console for push event logs');
        addLog('🔍 Look for "PUSH EVENT RECEIVED IN TEST SW" in service worker console');
      } else {
        addLog(`❌ Push notification failed: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Error sending push notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSWStatus = async () => {
    addLog('🔍 Checking service worker status...');
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        addLog(`✅ Service worker registered: ${registration.scope}`);
        addLog(`📱 Active worker: ${registration.active?.state || 'none'}`);
        addLog(`📱 Installing worker: ${registration.installing?.state || 'none'}`);
        addLog(`📱 Waiting worker: ${registration.waiting?.state || 'none'}`);
        
        if (registration.active) {
          addLog(`📄 SW script URL: ${registration.active.scriptURL}`);
        }
      } else {
        addLog('❌ No service worker registration found');
      }
    } catch (error) {
      addLog(`❌ Error checking service worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const restoreOriginalSW = async () => {
    addLog('🔄 Restoring original service worker...');
    
    try {
      // Unregister test service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        addLog(`🗑️ Unregistering SW: ${registration.scope}`);
        await registration.unregister();
      }

      // Reload the page to register the original service worker
      addLog('🔄 Reloading page to restore original service worker...');
      window.location.reload();
    } catch (error) {
      addLog(`❌ Error restoring service worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Service Worker</h1>
        <p className="text-muted-foreground">
          Test push notifications with a simple service worker
        </p>
      </div>

      <div className="grid gap-6">
        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Service Worker Test Actions</CardTitle>
            <CardDescription>
              Test push notifications with a dedicated service worker
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button onClick={registerTestSW} variant="outline" size="sm">
                Register Test SW
              </Button>
              <Button onClick={checkSWStatus} variant="outline" size="sm">
                Check SW Status
              </Button>
              <Button 
                onClick={testPushNotification} 
                disabled={isLoading || !swRegistered} 
                variant="outline" 
                size="sm"
              >
                Test Push
              </Button>
              <Button onClick={restoreOriginalSW} variant="outline" size="sm">
                Restore Original
              </Button>
            </div>
            
            <Button onClick={clearLogs} variant="outline" className="w-full">
              Clear Logs
            </Button>
          </CardContent>
        </Card>

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Test Logs</CardTitle>
            <CardDescription>
              Service worker test debugging information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run a test to see debug information.</div>
              ) : (
                logs.map((log, index) => (
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
            <strong>Test Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Register Test SW" to register a simple service worker</li>
              <li>Click "Test Push" to send a push notification</li>
              <li>Open DevTools (F12) → Application → Service Workers</li>
              <li>Click the console link next to the test service worker</li>
              <li>Look for "PUSH EVENT RECEIVED IN TEST SW" in the service worker console</li>
              <li>If you see the push event, the issue is with the original service worker integration</li>
              <li>Click "Restore Original" to go back to the original service worker</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
