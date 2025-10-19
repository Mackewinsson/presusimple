/**
 * Viewport utilities for consistent mobile-first responsive design
 * across the Presusimple PWA application
 */

// Viewport breakpoints matching Tailwind CSS
export const VIEWPORT_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Safe area inset utilities for notched devices
export const SAFE_AREA_CLASSES = {
  inset: 'safe-area-inset',
  top: 'pt-[env(safe-area-inset-top)]',
  bottom: 'pb-[env(safe-area-inset-bottom)]',
  left: 'pl-[env(safe-area-inset-left)]',
  right: 'pr-[env(safe-area-inset-right)]',
  horizontal: 'px-[env(safe-area-inset-left)] px-[env(safe-area-inset-right)]',
  vertical: 'py-[env(safe-area-inset-top)] py-[env(safe-area-inset-bottom)]',
} as const;

// Mobile-first responsive container classes
export const CONTAINER_CLASSES = {
  base: 'w-full max-w-full mx-auto px-4',
  sm: 'sm:max-w-sm sm:px-6',
  md: 'md:max-w-md',
  lg: 'lg:max-w-lg',
  xl: 'xl:max-w-xl',
  '2xl': '2xl:max-w-2xl',
  full: 'max-w-full',
} as const;

// Touch-friendly interactive element classes
export const TOUCH_CLASSES = {
  button: 'min-h-[44px] min-w-[44px] touch-manipulation',
  input: 'min-h-[44px] text-base',
  link: 'min-h-[44px] min-w-[44px] flex items-center justify-center',
} as const;

// PWA-specific viewport classes
export const PWA_CLASSES = {
  standalone: 'standalone:select-none standalone:touch-callout-none',
  content: 'standalone:select-text',
  fullscreen: 'h-screen w-screen overflow-hidden',
  safeArea: 'safe-area-inset',
} as const;

// Viewport detection utilities
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < VIEWPORT_BREAKPOINTS.md;
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= VIEWPORT_BREAKPOINTS.md && window.innerWidth < VIEWPORT_BREAKPOINTS.lg;
};

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= VIEWPORT_BREAKPOINTS.lg;
};

export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Viewport height utilities for mobile browsers
export const getViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
};

export const getVisualViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  return window.visualViewport?.height || window.innerHeight;
};

// Dynamic viewport height CSS custom property
export const setViewportHeight = (): void => {
  if (typeof window === 'undefined') return;
  
  const setHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setHeight();
  window.addEventListener('resize', setHeight);
  window.addEventListener('orientationchange', setHeight);
};

// Preload critical viewport resources
export const preloadViewportResources = (): void => {
  if (typeof window === 'undefined') return;
  
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/globals.css';
  document.head.appendChild(criticalCSS);
  
  // Preload viewport meta tag
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover';
  document.head.appendChild(viewportMeta);
};

// Viewport optimization for PWA
export const optimizeViewportForPWA = (): void => {
  if (typeof window === 'undefined') return;
  
  // Set viewport height
  setViewportHeight();
  
  // Prevent zoom on input focus
  const preventZoom = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      target.style.fontSize = '16px';
    }
  };
  
  document.addEventListener('focusin', preventZoom);
  
  // Handle orientation changes
  const handleOrientationChange = () => {
    setTimeout(() => {
      setViewportHeight();
    }, 100);
  };
  
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // Handle visual viewport changes (mobile keyboard)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setViewportHeight);
  }
};

// Export all utilities as a single object
export const viewportUtils = {
  breakpoints: VIEWPORT_BREAKPOINTS,
  safeArea: SAFE_AREA_CLASSES,
  container: CONTAINER_CLASSES,
  touch: TOUCH_CLASSES,
  pwa: PWA_CLASSES,
  detection: {
    isMobile,
    isTablet,
    isDesktop,
    isStandalone,
  },
  dimensions: {
    getViewportHeight,
    getVisualViewportHeight,
    setViewportHeight,
  },
  optimization: {
    preloadViewportResources,
    optimizeViewportForPWA,
  },
} as const;
