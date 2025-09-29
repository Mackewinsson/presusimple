#!/usr/bin/env node

/**
 * Notification System Diagnostic Script
 * Tests the notification system for mackewinsson@gmail.com
 */

const { MongoClient } = require('mongodb');
const webpush = require('web-push');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

async function testNotificationSystem() {
  console.log('🔍 Starting notification system diagnostic...\n');

  // 1. Check VAPID configuration
  console.log('1️⃣ Checking VAPID configuration...');
  console.log('   VAPID Public Key:', VAPID_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
  console.log('   VAPID Private Key:', VAPID_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
  console.log('   VAPID Subject:', VAPID_SUBJECT || '❌ Missing');
  
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    console.log('❌ VAPID configuration is incomplete!\n');
    return;
  }
  console.log('✅ VAPID configuration looks good\n');

  // 2. Initialize web-push
  console.log('2️⃣ Initializing web-push...');
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    console.log('✅ Web-push initialized successfully\n');
  } catch (error) {
    console.log('❌ Failed to initialize web-push:', error.message, '\n');
    return;
  }

  // 3. Connect to database and check user
  console.log('3️⃣ Checking user subscription in database...');
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const users = db.collection('users');
    
    const user = await users.findOne({ email: 'mackewinsson@gmail.com' });
    
    if (!user) {
      console.log('❌ User mackewinsson@gmail.com not found in database\n');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('   Notification Enabled:', user.notificationEnabled ? '✅ Yes' : '❌ No');
    console.log('   Push Subscription:', user.pushSubscription ? '✅ Exists' : '❌ Missing');
    console.log('   Last Notification Update:', user.lastNotificationUpdate || 'Never');
    
    if (!user.pushSubscription) {
      console.log('❌ User has no push subscription!\n');
      return;
    }
    
    if (!user.notificationEnabled) {
      console.log('❌ User has notifications disabled!\n');
      return;
    }
    
    console.log('✅ User subscription looks good\n');

    // 4. Test sending notification
    console.log('4️⃣ Testing notification sending...');
    
    const testPayload = {
      title: 'Test Notification',
      body: 'This is a test notification from the diagnostic script',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      url: '/budget',
      data: {
        type: 'test',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'view',
          title: 'View App',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    console.log('📤 Sending test notification...');
    console.log('   Payload:', JSON.stringify(testPayload, null, 2));
    
    try {
      await webpush.sendNotification(user.pushSubscription, JSON.stringify(testPayload));
      console.log('✅ Test notification sent successfully!\n');
    } catch (error) {
      console.log('❌ Failed to send notification:', error.message);
      console.log('   Status Code:', error.statusCode);
      console.log('   Headers:', error.headers);
      
      if (error.statusCode === 410) {
        console.log('   💡 This means the subscription has expired and needs to be renewed\n');
      } else if (error.statusCode === 404) {
        console.log('   💡 This means the subscription endpoint is no longer valid\n');
      } else if (error.statusCode === 413) {
        console.log('   💡 This means the payload is too large\n');
      }
    }

  } catch (error) {
    console.log('❌ Database error:', error.message, '\n');
  } finally {
    if (client) {
      await client.close();
    }
  }

  // 5. Recommendations
  console.log('5️⃣ Recommendations:');
  console.log('   • Check browser console for service worker errors');
  console.log('   • Verify service worker is registered and active');
  console.log('   • Check if notifications are enabled in browser settings');
  console.log('   • Try re-subscribing to notifications');
  console.log('   • Check if the app is running on HTTPS or localhost');
  console.log('   • Verify push notification permission is granted\n');

  console.log('🏁 Diagnostic complete!');
}

// Run the diagnostic
testNotificationSystem().catch(console.error);
