'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePWAStatus } from '@/hooks/usePWAStatus';
import { useTranslation } from '@/lib/i18n';

export default function PWAInstallPrompt() {
  const { t } = useTranslation();
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

  // Compact banner for both iOS and Android/Chrome
  const isIOSFlow = isIOS && !deferredPrompt;

  return (
    <div className={`fixed bottom-16 left-3 right-3 z-50 md:left-auto md:right-4 md:max-w-sm transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0">
          {isIOSFlow
            ? <Smartphone className="w-5 h-5 text-success" />
            : <Download className="w-5 h-5 text-success" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{t('installPresusimple')}</p>
          <p className="text-xs text-muted-foreground truncate">{t('getQuickAccess')}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={isIOSFlow ? dismissPrompt : handleInstall}
            className="h-8 px-3 text-xs accent-fill hover:bg-accent/90"
          >
            {isIOSFlow ? t('gotIt') : t('installNow')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissPrompt}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
