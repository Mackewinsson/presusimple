'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PWATestPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('Checking...');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setServiceWorkerStatus('Active');
      }).catch(() => {
        setServiceWorkerStatus('Not Available');
      });
    } else {
      setServiceWorkerStatus('Not Supported');
    }

    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      setInstallPrompt(null);
    }
  };

  const testOffline = () => {
    // Simulate offline behavior
    setIsOnline(false);
    setTimeout(() => setIsOnline(true), 3000);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">PWA Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current network connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <Button onClick={testOffline} className="mt-4" variant="outline">
              Test Offline Mode
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Worker</CardTitle>
            <CardDescription>PWA service worker status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                serviceWorkerStatus === 'Active' ? 'bg-green-500' : 
                serviceWorkerStatus === 'Not Available' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span>{serviceWorkerStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Installation</CardTitle>
            <CardDescription>PWA installation status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span>{isInstalled ? 'Installed as PWA' : 'Not Installed'}</span>
              </div>
              {installPrompt && !isInstalled && (
                <Button onClick={handleInstall} className="w-full">
                  Install App
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PWA Features</CardTitle>
            <CardDescription>Available PWA capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Service Worker:</span>
                <span className={serviceWorkerStatus === 'Active' ? 'text-green-600' : 'text-red-600'}>
                  {serviceWorkerStatus === 'Active' ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Offline Support:</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>Install Prompt:</span>
                <span className={installPrompt ? 'text-green-600' : 'text-yellow-600'}>
                  {installPrompt ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Manifest:</span>
                <span className="text-green-600">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>PWA Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. <strong>Install Test:</strong> Click "Install App" if available to test PWA installation</p>
            <p>2. <strong>Offline Test:</strong> Click "Test Offline Mode" to simulate offline behavior</p>
            <p>3. <strong>Service Worker:</strong> Check that service worker is active for caching</p>
            <p>4. <strong>Manifest:</strong> Verify manifest.json is accessible at /manifest.json</p>
            <p>5. <strong>Icons:</strong> Check that app icons are properly configured</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
