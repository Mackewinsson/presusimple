'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Smartphone, ArrowUp, Plus } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const {
    isInstallable,
    isInstalled,
    isIOS,
    showPrompt,
    userInteracted,
    deferredPrompt,
    handleInstall,
    dismissPrompt,
  } = usePWAInstall();

  // Handle visibility animation
  useEffect(() => {
    if (showPrompt) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [showPrompt]);

  if (!showPrompt || isInstalled) {
    return null;
  }

  // iOS-specific install instructions with enhanced design
  if (isIOS && !deferredPrompt) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Install Simple Budget</h3>
                <p className="text-sm text-muted-foreground">Get quick access and offline functionality</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPrompt}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Tap the</span>
                <Share className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Share button</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Scroll down and tap</span>
                <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 rounded text-xs font-medium">
                  <Plus className="w-3 h-3" />
                  <span>"Add to Home Screen"</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Tap</span>
                <div className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                  "Add"
                </div>
                <span className="text-sm font-medium">to install</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={dismissPrompt}
              className="flex-1"
            >
              Maybe later
            </Button>
            <Button 
              size="sm" 
              onClick={dismissPrompt}
              className="flex-1"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Android/Chrome install prompt
  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Install Simple Budget</h3>
              <p className="text-sm text-muted-foreground">Get quick access and offline functionality</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissPrompt}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <ArrowUp className="w-4 h-4" />
            <span>Install this app on your device for a better experience</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={dismissPrompt}
            className="flex-1"
          >
            Not now
          </Button>
          <Button 
            onClick={handleInstall} 
            size="sm" 
            className="flex-1"
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
