import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserId } from '@/lib/hooks/useUserId';
import { isStandaloneMode } from '@/lib/pwa-utils';

interface VersionData {
  budgetVersion: string;
  categoriesVersion: string;
  expensesVersion: string;
  timestamp: number;
}

interface SilentSyncOptions {
  /**
   * Enable silent sync (default: true)
   */
  enabled?: boolean;
  
  /**
   * Delay before first check in ms (default: 2000)
   */
  initialDelay?: number;
  
  /**
   * Interval between checks in ms (default: 30000 - 30 seconds)
   */
  checkInterval?: number;
  
  /**
   * Callback when updates are detected
   */
  onUpdatesAvailable?: () => void;
}

const STORAGE_KEY = 'pwa-data-versions';

/**
 * Silent sync hook for PWA
 * Checks for data changes in the background without blocking the UI
 * Only triggers refetch if data has actually changed
 */
export const useSilentSync = (options: SilentSyncOptions = {}) => {
  const {
    enabled = true,
    initialDelay = 2000,
    checkInterval = 30000,
    onUpdatesAvailable,
  } = options;

  const queryClient = useQueryClient();
  const { data: userId } = useUserId();
  const lastVersionRef = useRef<VersionData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPWA = isStandaloneMode();

  // Load last known versions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
      if (stored) {
        lastVersionRef.current = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[Silent Sync] Failed to load cached versions:', error);
    }
  }, [userId]);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      const response = await fetch(`/api/sync/version?userId=${userId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('[Silent Sync] Failed to fetch versions:', response.status);
        return;
      }

      const newVersions: VersionData = await response.json();
      const lastVersions = lastVersionRef.current;

      // Store new versions
      lastVersionRef.current = newVersions;
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(newVersions));

      // If this is the first check, just store the versions
      if (!lastVersions) {
        console.log('[Silent Sync] Initial version sync completed');
        return;
      }

      // Check if any data has changed
      const budgetChanged = lastVersions.budgetVersion !== newVersions.budgetVersion;
      const categoriesChanged = lastVersions.categoriesVersion !== newVersions.categoriesVersion;
      const expensesChanged = lastVersions.expensesVersion !== newVersions.expensesVersion;

      if (budgetChanged || categoriesChanged || expensesChanged) {
        console.log('[Silent Sync] Data changes detected:', {
          budget: budgetChanged,
          categories: categoriesChanged,
          expenses: expensesChanged,
        });

        // Invalidate affected queries to trigger background refetch
        if (budgetChanged) {
          await queryClient.invalidateQueries({ queryKey: ['budgets'] });
        }
        if (categoriesChanged) {
          await queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
        if (expensesChanged) {
          await queryClient.invalidateQueries({ queryKey: ['expenses'] });
        }

        // Notify callback if provided
        if (onUpdatesAvailable) {
          onUpdatesAvailable();
        }
      } else {
        console.log('[Silent Sync] No changes detected');
      }
    } catch (error) {
      console.error('[Silent Sync] Check failed:', error);
    }
  }, [userId, enabled, queryClient, onUpdatesAvailable]);

  // Set up periodic checking
  useEffect(() => {
    // Only enable silent sync for PWA mode or explicitly enabled
    if (!enabled || !userId || (!isPWA && !enabled)) {
      return;
    }

    // Initial check after delay
    const initialTimer = setTimeout(() => {
      console.log('[Silent Sync] Starting background sync');
      checkForUpdates();
    }, initialDelay);

    // Periodic checks
    intervalRef.current = setInterval(() => {
      checkForUpdates();
    }, checkInterval);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, enabled, isPWA, initialDelay, checkInterval, checkForUpdates]);

  // Check on focus (when user returns to app)
  useEffect(() => {
    if (!enabled || !userId) return;

    const handleFocus = () => {
      console.log('[Silent Sync] App focused, checking for updates');
      checkForUpdates();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, userId, checkForUpdates]);

  return {
    checkForUpdates,
    isEnabled: enabled && !!userId,
    isPWAMode: isPWA,
  };
};
