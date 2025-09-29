#!/usr/bin/env node

/**
 * Debug Notifications Script
 * Comprehensive debugging for notification issues
 */

const webpush = require('web-push');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define User schema inline for testing
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  isPaid: { type: Boolean, default: false },
  trialStart: { type: Date },
  trialEnd: { type: Date },
  subscriptionType: { type: String },
  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free"
  },
  currency: { type: String, default: "USD" },
  // Notification fields
  pushSubscription: { type: mongoose.Schema.Types.Mixed },
  notificationEnabled: { type: Boolean, default: false },
  lastNotificationUpdate: { type: Date }
});

const User = mongoose.model('User', UserSchema);

function buildDeclarativePayload(basePayload) {
  const defaultActionUrl = basePayload.url || '/';
  const actions = (basePayload.actions || []).map(action => ({
    ...action,
    url: action.url || defaultActionUrl,
  }));
  const actionUrlMap = actions.reduce((map, action) => {
    if (action.action) {
      map[action.action] = action.url;
    }
    return map;
  }, {});

  return {
    ...basePayload,
    actions,
    default_action_url: defaultActionUrl,
    options: {
      body: basePayload.body,
      icon: basePayload.icon,
      badge: basePayload.badge,
      data: {
        ...(basePayload.data || {}),
        url: defaultActionUrl,
        defaultActionUrl,
        actionUrls: actionUrlMap,
      },
      actions,
      requireInteraction: basePayload.requireInteraction,
      silent: basePayload.silent,
      tag: basePayload.tag,
      renotify: basePayload.renotify,
      vibrate: basePayload.vibrate,
    },
    mutable: true,
    app_badge: basePayload.appBadge,
  };
}

async function debugNotifications() {
  console.log('🔍 Debugging Notification Issues');
  console.log('==================================\n');

  // Test 1: MongoDB Connection
  console.log('1. Testing MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return;
  }

  // Test 2: VAPID Configuration
  console.log('2. Testing VAPID Configuration...');
  const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@example.com'
  };

  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.error('❌ VAPID keys not configured');
    return;
  }

  try {
    webpush.setVapidDetails(
      vapidKeys.subject,
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
    console.log('✅ VAPID configuration valid');
    console.log(`   Public Key: ${vapidKeys.publicKey.substring(0, 20)}...`);
    console.log(`   Subject: ${vapidKeys.subject}\n`);
  } catch (error) {
    console.error('❌ VAPID setup failed:', error.message);
    return;
  }

  // Test 3: Find user with subscription
  console.log('3. Finding user with subscription...');
  try {
    const userWithSubscription = await User.findOne({
      pushSubscription: { $exists: true, $ne: null },
      notificationEnabled: true
    });

    if (!userWithSubscription) {
      console.log('❌ No user with active subscription found');
      console.log('   Please subscribe to notifications first at /web-push-example\n');
      return;
    }

    console.log(`✅ Found user: ${userWithSubscription.email}`);
    console.log(`   Name: ${userWithSubscription.name || 'No name'}`);
    console.log(`   Notification Enabled: ${userWithSubscription.notificationEnabled}`);
    console.log(`   Last Update: ${userWithSubscription.lastNotificationUpdate}`);
    console.log(`   Endpoint: ${userWithSubscription.pushSubscription.endpoint.substring(0, 50)}...\n`);

    // Test 4: Validate subscription
    console.log('4. Validating subscription...');
    const subscription = userWithSubscription.pushSubscription;
    
    if (!subscription.endpoint) {
      console.error('❌ Subscription missing endpoint');
      return;
    }
    
    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      console.error('❌ Subscription missing keys');
      return;
    }
    
    console.log('✅ Subscription structure is valid');
    console.log(`   Endpoint: ${subscription.endpoint}`);
    console.log(`   P256DH Key: ${subscription.keys.p256dh.substring(0, 20)}...`);
    console.log(`   Auth Key: ${subscription.keys.auth.substring(0, 10)}...\n`);

    // Test 5: Send test notification
    console.log('5. Sending test notification...');
    const basePayload = {
      title: 'Debug Test Notification',
      body: 'This is a debug test notification to verify the system is working',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      url: '/notification-dashboard',
      data: {
        type: 'debug-test',
        timestamp: Date.now(),
        source: 'debug-script'
      },
      actions: [
        {
          action: 'view',
          title: 'View Dashboard'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    const testPayload = buildDeclarativePayload(basePayload);

    try {
      console.log('📤 Sending notification...');
      console.log('   Payload:', JSON.stringify(testPayload, null, 2));
      
      await webpush.sendNotification(
        subscription,
        JSON.stringify(testPayload)
      );
      
      console.log('✅ Notification sent successfully!');
      console.log('   Check your browser for the notification\n');
      
    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
      console.error('   Status Code:', error.statusCode);
      console.error('   Headers:', error.headers);
      console.error('   Body:', error.body);
      
      if (error.statusCode === 410) {
        console.log('\n💡 This usually means the subscription has expired');
        console.log('   The user needs to re-subscribe to notifications');
      } else if (error.statusCode === 403) {
        console.log('\n💡 This usually means VAPID credentials mismatch');
        console.log('   Run: node scripts/fix-vapid-mismatch.js');
      } else if (error.statusCode === 404) {
        console.log('\n💡 This usually means the subscription endpoint is invalid');
        console.log('   The user needs to re-subscribe to notifications');
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error finding user:', error.message);
  }

  // Test 6: Browser requirements check
  console.log('6. Browser Requirements Check...');
  console.log('   For notifications to work, ensure:');
  console.log('   ✅ You are using HTTPS or localhost');
  console.log('   ✅ Browser supports push notifications');
  console.log('   ✅ You have granted notification permission');
  console.log('   ✅ Service worker is registered and active');
  console.log('   ✅ PWA is enabled (ENABLE_PWA_DEV=true in development)');
  console.log('');

  // Test 7: Troubleshooting steps
  console.log('7. Troubleshooting Steps...');
  console.log('   If you still don\'t receive notifications:');
  console.log('   1. Check browser DevTools → Application → Service Workers');
  console.log('   2. Look for /sw.js registered and active');
  console.log('   3. Check console for any errors');
  console.log('   4. Verify notification permission is granted');
  console.log('   5. Try refreshing the page and re-subscribing');
  console.log('   6. Test in a different browser');
  console.log('   7. Check if notifications are blocked by browser settings');
  console.log('');

  // Cleanup
  await mongoose.disconnect();
  console.log('✅ MongoDB connection closed');
  console.log('\n📋 Next Steps:');
  console.log('   1. Check your browser for the test notification');
  console.log('   2. If not received, check browser DevTools console');
  console.log('   3. Visit /notification-dashboard to monitor status');
  console.log('   4. Try re-subscribing if needed');
}

// Run the debug
debugNotifications().catch(console.error);
