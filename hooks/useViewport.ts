'use client';

import { useState, useEffect, useCallback } from 'react';
import { viewportUtils } from '@/lib/viewport';

/**
 * Custom hook for viewport detection and utilities
 * Provides real-time viewport information and responsive utilities
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isStandalone: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
  });

  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < viewportUtils.breakpoints.md;
    const isTablet = width >= viewportUtils.breakpoints.md && width < viewportUtils.breakpoints.lg;
    const isDesktop = width >= viewportUtils.breakpoints.lg;
    const isStandalone = viewportUtils.detection.isStandalone();
    const orientation = height > width ? 'portrait' : 'landscape';

    setViewport({
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      isStandalone,
      orientation,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial viewport setup
    updateViewport();
    viewportUtils.optimization.optimizeViewportForPWA();

    // Listen for viewport changes
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    // Listen for visual viewport changes (mobile keyboard)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
      }
    };
  }, [updateViewport]);

  return {
    ...viewport,
    utils: viewportUtils,
    // Convenience methods
    isMobileOrTablet: viewport.isMobile || viewport.isTablet,
    isLargeScreen: viewport.isDesktop,
    isPortrait: viewport.orientation === 'portrait',
    isLandscape: viewport.orientation === 'landscape',
  };
}

/**
 * Hook for responsive breakpoint detection
 */
export function useBreakpoint() {
  const { width } = useViewport();

  return {
    isSm: width >= viewportUtils.breakpoints.sm,
    isMd: width >= viewportUtils.breakpoints.md,
    isLg: width >= viewportUtils.breakpoints.lg,
    isXl: width >= viewportUtils.breakpoints.xl,
    is2Xl: width >= viewportUtils.breakpoints['2xl'],
    current: (() => {
      if (width >= viewportUtils.breakpoints['2xl']) return '2xl';
      if (width >= viewportUtils.breakpoints.xl) return 'xl';
      if (width >= viewportUtils.breakpoints.lg) return 'lg';
      if (width >= viewportUtils.breakpoints.md) return 'md';
      if (width >= viewportUtils.breakpoints.sm) return 'sm';
      return 'xs';
    })(),
  };
}

/**
 * Hook for PWA-specific viewport features
 */
export function usePWAViewport() {
  const { isStandalone, isMobile } = useViewport();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is installed as PWA
    const checkInstallation = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
      setIsInstalled(standalone);
    };

    checkInstallation();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkInstallation();
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    isStandalone,
    isInstalled,
    isMobile,
    // PWA-specific utilities
    safeAreaClasses: viewportUtils.safeArea,
    pwaClasses: viewportUtils.pwa,
    touchClasses: viewportUtils.touch,
  };
}

/**
 * Hook for dynamic viewport height (handles mobile browser UI)
 */
export function useViewportHeight() {
  const [height, setHeight] = useState(0);
  const [visualHeight, setVisualHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateHeight = () => {
      setHeight(window.innerHeight);
      setVisualHeight(window.visualViewport?.height || window.innerHeight);
    };

    updateHeight();

    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateHeight);
      }
    };
  }, []);

  return {
    height,
    visualHeight,
    isKeyboardOpen: visualHeight < height,
    keyboardHeight: height - visualHeight,
  };
}
