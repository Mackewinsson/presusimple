# Web Push Notifications Implementation

This document describes the web push notification implementation in the Simple Budget PWA, following the [next-pwa web-push example](https://github.com/shadowwalker/next-pwa/tree/master/examples/web-push).

## Overview

The implementation provides a complete web push notification system with:
- ✅ Service Worker with push event handling
- ✅ VAPID key management and validation
- ✅ Push subscription management
- ✅ Notification click and action handling
- ✅ Error handling and retry logic
- ✅ Comprehensive testing interface

## Architecture

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

### 4. API Routes
- `/api/notifications/vapid-public-key` - Returns VAPID public key
- `/api/notifications/subscribe` - Handles push subscription
- `/api/notifications/unsubscribe` - Removes push subscription
- `/api/notifications/send` - Sends notifications

### 5. React Components
- `useNotifications` hook - Client-side notification management
- `NotificationManager` - UI component for testing
- `WebPushExamplePage` - Comprehensive example page

## Setup Instructions

### 1. Generate VAPID Keys

```bash
# Install web-push if not already installed
npm install web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

### 2. Environment Variables

Add the generated keys to your `.env.local` file:

```env
# Web Push (VAPID) Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com

# Enable PWA in development (optional)
ENABLE_PWA_DEV=true
```

### 3. Enable PWA in Development

For testing in development mode:

```bash
# Option 1: Enable for this session only
ENABLE_PWA_DEV=true npm run dev

# Option 2: Permanently enable (edit next.config.js)
# Set disable: false in the withPWA configuration
```

## Testing

### 1. Web Push Example Page
Visit `/web-push-example` for a comprehensive testing interface that demonstrates:
- Browser support detection
- Permission management
- Subscription handling
- Notification sending
- Comprehensive testing

### 2. Notification Test Page
Visit `/notification-test` for detailed testing of:
- Service worker communication
- Push notification sending
- Local notification creation

### 3. Test Script
Run the automated test script:

```bash
node scripts/test-web-push.js
```

This script will:
- Validate VAPID configuration
- Test database connectivity
- Find users with subscriptions
- Send test notifications
- Provide detailed status information

## Usage Examples

### Basic Subscription Flow

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    sendTestNotification
  } = useNotifications();

  const handleSubscribe = async () => {
    if (permission !== 'granted') {
      await requestPermission();
    }
    if (permission === 'granted') {
      await subscribe();
    }
  };

  return (
    <div>
      <button onClick={handleSubscribe}>
        {isSubscribed ? 'Subscribed' : 'Subscribe to Notifications'}
      </button>
      {isSubscribed && (
        <button onClick={sendTestNotification}>
          Send Test Notification
        </button>
      )}
    </div>
  );
}
```

### Sending Notifications from Server

```typescript
import { sendNotificationToUser } from '@/lib/notifications';

// Send a budget alert notification
await sendNotificationToUser(user.pushSubscription, {
  title: 'Budget Alert',
  body: 'You\'ve exceeded your monthly budget!',
  icon: '/icons/icon-192x192.png',
  url: '/budget',
  data: { type: 'budget-alert' }
});
```

## Browser Support

Web push notifications require:
- ✅ HTTPS or localhost (secure context)
- ✅ Browser supports push notifications
- ✅ User has granted notification permission
- ✅ Service worker is registered and active

### Supported Browsers
- Chrome/Chromium (all platforms)
- Firefox (all platforms)
- Safari (macOS 16.4+, iOS 16.4+)
- Edge (all platforms)

## Troubleshooting

### Common Issues

1. **Service Worker Not Registered**
   - Ensure PWA is enabled in development: `ENABLE_PWA_DEV=true npm run dev`
   - Clear browser cache and reload
   - Check browser DevTools → Application → Service Workers

2. **VAPID Keys Not Working**
   - Verify keys are correctly set in environment variables
   - Ensure keys are generated using `npx web-push generate-vapid-keys`
   - Check server logs for VAPID validation errors

3. **Notifications Not Received**
   - Verify user has granted permission
   - Check if subscription exists in database
   - Ensure service worker is active
   - Test with the provided test scripts

4. **Development Mode Issues**
   - PWA is disabled by default in development
   - Use `ENABLE_PWA_DEV=true npm run dev` to enable
   - Or permanently enable by modifying `next.config.js`

### Debug Information

Enable detailed logging by:
1. Opening browser DevTools (F12)
2. Going to Application tab → Service Workers
3. Clicking on the service worker console link
4. Monitoring both main console and service worker console

Look for logs starting with:
- 🔔 - Notification events
- 📨 - Message handling
- ✅ - Success operations
- ❌ - Error conditions

## Security Considerations

1. **VAPID Keys**
   - Keep private key secure and never commit to version control
   - Public key is safe to expose in client-side code
   - Use different keys for development and production

2. **User Data**
   - Push subscriptions are stored securely in the database
   - User consent is required before storing subscription data
   - Implement proper authentication for notification endpoints

3. **Rate Limiting**
   - Implement rate limiting for notification sending
   - Respect user preferences and unsubscribe requests
   - Handle expired subscriptions gracefully

## Performance Optimization

1. **Batch Notifications**
   - Use `sendNotificationToUsers` for multiple recipients
   - Implement concurrency limits to avoid overwhelming the server
   - Cache VAPID configuration to avoid repeated initialization

2. **Error Handling**
   - Implement retry logic for failed notifications
   - Handle expired subscriptions (410 status code)
   - Clean up invalid subscriptions from the database

3. **Monitoring**
   - Track notification delivery rates
   - Monitor subscription health
   - Log errors for debugging and improvement

## References

- [next-pwa web-push example](https://github.com/shadowwalker/next-pwa/tree/master/examples/web-push)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [MDN Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
