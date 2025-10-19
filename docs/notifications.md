# Web Push Notifications - Complete Guide

This comprehensive guide covers everything about web push notifications in the Presusimple PWA, including setup, implementation, troubleshooting, and best practices.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Testing & Development](#testing--development)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)

## 🎯 Overview

The Presusimple PWA includes a complete web push notification system that follows industry best practices and integrates seamlessly with MongoDB for user management.

### ✅ Features

- **Service Worker Integration**: Custom service worker with push event handling
- **VAPID Authentication**: Secure push notification authentication
- **Database Integration**: MongoDB storage for user subscriptions
- **Rich Notifications**: Support for actions, badges, and custom icons
- **Error Handling**: Comprehensive error handling and retry logic
- **Testing Tools**: Unified developer tools dashboard
- **Production Ready**: Security headers and validation

### 🔧 Technology Stack

- **Next.js PWA**: Automatic service worker registration
- **Web Push API**: Browser-native push notifications
- **MongoDB**: User subscription storage
- **VAPID**: Voluntary Application Server Identification
- **React Hooks**: Client-side notification management

## 🏗️ Architecture

### 1. Service Worker (`worker/index.js`)
- Extends the auto-generated next-pwa service worker
- Handles push events and notification display
- Manages notification clicks and actions
- Provides message handling for testing

### 2. Notification Service (`lib/notifications.ts`)
- Server-side notification sending logic
- VAPID key initialization
- Error handling and retry mechanisms
- Support for different notification types

### 3. VAPID Configuration (`lib/vapid.ts`)
- VAPID key management
- Configuration validation
- Environment variable handling

### 4. Client-Side Hooks (`hooks/useNotifications.ts`)
- React hook for notification management
- Permission handling
- Subscription management
- Error state management

### 5. API Endpoints
- `/api/notifications/vapid-public-key` - Returns VAPID public key
- `/api/notifications/subscribe` - Handles push subscription
- `/api/notifications/unsubscribe` - Removes push subscription
- `/api/notifications/send` - Sends notifications
- `/api/notifications/db-status` - Database status monitoring
- `/api/admin/notifications/*` - Admin notification management

## 🚀 Setup Instructions

### 1. Generate VAPID Keys

First, you need to generate VAPID keys for push notification authentication:

```bash
# Install web-push if not already installed
npm install web-push

# Generate VAPID keys
node scripts/generate-vapid-keys.js
```

This will output something like:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 2. Environment Variables

Add the generated keys to your `.env.local` file:

```env
# Web Push (VAPID) Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:**
- Replace `your-email@example.com` with your actual email address
- Keep the private key secure and never commit it to version control
- The public key is safe to expose in client-side code

### 3. Database Setup

The notification system automatically integrates with your existing MongoDB setup. The `User` model includes:

```typescript
interface IUser {
  // ... existing fields
  pushSubscription?: any; // Push subscription object
  notificationEnabled?: boolean;
  lastNotificationUpdate?: Date;
}
```

### 4. Restart Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## 🧪 Testing & Development

### 1. Unified Developer Tools

Navigate to `/dev-tools` to access the comprehensive testing dashboard that includes:

- **Overview Tab**: System status and browser support
- **Notifications Tab**: Permission and subscription management
- **PWA Tab**: Installation and status information
- **Database Tab**: Connection testing
- **Testing Tab**: Comprehensive test suite
- **Logs Tab**: Real-time debugging information

### 2. Test Steps

1. **Request Permission**: Click "Request Permission" to allow notifications
2. **Subscribe**: Click "Subscribe to Notifications" to enable push notifications
3. **Test**: Click "Send Test Notification" to receive a test notification
4. **Monitor**: Check the logs tab for detailed debugging information

### 3. Development Mode

For testing in development mode, you may need to enable PWA:

```bash
# Enable PWA in development
ENABLE_PWA_DEV=true npm run dev
```

### 4. Test Scripts

Several test scripts are available for comprehensive testing:

```bash
# Test MongoDB integration
node scripts/test-mongo-notifications.js

# Test web push implementation
node scripts/test-web-push.js

# Test notification delivery
node scripts/test-notification-delivery.js

# Debug notifications
node scripts/debug-notifications.js
```

## 🚀 Production Deployment

### 1. Environment Variables

Ensure all VAPID keys are set in your production environment:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_production_public_key
VAPID_PRIVATE_KEY=your_production_private_key
VAPID_SUBJECT=mailto:your-production-email@example.com
```

### 2. Security Considerations

- ✅ VAPID keys are properly configured
- ✅ HTTPS is enabled (required for push notifications)
- ✅ Service worker security headers are set
- ✅ Database connections are secure

### 3. Monitoring

- Monitor notification delivery success rates
- Track user subscription rates
- Monitor database performance
- Check service worker registration rates

## 🔧 Troubleshooting

### Common Issues

#### 1. Notifications Not Received

**Symptoms:**
- User subscribed but no notifications appear
- No errors in console

**Solutions:**
1. Check if PWA is enabled in development:
   ```bash
   ENABLE_PWA_DEV=true npm run dev
   ```
2. Clear browser cache and reload
3. Check service worker registration in DevTools
4. Verify notification permission is granted

#### 2. VAPID Credentials Mismatch

**Error:**
```
❌ Error sending notification: [Error [WebPushError]: Received unexpected response code] {
  statusCode: 403,
  body: 'the VAPID credentials in the authorization header do not correspond to the credentials used to create the subscriptions.'
}
```

**Solution:**
```bash
# Run the automated fix script
node scripts/fix-vapid-mismatch.js
```

This will clear old subscriptions and allow users to re-subscribe with correct keys.

#### 3. Service Worker Not Registering

**Symptoms:**
- Service worker shows as "Not Registered"
- Push notifications not working

**Solutions:**
1. Check if PWA is disabled in development
2. Clear browser storage and reload
3. Check for JavaScript errors in console
4. Verify HTTPS or localhost context

#### 4. Permission Denied

**Symptoms:**
- User cannot grant notification permission
- Permission shows as "denied"

**Solutions:**
1. Check browser notification settings
2. Clear site data and try again
3. Test in different browser
4. Ensure secure context (HTTPS/localhost)

### Debugging Steps

1. **Check Browser Support**:
   - Open `/dev-tools`
   - Verify all status indicators are green

2. **Test Service Worker**:
   - Open DevTools → Application → Service Workers
   - Verify `/sw.js` is registered and active

3. **Test Database Connection**:
   - Use the Database tab in `/dev-tools`
   - Verify MongoDB connection is working

4. **Check VAPID Configuration**:
   - Run `node scripts/debug-notifications.js`
   - Verify VAPID keys are properly configured

## 📚 API Reference

### Client-Side Hook

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const {
  permission,           // NotificationPermission
  isSupported,         // boolean
  isSubscribed,        // boolean
  subscription,        // PushSubscription | null
  isLoading,           // boolean
  error,               // string | null
  requestPermission,   // () => Promise<boolean>
  subscribe,           // () => Promise<boolean>
  unsubscribe,         // () => Promise<boolean>
  sendTestNotification, // () => Promise<void>
  clearError,          // () => void
} = useNotifications();
```

### Server-Side Functions

```typescript
import { 
  sendNotificationToUser,
  sendNotificationToUsers,
  sendTestNotification,
  sendBudgetAlertNotification,
  sendExpenseReminderNotification
} from '@/lib/notifications';

// Send to single user
await sendNotificationToUser(subscription, payload);

// Send to multiple users
await sendNotificationToUsers(subscriptions, payload);

// Send test notification
await sendTestNotification(subscription, customMessage);
```

### API Endpoints

#### GET `/api/notifications/vapid-public-key`
Returns the VAPID public key for client-side subscription.

#### POST `/api/notifications/subscribe`
Stores a user's push subscription in the database.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

#### DELETE `/api/notifications/unsubscribe`
Removes a user's push subscription from the database.

#### POST `/api/notifications/send`
Sends a notification to the authenticated user.

**Body:**
```json
{
  "type": "test",
  "title": "Test Notification",
  "body": "This is a test notification",
  "message": "Custom message"
}
```

## 🎯 Best Practices

### 1. VAPID Key Management
- **Never regenerate VAPID keys** once users have subscribed
- Store keys securely in production environment
- Use different keys for development and production
- Keep private key secure and never commit to version control

### 2. User Experience
- Request permission at appropriate times
- Provide clear value proposition for notifications
- Allow users to easily unsubscribe
- Handle permission denied gracefully

### 3. Performance
- Batch notification sending for large user bases
- Implement rate limiting
- Monitor delivery success rates
- Clean up expired subscriptions

### 4. Security
- Always use HTTPS in production
- Validate all notification payloads
- Implement proper authentication
- Monitor for abuse

### 5. Testing
- Test in multiple browsers
- Test on different devices
- Test with different network conditions
- Monitor error rates and user feedback

## 📁 File Structure

```
├── app/
│   ├── dev-tools/page.tsx              # Unified testing dashboard
│   ├── admin/notifications/page.tsx    # Admin notification management
│   └── api/notifications/              # API endpoints
├── components/
│   └── NotificationPrompt.tsx          # Notification prompt component
├── hooks/
│   └── useNotifications.ts             # Notification management hook
├── lib/
│   ├── notifications.ts                # Server-side notification logic
│   ├── vapid.ts                        # VAPID configuration
│   └── webpush.ts                      # Web push initialization
├── worker/
│   └── index.js                        # Custom service worker
└── scripts/
    ├── generate-vapid-keys.js          # VAPID key generation
    ├── test-mongo-notifications.js     # MongoDB integration tests
    ├── test-web-push.js                # Web push tests
    ├── debug-notifications.js          # Debugging script
    └── fix-vapid-mismatch.js           # VAPID mismatch fix
```

## 🔗 Additional Resources

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [Next.js PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [MDN Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

---

**Need Help?** Visit `/dev-tools` for comprehensive testing and debugging tools, or check the troubleshooting section above for common issues and solutions.
