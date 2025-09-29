# Push Notifications Setup Guide

This guide explains how to set up and test push notifications in your Simple Budget PWA, following the Next.js PWA documentation best practices.

## Overview

The notifications feature has been completely refactored to follow the Next.js PWA documentation patterns:

- ✅ **Server Actions** instead of API routes for better performance
- ✅ **Proper VAPID key handling** with correct response format
- ✅ **Service Worker** with notification support
- ✅ **Security headers** for service worker protection
- ✅ **Clean component architecture** following React best practices

## Setup Instructions

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

### 2. Add Environment Variables

Add the generated keys to your `.env.local` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:**
- Replace `your-email@example.com` with your actual email address
- Keep the private key secure and never commit it to version control
- The public key is safe to expose in client-side code

### 3. Restart Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Testing Notifications

### 1. Access Test Page

Navigate to `/dev-tools` to access the unified developer tools and notification testing page.

### 2. Test Steps

1. **Request Permission**: Click "Request Permission" to allow notifications
2. **Subscribe**: Click "Subscribe to Notifications" to enable push notifications
3. **Test**: Click "Send Test Notification" to receive a test notification
4. **Verify**: You should see a notification appear on your device
5. **Click**: Click the notification to open the app

### 3. Requirements Check

The test page will show you if all requirements are met:
- ✅ HTTPS or localhost (Secure Context)
- ✅ Service Worker Support
- ✅ Push Manager Support
- ✅ Notification API Support

## Architecture

### Server Actions (`app/actions.ts`)

Following Next.js best practices, we use Server Actions instead of API routes:

- `subscribeUser(subscription)` - Save user's push subscription
- `unsubscribeUser()` - Remove user's push subscription
- `sendNotification(message)` - Send a test notification

### Notification Manager Component

The `NotificationManager` component handles:
- Permission requests
- Subscription management
- Error handling
- User feedback

### Service Worker

The service worker (`public/sw-custom.js`) handles:
- Push event processing
- Notification display
- Click handling
- Background sync

## Security Features

### Service Worker Headers

Added security headers for the service worker in `next.config.js`:

```javascript
{
  source: "/sw.js",
  headers: [
    {
      key: "Content-Type",
      value: "application/javascript; charset=utf-8",
    },
    {
      key: "Cache-Control",
      value: "no-cache, no-store, must-revalidate",
    },
    {
      key: "Content-Security-Policy",
      value: "default-src 'self'; script-src 'self'",
    },
  ],
}
```

### Manifest Permissions

Added notification permissions to `manifest.json`:

```json
{
  "permissions": [
    "notifications"
  ]
}
```

## Troubleshooting

### Common Issues

1. **No notification appears**
   - Check browser notification settings
   - Ensure notifications are enabled for this site
   - Verify you're on HTTPS or localhost

2. **Permission denied**
   - Go to browser settings and manually enable notifications
   - Clear site data and try again

3. **Service worker not found**
   - Refresh the page and try again
   - Check browser developer tools for service worker errors

4. **VAPID error**
   - Ensure VAPID keys are properly configured in environment variables
   - Restart the development server after adding keys

5. **Subscription failed**
   - Check that the service worker is active
   - Verify VAPID public key is correctly formatted
   - Ensure user is authenticated

### Debug Information

Check the browser console for detailed error messages. The notification system includes comprehensive logging to help diagnose issues.

## Production Deployment

### Environment Variables

Make sure to set the VAPID keys in your production environment:

```bash
# In your deployment platform (Vercel, Netlify, etc.)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_production_public_key
VAPID_PRIVATE_KEY=your_production_private_key
VAPID_SUBJECT=mailto:your-production-email@domain.com
```

### HTTPS Requirement

Push notifications require HTTPS in production. Most deployment platforms provide this automatically.

## Browser Support

Push notifications are supported in:
- ✅ Chrome (Android, Desktop)
- ✅ Firefox (Android, Desktop)
- ✅ Safari (iOS 16.4+, macOS)
- ✅ Edge (Desktop)

## Next Steps

1. Test the notifications thoroughly on different devices
2. Implement custom notification types for budget alerts
3. Add notification preferences in user settings
4. Consider implementing notification scheduling for reminders

## Files Modified

- `app/actions.ts` - Server Actions for notification management
- `components/NotificationManager.tsx` - React component for notification UI
- `app/dev-tools/page.tsx` - Unified developer tools and notification testing page
- `public/sw-custom.js` - Service worker with notification support
- `next.config.js` - Security headers for service worker
- `public/manifest.json` - Added notification permissions
- `scripts/generate-vapid-keys.js` - VAPID key generation script

The notifications feature is now properly implemented following Next.js PWA best practices and should work reliably across different browsers and devices.