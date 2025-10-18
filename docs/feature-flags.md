# Feature Flag System

A comprehensive feature flag system that works for both web and mobile applications, allowing you to control features dynamically without code deployments.

## Overview

The feature flag system provides:
- **Dynamic Control**: Enable/disable features in real-time
- **Platform Support**: Works for both web and mobile applications
- **User Targeting**: Target specific users or user types
- **Gradual Rollouts**: Control rollout percentage for A/B testing
- **Admin Interface**: Easy management through the admin dashboard

## Architecture

### Database Model
- **Feature Model** (`models/Feature.ts`): MongoDB schema for feature flags
- **Key Fields**: `key`, `name`, `description`, `enabled`, `platforms`, `userTypes`, `rolloutPercentage`

### API Endpoints
- **GET `/api/features`**: Get feature flags for current user
- **GET `/api/admin/features`**: Get all feature flags (admin only)
- **POST `/api/admin/features`**: Create new feature flag (admin only)
- **PUT `/api/admin/features/[key]`**: Update feature flag (admin only)
- **DELETE `/api/admin/features/[key]`**: Delete feature flag (admin only)

### React Hooks
- **`useFeatureFlags()`**: Get all feature flags and user info
- **`useFeature(key)`**: Check a specific feature
- **`useFeatures(keys)`**: Check multiple features

## Usage

### 1. Basic Feature Check

```tsx
import { useFeature } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const isNewDashboardEnabled = useFeature('new_dashboard', { platform: 'web' });
  
  return (
    <div>
      {isNewDashboardEnabled ? (
        <NewDashboard />
      ) : (
        <OldDashboard />
      )}
    </div>
  );
}
```

### 2. Multiple Features

```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const { features, userType, platform } = useFeatureFlags({
    platform: 'web',
    refreshInterval: 30000, // Refresh every 30 seconds
  });
  
  return (
    <div>
      <h1>Welcome, {userType} user!</h1>
      {features.new_dashboard && <NewDashboard />}
      {features.advanced_analytics && <AdvancedAnalytics />}
    </div>
  );
}
```

### 3. Mobile App Usage

```tsx
// In your mobile app
const { features } = useFeatureFlags({
  platform: 'mobile'
});

const isMobileFeatureEnabled = useFeature('mobile_specific_feature', {
  platform: 'mobile'
});
```

### 4. API Usage (Non-React)

```javascript
// Get user features
const response = await fetch('/api/features?platform=web');
const { features, userType, platform } = await response.json();

// Check if feature is enabled
if (features.new_dashboard) {
  // Show new dashboard
}
```

## Admin Management

### Access Admin Panel
1. Navigate to `/admin/feature-flags`
2. Must be logged in as authorized admin
3. Current authorized admin: `mackewinsson@gmail.com`

### Creating Feature Flags

1. Click "Create Feature Flag"
2. Fill in the form:
   - **Key**: Unique identifier (e.g., `new_dashboard`)
   - **Name**: Display name (e.g., "New Dashboard")
   - **Description**: What the feature does
   - **Platforms**: Web, Mobile, or both
   - **User Types**: Free, Pro, Admin, or combinations
   - **Rollout Percentage**: 0-100% for gradual rollouts
   - **Target Users**: Specific user IDs (comma-separated)
   - **Exclude Users**: User IDs to exclude (comma-separated)
   - **Metadata**: JSON configuration data

### Feature Flag Types

#### 1. Simple Toggle
```json
{
  "key": "new_feature",
  "enabled": true,
  "platforms": ["web"],
  "userTypes": ["free", "pro"],
  "rolloutPercentage": 100
}
```

#### 2. Pro-Only Feature
```json
{
  "key": "advanced_analytics",
  "enabled": true,
  "platforms": ["web", "mobile"],
  "userTypes": ["pro"],
  "rolloutPercentage": 100
}
```

#### 3. Gradual Rollout
```json
{
  "key": "new_dashboard",
  "enabled": true,
  "platforms": ["web"],
  "userTypes": ["pro"],
  "rolloutPercentage": 50
}
```

#### 4. Targeted Users
```json
{
  "key": "beta_feature",
  "enabled": true,
  "platforms": ["web"],
  "userTypes": ["pro"],
  "targetUsers": ["user1", "user2", "user3"],
  "rolloutPercentage": 100
}
```

#### 5. A/B Testing
```json
{
  "key": "dashboard_variant_a",
  "enabled": true,
  "platforms": ["web"],
  "userTypes": ["free", "pro"],
  "rolloutPercentage": 50
}
```

## Best Practices

### 1. Naming Conventions
- Use snake_case for feature keys: `new_dashboard`, `advanced_analytics`
- Use descriptive names: `mobile_navigation_v2` instead of `nav2`

### 2. Rollout Strategy
- Start with 0% rollout for new features
- Gradually increase to 10%, 25%, 50%, 100%
- Monitor metrics at each stage

### 3. User Targeting
- Use `targetUsers` for beta testing with specific users
- Use `excludeUsers` to exclude problematic users
- Use `rolloutPercentage` for statistical rollouts

### 4. Platform Considerations
- Test features on both web and mobile
- Consider platform-specific limitations
- Use metadata for platform-specific configuration

### 5. Cleanup
- Remove unused feature flags
- Document feature flag purposes
- Set up monitoring for feature flag usage

## Testing

### Test Page
Visit `/dev-tools/feature-flags` to test the feature flag system.

### Example Components
- `components/FeatureFlagExample.tsx`: Comprehensive usage examples
- `app/dev-tools/feature-flags/page.tsx`: Test page with examples

## Security

### Admin Access
- Only authorized admins can manage feature flags
- Admin emails are hardcoded in the API endpoints
- Add new admins by updating the `AUTHORIZED_ADMINS` array

### User Data
- Feature flags are user-specific
- Rollout decisions are consistent per user
- No sensitive user data is exposed

## Monitoring

### Logs
- Feature flag changes are logged
- API access is logged
- Admin actions are tracked

### Metrics
Consider tracking:
- Feature flag usage rates
- User engagement with new features
- Error rates for new features
- Performance impact

## Migration from Static Features

The system works alongside the existing static feature system in `lib/features.ts`:

1. **Static Features**: Hard-coded in `lib/features.ts` (plan-based)
2. **Dynamic Features**: Managed through the admin panel (runtime control)

You can gradually migrate from static to dynamic features by:
1. Creating equivalent feature flags in the admin panel
2. Updating components to use the new hooks
3. Removing static feature definitions

## Troubleshooting

### Common Issues

1. **Feature not showing**: Check if user type and platform match
2. **Rollout not working**: Verify rollout percentage and user targeting
3. **Admin access denied**: Ensure email is in `AUTHORIZED_ADMINS`
4. **API errors**: Check network tab for detailed error messages

### Debug Mode
Enable debug logging by adding to your component:
```tsx
const { features, userType, platform, error } = useFeatureFlags();
console.log('Feature flags debug:', { features, userType, platform, error });
```

## Future Enhancements

Potential improvements:
- Feature flag analytics dashboard
- Automated rollback on error rates
- Feature flag templates
- Integration with CI/CD pipelines
- Feature flag usage tracking
- A/B testing statistical significance
