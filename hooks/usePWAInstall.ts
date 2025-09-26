import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  showPrompt: boolean;
  userInteracted: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

interface PWAInstallActions {
  showInstallPrompt: () => void;
  hideInstallPrompt: () => void;
  handleInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

// Enhanced iOS detection
const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Enhanced standalone detection
const isStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

// Check if user has interacted with the app
const hasUserInteracted = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('user-interacted') === 'true';
};

// Mark user as having interacted
const markUserInteracted = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('user-interacted', 'true');
};

// Check if prompt was recently dismissed
const wasPromptDismissed = (): boolean => {
  if (typeof window === 'undefined') return false;
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (!dismissed) return false;
  
  const dismissedTime = parseInt(dismissed);
  const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
  return daysSinceDismissed < 14; // Don't show for 14 days
};

// Check if app was recently installed
const wasAppInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const installed = localStorage.getItem('pwa-install-accepted');
  if (!installed) return false;
  
  const installedTime = parseInt(installed);
  const daysSinceInstalled = (Date.now() - installedTime) / (1000 * 60 * 60 * 24);
  return daysSinceInstalled < 1; // Consider installed for 1 day
};

export const usePWAInstall = (): PWAInstallState & PWAInstallActions => {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    showPrompt: false,
    userInteracted: false,
    deferredPrompt: null,
  });

  // Initialize state
  useEffect(() => {
    const isIOS = isIOSDevice();
    const isInstalled = isStandaloneMode() || wasAppInstalled();
    const userInteracted = hasUserInteracted();

    setState(prev => ({
      ...prev,
      isIOS,
      isInstalled,
      userInteracted,
    }));

    // Track user interaction
    const handleUserInteraction = () => {
      markUserInteracted();
      setState(prev => ({ ...prev, userInteracted: true }));
    };

    // Add event listeners for user interaction
    const events = ['click', 'scroll', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Handle install prompt events
  useEffect(() => {
    if (state.isInstalled) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e as BeforeInstallPromptEvent,
      }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        showPrompt: false,
        isInstallable: false,
        deferredPrompt: null,
      }));
      localStorage.setItem('pwa-install-accepted', Date.now().toString());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [state.isInstalled]);

  // Auto-show prompt logic
  useEffect(() => {
    if (state.isInstalled || wasPromptDismissed() || !state.userInteracted) {
      return;
    }

    const shouldShow = state.isInstallable || state.isIOS;
    if (!shouldShow) return;

    // Delay showing prompt to avoid being too aggressive
    const delay = state.isIOS ? 2000 : 1000;
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, showPrompt: true }));
    }, delay);

    return () => clearTimeout(timer);
  }, [state.isInstalled, state.isInstallable, state.isIOS, state.userInteracted]);

  const showInstallPrompt = useCallback(() => {
    setState(prev => ({ ...prev, showPrompt: true }));
  }, []);

  const hideInstallPrompt = useCallback(() => {
    setState(prev => ({ ...prev, showPrompt: false }));
  }, []);

  const handleInstall = useCallback(async () => {
    if (!state.deferredPrompt) return;

    try {
      await state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        localStorage.setItem('pwa-install-accepted', Date.now().toString());
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }

    setState(prev => ({
      ...prev,
      deferredPrompt: null,
      showPrompt: false,
    }));
  }, [state.deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setState(prev => ({ ...prev, showPrompt: false }));
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  return {
    ...state,
    showInstallPrompt,
    hideInstallPrompt,
    handleInstall,
    dismissPrompt,
  };
};
