'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePWAStatus } from '@/hooks/usePWAStatus';
import { 
  Download, 
  Smartphone, 
  Check, 
  X, 
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';

export default function PWADebugPage() {
  const pwaInstall = usePWAInstall();
  const pwaStatus = usePWAStatus();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Update debug info
    setDebugInfo({
      userAgent: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      isChrome: /Chrome/.test(navigator.userAgent),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      localStorage: {
        'pwa-install-dismissed': localStorage.getItem('pwa-install-dismissed'),
        'pwa-install-accepted': localStorage.getItem('pwa-install-accepted'),
        'user-interacted': sessionStorage.getItem('user-interacted'),
      },
      currentUrl: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
    });
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-accepted');
    sessionStorage.removeItem('user-interacted');
    window.location.reload();
  };

  const forceShowPrompt = () => {
    pwaInstall.showInstallPrompt();
  };

  const simulateUserInteraction = () => {
    sessionStorage.setItem('user-interacted', 'true');
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PWA Debug Page</h1>
        <p className="text-muted-foreground">
          Debug PWA installation and service worker status
        </p>
      </div>

      <div className="grid gap-6">
        {/* PWA Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              PWA Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>Installable:</span>
                <Badge variant={pwaInstall.isInstallable ? "default" : "secondary"}>
                  {pwaInstall.isInstallable ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Installed:</span>
                <Badge variant={pwaInstall.isInstalled ? "default" : "secondary"}>
                  {pwaInstall.isInstalled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>iOS Device:</span>
                <Badge variant={pwaInstall.isIOS ? "default" : "secondary"}>
                  {pwaInstall.isIOS ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Show Prompt:</span>
                <Badge variant={pwaInstall.showPrompt ? "default" : "secondary"}>
                  {pwaInstall.showPrompt ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>User Interacted:</span>
                <Badge variant={pwaInstall.userInteracted ? "default" : "secondary"}>
                  {pwaInstall.userInteracted ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Deferred Prompt:</span>
                <Badge variant={pwaInstall.deferredPrompt ? "default" : "secondary"}>
                  {pwaInstall.deferredPrompt ? "Available" : "None"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>URL:</strong> {debugInfo.currentUrl}</div>
              <div><strong>Protocol:</strong> {debugInfo.protocol}</div>
              <div><strong>Host:</strong> {debugInfo.host}</div>
              <div><strong>Secure Context:</strong> {debugInfo.isSecureContext ? "Yes" : "No"}</div>
              <div><strong>Standalone Mode:</strong> {debugInfo.isStandalone ? "Yes" : "No"}</div>
              <div><strong>iOS Device:</strong> {debugInfo.isIOS ? "Yes" : "No"}</div>
              <div><strong>Android Device:</strong> {debugInfo.isAndroid ? "Yes" : "No"}</div>
              <div><strong>Chrome Browser:</strong> {debugInfo.isChrome ? "Yes" : "No"}</div>
              <div><strong>Service Worker Support:</strong> {debugInfo.hasServiceWorker ? "Yes" : "No"}</div>
              <div><strong>Push Manager Support:</strong> {debugInfo.hasPushManager ? "Yes" : "No"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Storage Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Install Dismissed:</strong> {debugInfo.localStorage?.['pwa-install-dismissed'] || 'None'}</div>
              <div><strong>Install Accepted:</strong> {debugInfo.localStorage?.['pwa-install-accepted'] || 'None'}</div>
              <div><strong>User Interacted:</strong> {debugInfo.localStorage?.['user-interacted'] || 'None'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Test PWA installation functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={forceShowPrompt} disabled={!pwaInstall.isInstallable && !pwaInstall.isIOS}>
                <Download className="w-4 h-4 mr-2" />
                Force Show Prompt
              </Button>
              
              <Button onClick={simulateUserInteraction} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Simulate User Interaction
              </Button>
              
              <Button onClick={clearStorage} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Storage & Reload
              </Button>
              
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Worker Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Worker Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={async () => {
                  if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.getRegistration();
                    console.log('Service Worker Registration:', registration);
                    alert(`Service Worker: ${registration ? 'Registered' : 'Not Registered'}`);
                  } else {
                    alert('Service Worker not supported');
                  }
                }}
                variant="outline"
                size="sm"
              >
                Check Service Worker
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Agent */}
        <Card>
          <CardHeader>
            <CardTitle>User Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs bg-muted p-2 rounded break-all">
              {debugInfo.userAgent}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
