# 📱 Push Notifications Setup Guide

This guide will help you set up push notifications for your Budget PWA app.

## 🎯 What's Implemented

✅ **Core Infrastructure**
- Notification permission management
- Push subscription handling
- Service worker with notification support
- VAPID key configuration
- API endpoints for subscription management

✅ **User Interface**
- Enhanced PWA test page with notification testing
- Admin panel for sending notifications
- Real-time notification status display

✅ **Admin Features**
- Send test notifications
- Send custom notifications to all users
- View subscription statistics
- Notification history (basic)

## 🚀 Setup Instructions

### 1. Generate VAPID Keys

First, generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa40HI8lF5VvKVE8jsx_4jVXzQjsSQky8T2S0yxcrKvb4VdM3Ao4L8DELkBUw

Private Key:
AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI

=======================================
```

### 2. Add Environment Variables

Add these to your `.env.local` file:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa40HI8lF5VvKVE8jsx_4jVXzQjsSQky8T2S0yxcrKvb4VdM3Ao4L8DELkBUw
VAPID_PRIVATE_KEY=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:** Replace `your-email@example.com` with your actual email address.

### 3. Restart Your Development Server

```bash
npm run dev
```

### 4. Test the Implementation

1. **Go to PWA Test Page**: Navigate to `/pwa-test`
2. **Check Notification Support**: Look for the "Push Notifications" card
3. **Request Permission**: Click "Request Permission" if supported
4. **Subscribe**: Click "Subscribe to Notifications"
5. **Send Test**: Click "Send Test Notification"

### 5. Test Admin Panel

1. **Go to Admin Panel**: Navigate to `/admin/notifications`
2. **Send Test Notification**: Use the "Send Test Notification" button
3. **Send Custom Notification**: Create and send a custom notification

## 🔧 How It Works

### User Flow
1. User visits PWA test page
2. Clicks "Request Permission" → Browser asks for notification permission
3. Clicks "Subscribe" → Creates push subscription and saves to database
4. User can now receive notifications

### Admin Flow
1. Admin goes to `/admin/notifications`
2. Creates notification with title, body, and options
3. Clicks "Send to All Subscribers"
4. System sends notification to all subscribed users

### Technical Flow
1. **Client**: `useNotifications` hook manages permission and subscription
2. **Service Worker**: Handles push events and displays notifications
3. **API**: Manages subscriptions and sends notifications
4. **Database**: Stores user push subscriptions

## 📁 File Structure

```
hooks/
  useNotifications.ts          # Notification management hook
lib/
  vapid.ts                     # VAPID key configuration
  notifications.ts             # Notification sending service
app/
  admin/
    notifications/
      page.tsx                 # Admin notification panel
  api/
    notifications/
      subscribe/route.ts       # Subscribe endpoint
      unsubscribe/route.ts     # Unsubscribe endpoint
      send/route.ts            # Send notification endpoint
      vapid-public-key/route.ts # VAPID public key
    admin/
      notifications/
        send/route.ts          # Admin send endpoint
        stats/route.ts         # Statistics endpoint
        history/route.ts       # History endpoint
  pwa-test/
    page.tsx                   # Enhanced with notifications
public/
  custom-sw.js                 # Custom service worker
models/
  User.ts                      # Updated with notification fields
```

## 🎨 Features

### User Features
- **Permission Management**: Request and check notification permissions
- **Subscription Status**: See if subscribed to notifications
- **Test Notifications**: Send test notifications to yourself
- **Error Handling**: Clear error messages and recovery

### Admin Features
- **Statistics Dashboard**: View subscriber counts and activity
- **Test Notifications**: Send test notifications to yourself
- **Custom Notifications**: Send notifications to all subscribers
- **Notification Options**: Configure interaction requirements, silence, etc.
- **History**: View recent notifications sent

### Technical Features
- **VAPID Authentication**: Secure push notification authentication
- **Service Worker**: Handles notifications even when app is closed
- **Database Integration**: Stores subscriptions in MongoDB
- **Error Handling**: Comprehensive error handling and logging
- **Type Safety**: Full TypeScript support

## 🔒 Security

- **Admin Authorization**: Only authorized emails can access admin panel
- **VAPID Keys**: Secure authentication for push notifications
- **User Authentication**: Notifications tied to authenticated users
- **Input Validation**: All inputs are validated and sanitized

## 🚨 Troubleshooting

### Common Issues

1. **"Notifications not supported"**
   - Ensure you're using HTTPS (required for notifications)
   - Check if browser supports notifications

2. **"VAPID configuration error"**
   - Verify VAPID keys are set in environment variables
   - Check that keys are properly formatted

3. **"Failed to subscribe"**
   - Check if service worker is registered
   - Verify VAPID public key is accessible

4. **"No users subscribed"**
   - Make sure users have subscribed via the PWA test page
   - Check database for push subscriptions

### Debug Steps

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Verify API calls are successful
3. **Check Service Worker**: Ensure custom service worker is active
4. **Check Database**: Verify subscriptions are saved

## 🔮 Future Enhancements

- **Notification Templates**: Pre-defined notification types
- **Scheduled Notifications**: Send notifications at specific times
- **User Preferences**: Let users choose notification types
- **Analytics**: Track notification open rates and engagement
- **Rich Notifications**: Add images, actions, and more options
- **Notification History**: Store and display notification history

## 📚 Resources

- [MDN Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Ready to test!** 🎉

Your notification infrastructure is now set up. Users can subscribe to notifications, and you can send them from the admin panel. The system is ready for future enhancements like automatic budget alerts and expense reminders.
