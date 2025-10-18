import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface FeatureFlagsResponse {
  features: FeatureFlags;
  userType: 'free' | 'pro' | 'admin';
  platform: 'web' | 'mobile';
  userId: string;
}

export interface UseFeatureFlagsOptions {
  platform?: 'web' | 'mobile';
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export interface UseFeatureFlagsReturn {
  features: FeatureFlags;
  userType: 'free' | 'pro' | 'admin' | null;
  platform: 'web' | 'mobile';
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isFeatureEnabled: (featureKey: string) => boolean;
}

export function useFeatureFlags(options: UseFeatureFlagsOptions = {}): UseFeatureFlagsReturn {
  const { platform = 'web', refreshInterval, enabled = true } = options;
  const { data: session, status } = useSession();
  
  const [features, setFeatures] = useState<FeatureFlags>({});
  const [userType, setUserType] = useState<'free' | 'pro' | 'admin' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    if (!enabled || status === 'loading' || !session) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL('/api/features', window.location.origin);
      url.searchParams.set('platform', platform);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch features: ${response.statusText}`);
      }

      const data: FeatureFlagsResponse = await response.json();
      
      setFeatures(data.features);
      setUserType(data.userType);
      setUserId(data.userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch features';
      setError(errorMessage);
      console.error('Error fetching feature flags:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, status, session, platform]);

  // Initial fetch
  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Set up refresh interval
  useEffect(() => {
    if (!refreshInterval || !enabled) {
      return;
    }

    const interval = setInterval(fetchFeatures, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchFeatures, refreshInterval, enabled]);

  const isFeatureEnabled = useCallback((featureKey: string): boolean => {
    return features[featureKey] === true;
  }, [features]);

  return {
    features,
    userType,
    platform,
    userId,
    isLoading,
    error,
    refresh: fetchFeatures,
    isFeatureEnabled,
  };
}

// Hook for checking a specific feature
export function useFeature(featureKey: string, options: UseFeatureFlagsOptions = {}): boolean {
  const { isFeatureEnabled } = useFeatureFlags(options);
  return isFeatureEnabled(featureKey);
}

// Hook for checking multiple features at once
export function useFeatures(featureKeys: string[], options: UseFeatureFlagsOptions = {}): Record<string, boolean> {
  const { isFeatureEnabled } = useFeatureFlags(options);
  
  return featureKeys.reduce((acc, key) => {
    acc[key] = isFeatureEnabled(key);
    return acc;
  }, {} as Record<string, boolean>);
}
