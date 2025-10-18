"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FeatureFlagExample from '@/components/FeatureFlagExample';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flag, Code, Smartphone, Monitor } from 'lucide-react';

export default function FeatureFlagsTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Flag className="h-8 w-8" />
              Feature Flags Test Page
            </h1>
            <p className="text-muted-foreground mt-2">
              Test and demonstrate the feature flag system
            </p>
          </div>

          <Alert>
            <Flag className="h-4 w-4" />
            <AlertDescription>
              This page demonstrates how to use the feature flag system in your components.
              Use the admin panel at <code>/admin/feature-flags</code> to manage feature flags.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            {/* Web Platform Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Web Platform Example
                </CardTitle>
                <CardDescription>
                  Feature flags for web application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagExample />
              </CardContent>
            </Card>

            {/* Mobile Platform Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile Platform Example
                </CardTitle>
                <CardDescription>
                  Feature flags for mobile application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    In a mobile app, you would use the same hooks with platform: 'mobile':
                  </p>
                  <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`const { features, userType } = useFeatureFlags({
  platform: 'mobile'
});

const isFeatureEnabled = useFeature('feature_key', {
  platform: 'mobile'
});`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* API Usage Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Usage Examples
                </CardTitle>
                <CardDescription>
                  How to use the feature flag API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Get User Features</h4>
                  <pre className="text-xs bg-muted p-2 rounded border overflow-x-auto">
{`// GET /api/features?platform=web
// Returns: { features: {...}, userType: "pro", platform: "web", userId: "..." }

fetch('/api/features?platform=web')
  .then(res => res.json())
  .then(data => {
    console.log('Available features:', data.features);
    console.log('User type:', data.userType);
  });`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Admin: Create Feature Flag</h4>
                  <pre className="text-xs bg-muted p-2 rounded border overflow-x-auto">
{`// POST /api/admin/features
fetch('/api/admin/features', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'new_dashboard',
    name: 'New Dashboard',
    description: 'Enhanced dashboard with new features',
    enabled: true,
    platforms: ['web', 'mobile'],
    userTypes: ['pro'],
    rolloutPercentage: 50
  })
});`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Admin: Update Feature Flag</h4>
                  <pre className="text-xs bg-muted p-2 rounded border overflow-x-auto">
{`// PUT /api/admin/features/new_dashboard
fetch('/api/admin/features/new_dashboard', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    enabled: false,
    rolloutPercentage: 0
  })
});`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
