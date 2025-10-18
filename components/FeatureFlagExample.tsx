"use client";

import React from 'react';
import { useFeatureFlags, useFeature } from '@/hooks/useFeatureFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, RefreshCw } from 'lucide-react';

/**
 * Example component demonstrating how to use the feature flag system
 * This shows different ways to check and use feature flags in your components
 */
export default function FeatureFlagExample() {
  // Method 1: Get all feature flags and user info
  const { features, userType, platform, isLoading, error, refresh } = useFeatureFlags({
    platform: 'web', // or 'mobile'
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Method 2: Check a specific feature
  const isNewDashboardEnabled = useFeature('new_dashboard', { platform: 'web' });
  const isAdvancedAnalyticsEnabled = useFeature('advanced_analytics', { platform: 'web' });

  // Method 3: Check multiple features at once
  const { features: allFeatures } = useFeatureFlags({
    platform: 'web',
  });
  const newDashboard = allFeatures.new_dashboard;
  const advancedAnalytics = allFeatures.advanced_analytics;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading feature flags...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            Error loading feature flags: {error}
          </div>
          <Button onClick={refresh} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Feature Flag Status
          </CardTitle>
          <CardDescription>
            Current user and platform information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Type:</strong> 
              <Badge variant="outline" className="ml-2 capitalize">{userType}</Badge>
            </div>
            <div>
              <strong>Platform:</strong> 
              <Badge variant="outline" className="ml-2">{platform}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flag Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flag Examples</CardTitle>
          <CardDescription>
            Different ways to use feature flags in your components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Example 1: Conditional rendering */}
          <div>
            <h4 className="font-semibold mb-2">1. Conditional Rendering</h4>
            {isNewDashboardEnabled ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">✅ New Dashboard is enabled for you!</p>
                <Button className="mt-2">Go to New Dashboard</Button>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600">❌ New Dashboard is not available</p>
              </div>
            )}
          </div>

          {/* Example 2: Feature-specific content */}
          <div>
            <h4 className="font-semibold mb-2">2. Feature-Specific Content</h4>
            {isAdvancedAnalyticsEnabled ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">📊 Advanced Analytics Available</p>
                <p className="text-sm text-blue-600 mt-1">
                  You have access to detailed spending insights and advanced charts.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600">📊 Basic Analytics Only</p>
                <p className="text-sm text-gray-500 mt-1">
                  Upgrade to Pro for advanced analytics features.
                </p>
              </div>
            )}
          </div>

          {/* Example 3: All available features */}
          <div>
            <h4 className="font-semibold mb-2">3. All Available Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(features).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-mono">{key}</span>
                  <Badge variant={enabled ? "default" : "secondary"}>
                    {enabled ? "ON" : "OFF"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh button */}
          <div className="pt-4 border-t">
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Feature Flags
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example of how to use feature flags in a mobile app context
 */
export function MobileFeatureFlagExample() {
  const { features, userType, platform } = useFeatureFlags({
    platform: 'mobile', // Specify mobile platform
  });

  return (
    <div className="space-y-2">
      <p className="text-sm">Mobile Platform: {platform}</p>
      <p className="text-sm">User Type: {userType}</p>
      <div className="text-xs">
        Available features: {Object.keys(features).filter(key => features[key]).join(', ')}
      </div>
    </div>
  );
}

/**
 * Example of how to use feature flags for A/B testing
 */
export function ABTestExample() {
  const isVariantA = useFeature('dashboard_variant_a', { platform: 'web' });
  const isVariantB = useFeature('dashboard_variant_b', { platform: 'web' });

  if (isVariantA) {
    return <div>Variant A: New layout with sidebar</div>;
  } else if (isVariantB) {
    return <div>Variant B: New layout with top navigation</div>;
  } else {
    return <div>Control: Original layout</div>;
  }
}
