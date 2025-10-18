# Mobile Feature Flags API Documentation

## Overview

The Feature Flags API allows mobile applications to dynamically control features based on user type, platform, and rollout configurations. This enables A/B testing, gradual rollouts, and feature toggling without requiring app updates.

## Base URL

```
Production: https://www.simple-budget.pro
Development: http://localhost:3000
```

## Authentication

All feature flag endpoints require JWT Bearer token authentication obtained from the mobile login endpoint.

### Getting Authentication Token

```javascript
// Step 1: Login to get JWT token
const loginResponse = await fetch(`${BASE_URL}/api/mobile-login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'userPassword'
  })
});

const { token, user } = await loginResponse.json();
// Store token securely in your app
```

## Endpoints

### GET /api/features

Retrieve feature flags applicable to the current user based on their plan, platform, and targeting rules.

#### Request

```http
GET /api/features?platform=mobile
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | Yes | Platform requesting feature flags. Must be `mobile` for mobile apps |

#### Response

**Success (200 OK)**
```json
{
  "features": {
    "new_dashboard": true,
    "advanced_analytics": false,
    "mobile_dark_mode": true,
    "offline_sync": true,
    "ai_assistant": false,
    "premium_features": true
  },
  "userType": "pro",
  "platform": "mobile",
  "userId": "688250e72a4d1976843ee892"
}
```

**Error Responses**

| Status | Description | Response |
|--------|-------------|----------|
| 400 | Bad request - Platform parameter required | `{"error": "Platform parameter is required"}` |
| 401 | Unauthorized - Invalid or missing token | `{"error": "Unauthorized"}` |
| 404 | User not found | `{"error": "User not found"}` |
| 500 | Internal server error | `{"error": "Failed to get features"}` |

## Response Fields

### features
- **Type**: Object
- **Description**: Key-value pairs where keys are feature flag names and values are boolean indicating if the feature is enabled for the user
- **Example**: `{"new_dashboard": true, "ai_assistant": false}`

### userType
- **Type**: String
- **Description**: User's subscription type
- **Values**: `"free"` | `"pro"` | `"admin"`

### platform
- **Type**: String
- **Description**: Platform that requested the features
- **Values**: `"mobile"` | `"web"`

### userId
- **Type**: String
- **Description**: Unique identifier for the user

## Mobile Implementation Examples

### React Native Service Class

```javascript
class FeatureFlagService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.features = {};
    this.userType = null;
    this.userId = null;
    this.lastFetch = null;
    this.refreshInterval = 30000; // 30 seconds
  }

  async fetchFeatures(authToken) {
    try {
      const response = await fetch(`${this.baseUrl}/api/features?platform=mobile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.features = data.features;
        this.userType = data.userType;
        this.userId = data.userId;
        this.lastFetch = Date.now();
        
        // Store locally for offline use
        await this.storeLocally(data);
        
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      // Try to load from local storage as fallback
      return await this.loadFromLocal();
    }
  }

  isFeatureEnabled(featureKey, fallback = false) {
    return this.features[featureKey] === true || fallback;
  }

  getUserType() {
    return this.userType;
  }

  getUserId() {
    return this.userId;
  }

  // Auto-refresh feature flags
  startAutoRefresh(authToken) {
    return setInterval(() => {
      this.fetchFeatures(authToken);
    }, this.refreshInterval);
  }

  // Local storage methods
  async storeLocally(data) {
    try {
      await AsyncStorage.setItem('feature_flags', JSON.stringify(data));
    } catch (error) {
      console.error('Error storing feature flags locally:', error);
    }
  }

  async loadFromLocal() {
    try {
      const stored = await AsyncStorage.getItem('feature_flags');
      if (stored) {
        const data = JSON.parse(stored);
        this.features = data.features || {};
        this.userType = data.userType;
        this.userId = data.userId;
        return data;
      }
    } catch (error) {
      console.error('Error loading feature flags from local storage:', error);
    }
    return null;
  }
}

export default new FeatureFlagService('https://www.simple-budget.pro');
```

### Usage in React Native Components

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import FeatureFlagService from './services/FeatureFlagService';

export default function MyComponent() {
  const [features, setFeatures] = useState({});
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    initializeFeatureFlags();
  }, []);

  const initializeFeatureFlags = async () => {
    // Get stored auth token
    const token = await getStoredAuthToken();
    if (token) {
      setAuthToken(token);
      await loadFeatureFlags(token);
    }
  };

  const loadFeatureFlags = async (token) => {
    const data = await FeatureFlagService.fetchFeatures(token);
    if (data) {
      setFeatures(data.features);
      // Start auto-refresh
      FeatureFlagService.startAutoRefresh(token);
    }
  };

  return (
    <View>
      {/* Conditional rendering based on feature flags */}
      {FeatureFlagService.isFeatureEnabled('new_dashboard') ? (
        <NewDashboard />
      ) : (
        <OldDashboard />
      )}
      
      {/* Show premium features only if enabled */}
      {FeatureFlagService.isFeatureEnabled('premium_features') && (
        <PremiumFeatures />
      )}
      
      {/* A/B Testing example */}
      {FeatureFlagService.isFeatureEnabled('new_checkout_flow') ? (
        <NewCheckoutFlow />
      ) : (
        <OldCheckoutFlow />
      )}
      
      {/* User type based features */}
      {FeatureFlagService.getUserType() === 'pro' && (
        <ProOnlyFeatures />
      )}
    </View>
  );
}
```

### Swift (iOS) Implementation

```swift
import Foundation

class FeatureFlagService {
    static let shared = FeatureFlagService()
    private let baseURL = "https://www.simple-budget.pro"
    
    private var features: [String: Bool] = [:]
    private var userType: String?
    private var userId: String?
    
    private init() {}
    
    func fetchFeatures(authToken: String) async throws -> FeatureFlagsResponse {
        guard let url = URL(string: "\(baseURL)/api/features?platform=mobile") else {
            throw FeatureFlagError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw FeatureFlagError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw FeatureFlagError.httpError(httpResponse.statusCode)
        }
        
        let featureResponse = try JSONDecoder().decode(FeatureFlagsResponse.self, from: data)
        
        // Update local state
        self.features = featureResponse.features
        self.userType = featureResponse.userType
        self.userId = featureResponse.userId
        
        return featureResponse
    }
    
    func isFeatureEnabled(_ featureKey: String, fallback: Bool = false) -> Bool {
        return features[featureKey] ?? fallback
    }
    
    func getUserType() -> String? {
        return userType
    }
}

struct FeatureFlagsResponse: Codable {
    let features: [String: Bool]
    let userType: String
    let platform: String
    let userId: String
}

enum FeatureFlagError: Error {
    case invalidURL
    case invalidResponse
    case httpError(Int)
}
```

### Kotlin (Android) Implementation

```kotlin
import kotlinx.coroutines.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URL

class FeatureFlagService {
    companion object {
        private const val BASE_URL = "https://www.simple-budget.pro"
        private val json = Json { ignoreUnknownKeys = true }
    }
    
    private var features: Map<String, Boolean> = emptyMap()
    private var userType: String? = null
    private var userId: String? = null
    
    suspend fun fetchFeatures(authToken: String): FeatureFlagsResponse? {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("$BASE_URL/api/features?platform=mobile")
                val connection = url.openConnection() as HttpURLConnection
                
                connection.requestMethod = "GET"
                connection.setRequestProperty("Authorization", "Bearer $authToken")
                connection.setRequestProperty("Content-Type", "application/json")
                
                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val response = connection.inputStream.bufferedReader().use { it.readText() }
                    val featureResponse = json.decodeFromString<FeatureFlagsResponse>(response)
                    
                    // Update local state
                    features = featureResponse.features
                    userType = featureResponse.userType
                    userId = featureResponse.userId
                    
                    featureResponse
                } else {
                    null
                }
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
    
    fun isFeatureEnabled(featureKey: String, fallback: Boolean = false): Boolean {
        return features[featureKey] ?: fallback
    }
    
    fun getUserType(): String? = userType
    fun getUserId(): String? = userId
}

@Serializable
data class FeatureFlagsResponse(
    val features: Map<String, Boolean>,
    val userType: String,
    val platform: String,
    val userId: String
)
```

## Feature Flag Targeting Rules

Feature flags are evaluated based on the following rules (in order of priority):

1. **Explicit Exclusion**: If user ID is in `excludeUsers` array, feature is disabled
2. **Explicit Targeting**: If `targetUsers` array is specified, only those users get the feature
3. **Rollout Percentage**: If `rolloutPercentage < 100`, feature is enabled based on consistent hash of `userId + featureKey`
4. **Default**: If none of the above apply, feature follows the `enabled` flag

## Best Practices

### 1. Error Handling
Always implement fallback values for feature flags to ensure your app continues to work even if the API is unavailable.

```javascript
const isFeatureEnabled = (featureKey, fallback = false) => {
  try {
    return FeatureFlagService.isFeatureEnabled(featureKey, fallback);
  } catch (error) {
    console.error(`Error checking feature ${featureKey}:`, error);
    return fallback;
  }
};
```

### 2. Caching
Store feature flags locally to provide offline functionality and reduce API calls.

### 3. Auto-refresh
Implement periodic refresh to get updated feature flags without requiring app restart.

### 4. User Experience
Use feature flags to enhance user experience, not to break functionality. Always provide fallbacks.

### 5. Testing
Test your app with different feature flag combinations to ensure all code paths work correctly.

## Common Feature Flag Patterns

### A/B Testing
```javascript
// Show different UI based on feature flag
{FeatureFlagService.isFeatureEnabled('new_ui_design') ? (
  <NewUIDesign />
) : (
  <OldUIDesign />
)}
```

### Gradual Rollout
```javascript
// Feature is gradually rolled out to users
if (FeatureFlagService.isFeatureEnabled('new_feature')) {
  // New feature logic
} else {
  // Existing feature logic
}
```

### User Type Gating
```javascript
// Show features based on user subscription
const showProFeatures = FeatureFlagService.getUserType() === 'pro' || 
                       FeatureFlagService.isFeatureEnabled('pro_features');
```

### Platform-Specific Features
```javascript
// Mobile-specific features
if (FeatureFlagService.isFeatureEnabled('mobile_offline_sync')) {
  enableOfflineSync();
}
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that your JWT token is valid and properly formatted
2. **Empty features object**: Ensure the user has features configured for their user type and platform
3. **Feature not showing**: Verify the feature flag is enabled and targets the correct user type/platform

### Debug Mode

Enable debug logging to troubleshoot feature flag issues:

```javascript
const DEBUG_FEATURE_FLAGS = __DEV__; // Enable in development

if (DEBUG_FEATURE_FLAGS) {
  console.log('Current features:', FeatureFlagService.features);
  console.log('User type:', FeatureFlagService.getUserType());
  console.log('User ID:', FeatureFlagService.getUserId());
}
```

## Support

For issues or questions about the Feature Flags API, please contact the development team or check the main API documentation at `/api-docs`.
