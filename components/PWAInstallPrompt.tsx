'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Smartphone, ArrowUp, Plus, Check } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePWAStatus } from '@/hooks/usePWAStatus';

export default function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const pwaStatus = usePWAStatus();
  const {
    isInstallable,
    isInstalled,
    isIOS,
    showPrompt,
    userInteracted,
    deferredPrompt,
    handleInstall,
    dismissPrompt,
  } = pwaStatus.pwaInstall;

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
            {pwaStatus.installInstructions.map((instruction) => (
              <div key={instruction.step} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {instruction.step}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{instruction.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{instruction.title}</div>
                    <div className="text-xs text-muted-foreground">{instruction.description}</div>
                  </div>
                </div>
              </div>
            ))}
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
        
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
              <ArrowUp className="w-4 h-4" />
              <span>Install this app on your device for a better experience</span>
            </div>
            <div className="space-y-2">
              {pwaStatus.installBenefits.common.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-2 w-2 text-white" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
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
