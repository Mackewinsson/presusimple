# 🔍 Debug Notification Issues

## Step-by-Step Debugging Guide

### 1. Check VAPID Configuration
First, let's verify your VAPID keys are properly configured:

```bash
# Check if VAPID keys are set
grep -E "VAPID|NEXT_PUBLIC_VAPID" .env.local
```

### 2. Test VAPID Public Key Endpoint
Visit: `http://localhost:3000/api/notifications/vapid-public-key`

You should see:
```json
{
  "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa40HI8lF5VvKVE8jsx_4jVXzQjsSQky8T2S0yxcrKvb4VdM3Ao4L8DELkBUw"
}
```

### 3. Test Notification Flow

#### Step 1: Go to PWA Test Page
Visit: `http://localhost:3000/pwa-test`

#### Step 2: Check Browser Console
Open browser dev tools and check for any errors.

#### Step 3: Request Permission
Click "Request Permission" button and check console logs.

#### Step 4: Subscribe to Notifications
Click "Subscribe to Notifications" and check console logs.

#### Step 5: Send Test Notification
Click "Send Test Notification" and check both:
- Browser console logs
- Server console logs (terminal where you ran `npm run dev`)

### 4. Check Server Logs
When you click "Send Test Notification", you should see logs like:

```
🔔 Notification send API called
👤 Session: Authenticated
📝 Notification data: { type: 'test', message: '...' }
👤 User found: Yes
🔔 User push subscription: Exists
🧪 Sending test notification...
📱 Subscription: Valid
🚀 Initializing web-push...
🔧 Validating VAPID configuration...
✅ VAPID configuration is valid
🔧 Setting VAPID details...
📧 Subject: mailto:mackewinsson@gmail.com
🔑 Public Key: Set
🔐 Private Key: Set
✅ VAPID details set successfully
✅ Web-push initialized successfully
📦 Payload: { title: 'Test Notification', ... }
📤 Sending notification with payload: {...}
✅ Notification sent successfully
```

### 5. Common Issues & Solutions

#### Issue 1: "User not subscribed to notifications"
**Solution**: Make sure you've completed the subscription process:
1. Request permission
2. Subscribe to notifications
3. Check that the subscription was saved to the database

#### Issue 2: "Web-push not initialized"
**Solution**: Check VAPID configuration:
1. Verify VAPID keys are set in .env.local
2. Restart the development server
3. Check that VAPID_SUBJECT is a valid email format

#### Issue 3: "Subscription expired" or "Subscription not found"
**Solution**: Re-subscribe to notifications:
1. Go to PWA test page
2. Unsubscribe (if subscribed)
3. Subscribe again

#### Issue 4: Service Worker Issues
**Solution**: Check service worker:
1. Open browser dev tools
2. Go to Application tab
3. Check Service Workers section
4. Make sure the service worker is active

### 6. Manual Database Check
If you want to check the database directly:

```bash
# Connect to your MongoDB and check user subscription
# Look for a user document with pushSubscription field
```

### 7. Test with Different Browsers
- Chrome: Full support
- Firefox: Full support  
- Safari: Limited support (iOS only)
- Edge: Full support

## Next Steps
1. Follow the debugging steps above
2. Check both browser and server console logs
3. Let me know what specific error messages you see
4. I can help you fix the specific issue

## Quick Fixes to Try

### Fix 1: Clear Browser Data
```bash
# Clear browser cache and local storage
# Or use incognito/private mode
```

### Fix 2: Restart Everything
```bash
# Stop dev server
pkill -f "next dev"

# Restart dev server
npm run dev
```

### Fix 3: Check HTTPS
Make sure you're testing on HTTPS or localhost (required for notifications).

Let me know what you see in the logs!
