#!/usr/bin/env node

/**
 * Fix VAPID Mismatch Script
 * Clears old subscriptions that were created with different VAPID keys
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

async function fixVapidMismatch() {
  console.log('🔧 Fixing VAPID Credentials Mismatch');
  console.log('=====================================\n');

  // Test 1: MongoDB Connection
  console.log('1. Connecting to MongoDB...');
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

  // Test 2: Check current VAPID configuration
  console.log('2. Checking current VAPID configuration...');
  const currentVapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const currentVapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const currentVapidSubject = process.env.VAPID_SUBJECT;

  console.log(`   Public Key: ${currentVapidPublicKey ? currentVapidPublicKey.substring(0, 20) + '...' : 'Not set'}`);
  console.log(`   Private Key: ${currentVapidPrivateKey ? currentVapidPrivateKey.substring(0, 10) + '...' : 'Not set'}`);
  console.log(`   Subject: ${currentVapidSubject || 'Not set'}\n`);

  if (!currentVapidPublicKey || !currentVapidPrivateKey) {
    console.error('❌ VAPID keys are not properly configured');
    console.log('Please run: node scripts/setup-vapid-keys.js');
    return;
  }

  // Test 3: Find users with push subscriptions
  console.log('3. Finding users with push subscriptions...');
  try {
    const usersWithSubscriptions = await User.find({
      pushSubscription: { $exists: true, $ne: null },
      notificationEnabled: true
    });

    console.log(`✅ Found ${usersWithSubscriptions.length} users with push subscriptions\n`);

    if (usersWithSubscriptions.length === 0) {
      console.log('ℹ️  No users with subscriptions found. Nothing to fix.\n');
      await mongoose.disconnect();
      return;
    }

    // Test 4: Clear old subscriptions
    console.log('4. Clearing old subscriptions...');
    let clearedCount = 0;

    for (const user of usersWithSubscriptions) {
      console.log(`   Clearing subscription for: ${user.email}`);
      
      try {
        await User.findByIdAndUpdate(user._id, {
          $unset: { pushSubscription: 1 },
          notificationEnabled: false,
          lastNotificationUpdate: new Date()
        });
        
        clearedCount++;
        console.log(`   ✅ Cleared subscription for ${user.email}`);
      } catch (error) {
        console.error(`   ❌ Failed to clear subscription for ${user.email}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully cleared ${clearedCount} subscriptions\n`);

    // Test 5: Verify cleanup
    console.log('5. Verifying cleanup...');
    const remainingSubscriptions = await User.countDocuments({
      pushSubscription: { $exists: true, $ne: null }
    });

    console.log(`✅ Remaining subscriptions: ${remainingSubscriptions}`);
    
    if (remainingSubscriptions === 0) {
      console.log('✅ All old subscriptions have been cleared successfully\n');
    } else {
      console.log('⚠️  Some subscriptions may still exist\n');
    }

  } catch (error) {
    console.error('❌ Error processing subscriptions:', error.message);
  }

  // Cleanup
  await mongoose.disconnect();
  console.log('✅ MongoDB connection closed');
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Restart your development server: npm run dev');
  console.log('   2. Visit /dev-tools to test notifications');
  console.log('   3. Re-subscribe to notifications with the correct VAPID keys');
  console.log('   4. Test notification sending');
  
  console.log('\n🔍 What happened:');
  console.log('   - The user had a subscription created with old VAPID keys');
  console.log('   - We generated new VAPID keys, causing a mismatch');
  console.log('   - Clearing the old subscription allows re-subscription with correct keys');
  console.log('   - This is a one-time fix - future subscriptions will work correctly');
}

// Run the fix
fixVapidMismatch().catch(console.error);
