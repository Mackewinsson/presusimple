#!/usr/bin/env node

/**
 * Test Notification Delivery Script
 * Sends a test notification and provides debugging steps
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

async function testNotificationDelivery() {
  console.log('🧪 Testing Notification Delivery');
  console.log('=================================\n');

  // Connect to MongoDB
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

  // Setup VAPID
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    console.log('✅ VAPID configured successfully\n');
  } catch (error) {
    console.error('❌ VAPID setup failed:', error.message);
    return;
  }

  // Find user with subscription
  try {
    const user = await User.findOne({
      pushSubscription: { $exists: true, $ne: null },
      notificationEnabled: true
    });

    if (!user) {
      console.log('❌ No user with active subscription found');
      console.log('   Please subscribe to notifications first at /dev-tools\n');
      return;
    }

    console.log(`✅ Found user: ${user.email}`);
    console.log(`   Subscription endpoint: ${user.pushSubscription.endpoint.substring(0, 50)}...\n`);

    // Send test notification
    const basePayload = {
      title: '🔔 Test Notification',
      body: 'If you can see this, notifications are working!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      url: '/dev-tools',
      data: {
        type: 'delivery-test',
        timestamp: Date.now(),
        source: 'test-script'
      },
      actions: [
        {
          action: 'view',
          title: 'View Debug Page'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: true,
      tag: 'test-notification'
    };

    const testPayload = buildDeclarativePayload(basePayload);

    console.log('📤 Sending test notification...');
    console.log('   Title:', testPayload.title);
    console.log('   Body:', testPayload.body);
    console.log('   URL:', testPayload.url);
    console.log('');

    try {
      await webpush.sendNotification(
        user.pushSubscription,
        JSON.stringify(testPayload)
      );
      
      console.log('✅ Notification sent successfully!');
      console.log('');
      console.log('🔍 What to check now:');
      console.log('   1. Look for the notification in your browser/system');
      console.log('   2. Check browser DevTools → Application → Service Workers');
      console.log('   3. Look for /sw.js registered and active');
      console.log('   4. Check service worker console for logs');
      console.log('   5. Verify notification permission is granted');
      console.log('');
      console.log('📱 If you don\'t see the notification:');
      console.log('   - Check if notifications are blocked in browser settings');
      console.log('   - Try refreshing the page and re-subscribing');
      console.log('   - Test in a different browser');
      console.log('   - Visit /dev-tools for detailed diagnostics');
      console.log('');
      
    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
      console.error('   Status Code:', error.statusCode);
      console.error('   Body:', error.body);
      
      if (error.statusCode === 410) {
        console.log('\n💡 Subscription expired - user needs to re-subscribe');
      } else if (error.statusCode === 403) {
        console.log('\n💡 VAPID mismatch - run: node scripts/fix-vapid-mismatch.js');
      } else if (error.statusCode === 404) {
        console.log('\n💡 Invalid subscription endpoint - user needs to re-subscribe');
      }
    }

  } catch (error) {
    console.error('❌ Error finding user:', error.message);
  }

  await mongoose.disconnect();
  console.log('✅ Test completed');
}

// Run the test
testNotificationDelivery().catch(console.error);
