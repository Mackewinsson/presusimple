/**
 * PWA Utility Functions
 * Enhanced detection and utilities for Progressive Web App functionality
 */

// Enhanced PWA detection utilities
export const isPWASupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const isStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return isIOSDevice() || isAndroidDevice() || 
         /Mobi|Android/i.test(navigator.userAgent);
};

export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
         /Android.*Tablet|Tablet.*Android/i.test(navigator.userAgent);
};

export const isDesktopDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !isMobileDevice() && !isTabletDevice();
};

// PWA installation status
export const getPWAInstallStatus = () => {
  if (typeof window === 'undefined') {
    return {
      isInstalled: false,
      isInstallable: false,
      isSupported: false,
      deviceType: 'unknown' as const,
      platform: 'unknown' as const
    };
  }

  const isInstalled = isStandaloneMode();
  const isSupported = isPWASupported();
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  const isIOS = isIOSDevice();
  const isAndroid = isAndroidDevice();

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) deviceType = 'mobile';
  else if (isTablet) deviceType = 'tablet';

  let platform: 'ios' | 'android' | 'desktop' | 'unknown' = 'unknown';
  if (isIOS) platform = 'ios';
  else if (isAndroid) platform = 'android';
  else if (isDesktopDevice()) platform = 'desktop';

  return {
    isInstalled,
    isInstallable: isSupported && !isInstalled,
    isSupported,
    deviceType,
    platform
  };
};

// PWA installation benefits
export const getPWAInstallBenefits = (platform: string) => {
  const commonBenefits = [
    'Quick access from home screen',
    'Works offline',
    'Faster loading',
    'Native app-like experience'
  ];

  const platformSpecificBenefits = {
    ios: [
      'Add to home screen',
      'Full-screen experience',
      'iOS integration'
    ],
    android: [
      'Install from browser',
      'Android integration',
      'Push notifications'
    ],
    desktop: [
      'Desktop app experience',
      'System integration',
      'Always accessible'
    ]
  };

  return {
    common: commonBenefits,
    platform: platformSpecificBenefits[platform as keyof typeof platformSpecificBenefits] || []
  };
};

// PWA installation instructions
export const getPWAInstallInstructions = (platform: string) => {
  const instructions = {
    ios: [
      {
        step: 1,
        icon: '📱',
        title: 'Tap Share Button',
        description: 'Tap the share button in Safari\'s bottom toolbar'
      },
      {
        step: 2,
        icon: '➕',
        title: 'Add to Home Screen',
        description: 'Scroll down and tap "Add to Home Screen"'
      },
      {
        step: 3,
        icon: '✅',
        title: 'Confirm Installation',
        description: 'Tap "Add" to install the app'
      }
    ],
    android: [
      {
        step: 1,
        icon: '📱',
        title: 'Install Prompt',
        description: 'Look for the install banner or menu option'
      },
      {
        step: 2,
        icon: '⬇️',
        title: 'Tap Install',
        description: 'Tap "Install" when prompted'
      },
      {
        step: 3,
        icon: '🏠',
        title: 'Access from Home',
        description: 'Find the app icon on your home screen'
      }
    ],
    desktop: [
      {
        step: 1,
        icon: '🌐',
        title: 'Browser Menu',
        description: 'Look for install option in browser menu'
      },
      {
        step: 2,
        icon: '⬇️',
        title: 'Install App',
        description: 'Click "Install" when prompted'
      },
      {
        step: 3,
        icon: '🖥️',
        title: 'Desktop Access',
        description: 'Access from desktop or taskbar'
      }
    ]
  };

  return instructions[platform as keyof typeof instructions] || instructions.desktop;
};

// Check if user should see PWA-first experience
export const shouldShowPWAFirstExperience = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const { isInstalled, deviceType } = getPWAInstallStatus();
  
  // Show PWA-first experience if:
  // 1. Not already installed as PWA
  // 2. On mobile or tablet device
  // 3. PWA is supported
  return !isInstalled && (deviceType === 'mobile' || deviceType === 'tablet') && isPWASupported();
};

// Check if user should see mobile-optimized interface
export const shouldShowMobileInterface = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const { deviceType } = getPWAInstallStatus();
  return deviceType === 'mobile' || deviceType === 'tablet';
};
