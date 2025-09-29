#!/usr/bin/env node

/**
 * Web Push Notification Test Script
 * Tests the web push notification implementation following next-pwa example
 */

const webpush = require('web-push');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models - using dynamic import for TypeScript compatibility
let User;

// VAPID configuration
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@example.com'
};

async function testWebPushImplementation() {
  console.log('🧪 Testing Web Push Implementation');
  console.log('=====================================\n');

  // Load User model dynamically
  try {
    const UserModule = await import('../models/User.js');
    User = UserModule.default;
  } catch (error) {
    console.error('❌ Failed to load User model:', error.message);
    return;
  }

  // Test 1: VAPID Configuration
  console.log('1. Testing VAPID Configuration...');
  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.error('❌ VAPID keys not configured');
    console.log('Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your .env.local file');
    return;
  }
  console.log('✅ VAPID keys configured');
  console.log(`   Public Key: ${vapidKeys.publicKey.substring(0, 20)}...`);
  console.log(`   Subject: ${vapidKeys.subject}\n`);

  // Test 2: Web Push Setup
  console.log('2. Testing Web Push Setup...');
  try {
    webpush.setVapidDetails(
      vapidKeys.subject,
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
    console.log('✅ Web push configured successfully\n');
  } catch (error) {
    console.error('❌ Web push setup failed:', error.message);
    return;
  }

  // Test 3: Database Connection
  console.log('3. Testing Database Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }

  // Test 4: Find Users with Push Subscriptions
  console.log('4. Testing User Subscriptions...');
  try {
    const usersWithSubscriptions = await User.find({
      pushSubscription: { $exists: true, $ne: null },
      notificationEnabled: true
    });

    console.log(`✅ Found ${usersWithSubscriptions.length} users with push subscriptions`);
    
    if (usersWithSubscriptions.length === 0) {
      console.log('ℹ️  No users have subscribed to push notifications yet');
      console.log('   Visit /web-push-example to subscribe and test notifications\n');
      return;
    }

    // Test 5: Send Test Notification
    console.log('5. Testing Notification Sending...');
    const testUser = usersWithSubscriptions[0];
    console.log(`   Testing with user: ${testUser.email}`);

    const testPayload = {
      title: 'Web Push Test',
      body: 'This is a test notification from the web push implementation test script',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      url: '/web-push-example',
      data: {
        type: 'test',
        timestamp: Date.now(),
        source: 'test-script'
      },
      actions: [
        {
          action: 'view',
          title: 'View App'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    try {
      await webpush.sendNotification(
        testUser.pushSubscription,
        JSON.stringify(testPayload)
      );
      console.log('✅ Test notification sent successfully!');
      console.log('   Check your browser for the notification\n');
    } catch (error) {
      console.error('❌ Failed to send test notification:', error.message);
      if (error.statusCode === 410) {
        console.log('   This usually means the subscription has expired');
        console.log('   The user needs to re-subscribe to notifications\n');
      }
    }

  } catch (error) {
    console.error('❌ Error finding users:', error.message);
  }

  // Test 6: Service Worker Status
  console.log('6. Service Worker Information...');
  console.log('   Service Worker file: /sw.js');
  console.log('   Custom worker: /worker/index.js');
  console.log('   PWA enabled: ' + (process.env.NODE_ENV === 'production' || process.env.ENABLE_PWA_DEV === 'true' ? 'Yes' : 'No (development mode)'));
  console.log('   To enable in development: ENABLE_PWA_DEV=true npm run dev\n');

  // Cleanup
  await mongoose.disconnect();
  console.log('✅ Test completed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Visit /web-push-example to test the full implementation');
  console.log('   2. Visit /notification-test for detailed testing');
  console.log('   3. Check browser DevTools → Application → Service Workers');
  console.log('   4. Monitor console logs for detailed debugging information');
}

// Run the test
testWebPushImplementation().catch(console.error);
