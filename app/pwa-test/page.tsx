'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useViewport, useBreakpoint, usePWAViewport, useViewportHeight } from '@/hooks/useViewport';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import NotificationManager from '@/components/NotificationManager';

export default function PWATestPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('Checking...');
  const [userAgent, setUserAgent] = useState('');

  // Viewport hooks
  const viewport = useViewport();
  const breakpoint = useBreakpoint();
  const pwaViewport = usePWAViewport();
  const viewportHeight = useViewportHeight();

  // PWA Install hook
  const {
    isInstallable,
    isInstalled,
    isIOS,
    showPrompt,
    userInteracted,
    deferredPrompt,
    handleInstall,
    dismissPrompt,
    showInstallPrompt,
  } = usePWAInstall();

  // Notifications will be handled by NotificationManager component

  // Debug service worker registration
  const checkServiceWorker = async () => {
    console.log('🔍 Checking service worker registration...');
    
    if ('serviceWorker' in navigator) {
      try {
        let registration = await navigator.serviceWorker.getRegistration();
        console.log('📱 Service worker registration:', registration);
        
        if (registration) {
          console.log('✅ Service worker found');
          console.log('🔍 Scope:', registration.scope);
          console.log('🔍 Active:', registration.active?.state);
          console.log('🔍 Installing:', registration.installing?.state);
          console.log('🔍 Waiting:', registration.waiting?.state);
          setServiceWorkerStatus('Active');
        } else {
          console.log('❌ No service worker registration found, registering...');
          registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('✅ Service worker registered:', registration);
          setServiceWorkerStatus('Registered');
        }
      } catch (error) {
        console.error('❌ Error checking service worker:', error);
        setServiceWorkerStatus('Error');
      }
    } else {
      console.log('❌ Service Worker not supported');
      setServiceWorkerStatus('Not Supported');
    }
  };

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Check and register service worker
    const checkAndRegisterServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          console.log('🔍 Checking service worker registration...');
          let registration = await navigator.serviceWorker.getRegistration();
          
          if (registration) {
            console.log('✅ Service worker found:', registration);
            setServiceWorkerStatus('Active');
          } else {
            console.log('❌ No service worker registration found, registering...');
            registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/'
            });
            console.log('✅ Service worker registered:', registration);
            setServiceWorkerStatus('Registered');
            
            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('✅ Service worker is ready');
            setServiceWorkerStatus('Active');
          }
        } catch (error) {
          console.error('❌ Error with service worker:', error);
          setServiceWorkerStatus('Error');
        }
      } else {
        setServiceWorkerStatus('Not Supported');
      }
    };

    checkAndRegisterServiceWorker();
    setUserAgent(navigator.userAgent);
  }, []);

  const testInstall = async () => {
    await handleInstall();
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
              {isInstallable && !isInstalled && (
                <Button onClick={testInstall} className="w-full">
                  Install App
                </Button>
              )}
              {!isInstallable && !isInstalled && (
                <Button onClick={showInstallPrompt} className="w-full" variant="outline">
                  Show Install Prompt
                </Button>
              )}
              {isIOS && !isInstalled && (
                <div className="text-sm text-muted-foreground">
                  <p>iOS detected - Use Share button to install</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Platform and browser details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Platform:</span>
                <span className={isIOS ? 'text-blue-600' : 'text-green-600'}>
                  {isIOS ? 'iOS' : 'Other'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Standalone Mode:</span>
                <span className={isInstalled ? 'text-green-600' : 'text-yellow-600'}>
                  {isInstalled ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Install Prompt:</span>
                <span className={isInstallable ? 'text-green-600' : 'text-yellow-600'}>
                  {isInstallable ? 'Available' : 'Not Available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User Interacted:</span>
                <span className={userInteracted ? 'text-green-600' : 'text-yellow-600'}>
                  {userInteracted ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Show Prompt:</span>
                <span className={showPrompt ? 'text-green-600' : 'text-gray-600'}>
                  {showPrompt ? 'Yes' : 'No'}
                </span>
              </div>
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
                <span className={isInstallable ? 'text-green-600' : 'text-yellow-600'}>
                  {isInstallable ? '✓' : '○'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Manifest:</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>Notifications:</span>
                <span className={(typeof window !== 'undefined' && 'Notification' in window && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) ? 'text-green-600' : 'text-red-600'}>
                  {(typeof window !== 'undefined' && 'Notification' in window && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <NotificationManager />

        <Card>
          <CardHeader>
            <CardTitle>User Agent</CardTitle>
            <CardDescription>Browser identification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground break-all">
              {userAgent}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Viewport Information</CardTitle>
            <CardDescription>Real-time viewport data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="text-blue-600">
                  {viewport.width} × {viewport.height}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Visual Height:</span>
                <span className="text-blue-600">
                  {viewportHeight.visualHeight}px
                </span>
              </div>
              <div className="flex justify-between">
                <span>Orientation:</span>
                <span className={viewport.isPortrait ? 'text-green-600' : 'text-orange-600'}>
                  {viewport.orientation}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Breakpoint:</span>
                <span className="text-purple-600">
                  {breakpoint.current}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Keyboard Open:</span>
                <span className={viewportHeight.isKeyboardOpen ? 'text-red-600' : 'text-green-600'}>
                  {viewportHeight.isKeyboardOpen ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Classification</CardTitle>
            <CardDescription>Responsive device detection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Mobile:</span>
                <span className={viewport.isMobile ? 'text-green-600' : 'text-gray-600'}>
                  {viewport.isMobile ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tablet:</span>
                <span className={viewport.isTablet ? 'text-green-600' : 'text-gray-600'}>
                  {viewport.isTablet ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Desktop:</span>
                <span className={viewport.isDesktop ? 'text-green-600' : 'text-gray-600'}>
                  {viewport.isDesktop ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mobile/Tablet:</span>
                <span className={viewport.isMobileOrTablet ? 'text-green-600' : 'text-gray-600'}>
                  {viewport.isMobileOrTablet ? '✓' : '✗'}
                </span>
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
            <p>2. <strong>iOS Installation:</strong> On iOS, use the Share button → "Add to Home Screen"</p>
            <p>3. <strong>Enhanced Prompt:</strong> The app now shows a custom install prompt for iOS users</p>
            <p>4. <strong>Offline Test:</strong> Click "Test Offline Mode" to simulate offline behavior</p>
            <p>5. <strong>Service Worker:</strong> Check that service worker is active for caching</p>
            <p>6. <strong>Manifest:</strong> Verify manifest.json is accessible at /manifest.json</p>
            <p>7. <strong>Icons:</strong> Check that app icons are properly configured</p>
            <p>8. <strong>User Interaction:</strong> The install prompt waits for user interaction before showing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
