import { useState, useEffect } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { 
  getPWAInstallStatus, 
  shouldShowPWAFirstExperience, 
  shouldShowMobileInterface,
  getPWAInstallBenefits,
  getPWAInstallInstructions
} from '@/lib/pwa-utils';

export interface PWAStatus {
  // Installation status
  isInstalled: boolean;
  isInstallable: boolean;
  isSupported: boolean;
  
  // Device information
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  
  // UI decisions
  shouldShowPWAFirst: boolean;
  shouldShowMobileUI: boolean;
  
  // Installation data
  installBenefits: {
    common: string[];
    platform: string[];
  };
  installInstructions: Array<{
    step: number;
    icon: string;
    title: string;
    description: string;
  }>;
  
  // PWA install hook integration
  pwaInstall: {
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    showPrompt: boolean;
    userInteracted: boolean;
    deferredPrompt: any;
    handleInstall: () => Promise<void>;
    dismissPrompt: () => void;
    showInstallPrompt: () => void;
  };
}

export const usePWAStatus = (): PWAStatus => {
  const [status, setStatus] = useState(() => getPWAInstallStatus());
  const pwaInstall = usePWAInstall();

  // Update status when PWA install state changes
  useEffect(() => {
    const newStatus = getPWAInstallStatus();
    setStatus(newStatus);
  }, [pwaInstall.isInstalled, pwaInstall.isInstallable]);

  // Get installation benefits and instructions
  const installBenefits = getPWAInstallBenefits(status.platform);
  const installInstructions = getPWAInstallInstructions(status.platform);

  return {
    // Installation status
    isInstalled: status.isInstalled,
    isInstallable: status.isInstallable,
    isSupported: status.isSupported,
    
    // Device information
    deviceType: status.deviceType,
    platform: status.platform,
    
    // UI decisions
    shouldShowPWAFirst: shouldShowPWAFirstExperience(),
    shouldShowMobileUI: shouldShowMobileInterface(),
    
    // Installation data
    installBenefits,
    installInstructions,
    
    // PWA install hook integration
    pwaInstall
  };
};
