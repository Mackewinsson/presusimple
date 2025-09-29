# VAPID Credentials Troubleshooting Guide

## 🚨 Common Issue: VAPID Credentials Mismatch

### Error Message
```
❌ Error sending notification: [Error [WebPushError]: Received unexpected response code] {
  statusCode: 403,
  body: 'the VAPID credentials in the authorization header do not correspond to the credentials used to create the subscriptions.'
}
```

### What This Means
This error occurs when:
1. A user subscribed to push notifications with **old VAPID keys**
2. You later **regenerated new VAPID keys** 
3. The system tries to send notifications using the **new keys** to a subscription created with **old keys**
4. The push service (FCM/Google) rejects the request because the keys don't match

### 🔧 How to Fix

#### Option 1: Automated Fix (Recommended)
```bash
# Run the automated fix script
node scripts/fix-vapid-mismatch.js
```

This script will:
- ✅ Connect to your MongoDB database
- ✅ Find all users with push subscriptions
- ✅ Clear their old subscriptions
- ✅ Allow them to re-subscribe with correct VAPID keys

#### Option 2: Manual Fix via Dashboard
1. Visit `/notification-dashboard`
2. Go to the "Testing" tab
3. Click "Clear Subscription (Fix VAPID)" button
4. Re-subscribe to notifications

#### Option 3: Manual Database Fix
```bash
# Connect to MongoDB and clear subscriptions
mongo your-database-name
db.users.updateMany(
  { pushSubscription: { $exists: true } },
  { 
    $unset: { pushSubscription: 1 },
    $set: { 
      notificationEnabled: false,
      lastNotificationUpdate: new Date()
    }
  }
)
```

### 🔍 Prevention

#### 1. Keep VAPID Keys Consistent
- **Never regenerate VAPID keys** once users have subscribed
- Store VAPID keys securely in production
- Use environment variables for different environments

#### 2. Environment-Specific Keys
```env
# Development
NEXT_PUBLIC_VAPID_PUBLIC_KEY=dev_public_key
VAPID_PRIVATE_KEY=dev_private_key

# Production  
NEXT_PUBLIC_VAPID_PUBLIC_KEY=prod_public_key
VAPID_PRIVATE_KEY=prod_private_key
```

#### 3. Key Rotation Strategy
If you must rotate VAPID keys:
1. **Phase 1**: Deploy new keys alongside old keys
2. **Phase 2**: Clear all existing subscriptions
3. **Phase 3**: Users re-subscribe with new keys
4. **Phase 4**: Remove old keys

### 🧪 Testing After Fix

#### 1. Verify Database State
```bash
node scripts/test-mongo-notifications.js
```

Expected output:
```
✅ Found 0 users with push subscriptions
ℹ️  No users have subscribed to push notifications yet
```

#### 2. Test New Subscription
1. Visit `/web-push-example`
2. Click "Subscribe to Notifications"
3. Grant permission when prompted
4. Verify subscription is created successfully

#### 3. Test Notification Sending
1. Click "Send Test Notification"
2. Verify notification is received
3. Check browser console for success messages

### 📊 Monitoring

#### Check Subscription Status
```bash
# API endpoint to check database status
curl http://localhost:3000/api/notifications/db-status
```

#### Monitor Logs
Look for these success indicators:
```
✅ VAPID configuration is valid
✅ Web-push initialized successfully
✅ Notification sent successfully
```

### 🚨 Emergency Recovery

If notifications stop working completely:

#### 1. Check VAPID Configuration
```bash
node scripts/setup-vapid-keys.js
```

#### 2. Clear All Subscriptions
```bash
node scripts/fix-vapid-mismatch.js
```

#### 3. Restart Services
```bash
# Restart development server
npm run dev

# Or restart production server
npm start
```

#### 4. Test End-to-End
1. Visit `/notification-dashboard`
2. Subscribe to notifications
3. Send test notification
4. Verify receipt

### 🔧 Advanced Troubleshooting

#### Check VAPID Key Format
VAPID keys should be:
- **Public Key**: 65 characters, base64url encoded
- **Private Key**: 43 characters, base64url encoded
- **Subject**: Email address with `mailto:` prefix

#### Verify Environment Variables
```bash
# Check if keys are properly set
echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY
echo $VAPID_SUBJECT
```

#### Test VAPID Keys
```bash
# Generate new keys for testing
npx web-push generate-vapid-keys
```

### 📋 Checklist

When setting up notifications:
- [ ] VAPID keys generated and configured
- [ ] Environment variables set correctly
- [ ] Service worker registered
- [ ] User permissions granted
- [ ] Subscription created successfully
- [ ] Test notification sent and received

When troubleshooting:
- [ ] Check error logs for specific error codes
- [ ] Verify VAPID key consistency
- [ ] Test database connectivity
- [ ] Clear old subscriptions if needed
- [ ] Re-subscribe with correct keys
- [ ] Test notification sending

### 🆘 Getting Help

If you're still having issues:

1. **Check the logs** - Look for specific error messages
2. **Run test scripts** - Use the provided diagnostic tools
3. **Verify configuration** - Ensure all environment variables are set
4. **Test incrementally** - Start with basic subscription, then test sending
5. **Check browser support** - Ensure the browser supports push notifications

### 📚 Related Documentation

- [Web Push Implementation Guide](./web-push-implementation.md)
- [MongoDB Integration Guide](./mongodb-notification-integration.md)
- [Notification Setup Guide](./notifications-setup.md)
- [PWA Troubleshooting Guide](./pwa-install-testing.md)
