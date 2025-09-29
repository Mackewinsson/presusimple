#!/usr/bin/env node

/**
 * MongoDB Notification Integration Test Script
 * Tests the MongoDB integration for web push notifications
 */

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

async function testMongoNotificationIntegration() {
  console.log('🧪 Testing MongoDB Notification Integration');
  console.log('============================================\n');

  // Test 1: MongoDB Connection
  console.log('1. Testing MongoDB Connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.db.databaseName}\n`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return;
  }

  // Test 2: Check existing users
  console.log('2. Checking existing users...');
  try {
    const userCount = await User.countDocuments();
    console.log(`✅ Found ${userCount} users in database`);
    
    if (userCount === 0) {
      console.log('ℹ️  No users found. You may need to sign up first.\n');
    } else {
      // Show sample users
      const sampleUsers = await User.find({}).select('email name notificationEnabled').limit(3);
      console.log('   Sample users:');
      sampleUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.name || 'No name'}) - Notifications: ${user.notificationEnabled ? 'Enabled' : 'Disabled'}`);
      });
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }

  // Test 3: Check users with push subscriptions
  console.log('3. Checking users with push subscriptions...');
  try {
    const usersWithSubscriptions = await User.find({
      pushSubscription: { $exists: true, $ne: null },
      notificationEnabled: true
    }).select('email name pushSubscription lastNotificationUpdate');

    console.log(`✅ Found ${usersWithSubscriptions.length} users with push subscriptions`);
    
    if (usersWithSubscriptions.length > 0) {
      console.log('   Users with active subscriptions:');
      usersWithSubscriptions.forEach(user => {
        const endpoint = user.pushSubscription?.endpoint || 'Unknown';
        const lastUpdate = user.lastNotificationUpdate ? user.lastNotificationUpdate.toISOString() : 'Never';
        console.log(`   - ${user.email}: ${endpoint.substring(0, 50)}... (Updated: ${lastUpdate})`);
      });
    } else {
      console.log('ℹ️  No users have subscribed to push notifications yet');
      console.log('   Visit /web-push-example to subscribe and test notifications');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error checking subscriptions:', error.message);
  }

  // Test 4: Test subscription creation (simulation)
  console.log('4. Testing subscription creation...');
  try {
    // Find a user without subscription to test with
    const userWithoutSubscription = await User.findOne({
      $or: [
        { pushSubscription: { $exists: false } },
        { pushSubscription: null }
      ]
    });

    if (userWithoutSubscription) {
      console.log(`   Testing with user: ${userWithoutSubscription.email}`);
      
      // Simulate a push subscription object
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key'
        }
      };

      // Update user with mock subscription
      await User.findByIdAndUpdate(userWithoutSubscription._id, {
        pushSubscription: mockSubscription,
        notificationEnabled: true,
        lastNotificationUpdate: new Date()
      });

      console.log('✅ Successfully created test subscription');
      
      // Clean up - remove the test subscription
      await User.findByIdAndUpdate(userWithoutSubscription._id, {
        $unset: { pushSubscription: 1 },
        notificationEnabled: false
      });
      
      console.log('✅ Test subscription cleaned up');
    } else {
      console.log('ℹ️  All users already have subscriptions - skipping test');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error testing subscription creation:', error.message);
  }

  // Test 5: Database indexes
  console.log('5. Checking database indexes...');
  try {
    const indexes = await User.collection.getIndexes();
    console.log('✅ Database indexes:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`   - ${indexName}: ${JSON.stringify(indexes[indexName].key)}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error checking indexes:', error.message);
  }

  // Test 6: Environment variables
  console.log('6. Checking environment variables...');
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
    'VAPID_SUBJECT'
  ];

  let envVarsOk = true;
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('KEY') ? 'Set' : value}`);
    } else {
      console.log(`❌ ${varName}: Not set`);
      envVarsOk = false;
    }
  });

  if (!envVarsOk) {
    console.log('\n⚠️  Some environment variables are missing. Please check your .env.local file.');
  } else {
    console.log('\n✅ All required environment variables are set');
  }

  // Cleanup
  await mongoose.disconnect();
  console.log('\n✅ MongoDB connection closed');
  console.log('\n📋 Next Steps:');
  console.log('   1. Visit /web-push-example to test the full implementation');
  console.log('   2. Visit /notification-test for detailed testing');
  console.log('   3. Use the API endpoints to manage subscriptions');
  console.log('   4. Check browser DevTools for service worker status');
}

// Run the test
testMongoNotificationIntegration().catch(console.error);
