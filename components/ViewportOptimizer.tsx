'use client';

import { useEffect } from 'react';
import { viewportUtils } from '@/lib/viewport';

/**
 * ViewportOptimizer component
 * Handles viewport optimization for PWA and mobile devices
 * Runs once on app initialization
 */
export default function ViewportOptimizer() {
  useEffect(() => {
    // Initialize viewport optimizations
    viewportUtils.optimization.optimizeViewportForPWA();
    
    // Preload critical viewport resources
    viewportUtils.optimization.preloadViewportResources();
    
    // Set initial viewport height
    viewportUtils.dimensions.setViewportHeight();
    
    // Handle iOS Safari specific optimizations
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Prevent zoom on input focus
      const preventZoom = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          target.style.fontSize = '16px';
        }
      };
      
      document.addEventListener('focusin', preventZoom);
      
      // Handle iOS viewport changes
      const handleIOSViewportChange = () => {
        setTimeout(() => {
          viewportUtils.dimensions.setViewportHeight();
        }, 100);
      };
      
      window.addEventListener('orientationchange', handleIOSViewportChange);
      window.addEventListener('resize', handleIOSViewportChange);
      
      return () => {
        document.removeEventListener('focusin', preventZoom);
        window.removeEventListener('orientationchange', handleIOSViewportChange);
        window.removeEventListener('resize', handleIOSViewportChange);
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}
