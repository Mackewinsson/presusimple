#!/usr/bin/env node

/**
 * Script to fix user subscription status in database
 * This script will:
 * 1. Check the current status of mackewinsson@gmail.com
 * 2. Fix any incorrect trial data for paid users
 * 3. Ensure proper subscription status
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// User Schema (simplified version matching your model)
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
  currency: { type: String, default: "USD" }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fixUserSubscription() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find your user
    const userEmail = 'mackewinsson@gmail.com';
    console.log(`🔍 Checking user: ${userEmail}`);
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📊 Current user status:');
    console.log('Email:', user.email);
    console.log('isPaid:', user.isPaid);
    console.log('plan:', user.plan);
    console.log('trialStart:', user.trialStart);
    console.log('trialEnd:', user.trialEnd);
    console.log('subscriptionType:', user.subscriptionType);

    // Check if user is marked as paid but has trial data
    if (user.isPaid && user.plan === 'pro') {
      console.log('\n🔧 User is marked as paid with pro plan');
      
      // Check if there's problematic trial data
      if (user.trialStart || user.trialEnd) {
        console.log('⚠️  Found trial data for paid user - this needs to be fixed');
        
        const updatedUser = await User.findOneAndUpdate(
          { email: userEmail },
          {
            isPaid: true,
            plan: "pro",
            trialStart: null,  // ✅ Clear trial start for paid users
            trialEnd: null,    // ✅ Clear trial end for paid users
            subscriptionType: "manual_paid",
          },
          { new: true }
        );

        console.log('✅ User subscription data fixed!');
        console.log('\n📊 Updated status:');
        console.log('isPaid:', updatedUser.isPaid);
        console.log('plan:', updatedUser.plan);
        console.log('trialStart:', updatedUser.trialStart);
        console.log('trialEnd:', updatedUser.trialEnd);
        console.log('subscriptionType:', updatedUser.subscriptionType);
      } else {
        console.log('✅ User subscription data is already correct');
      }
    } else if (user.isPaid && user.plan !== 'pro') {
      console.log('\n⚠️  User is marked as paid but plan is not pro - fixing...');
      
      const updatedUser = await User.findOneAndUpdate(
        { email: userEmail },
        {
          isPaid: true,
          plan: "pro",
          trialStart: null,
          trialEnd: null,
          subscriptionType: "manual_paid",
        },
        { new: true }
      );

      console.log('✅ User plan updated to pro!');
    } else {
      console.log('\nℹ️  User is not marked as paid');
      console.log('Current status:', {
        isPaid: user.isPaid,
        plan: user.plan,
        hasTrialData: !!(user.trialStart || user.trialEnd)
      });
      
      // Check if user has pro plan but is marked as trial - this might be a mistake
      if (user.plan === 'pro' && user.subscriptionType === 'manual_trial') {
        console.log('\n⚠️  User has pro plan but is marked as trial - this might be incorrect');
        console.log('Would you like to convert this to a paid subscription? (This will clear trial data)');
        
        // For now, let's fix it automatically since this seems to be the issue
        console.log('🔧 Converting trial to paid subscription...');
        
        const updatedUser = await User.findOneAndUpdate(
          { email: userEmail },
          {
            isPaid: true,
            plan: "pro",
            trialStart: null,  // ✅ Clear trial start for paid users
            trialEnd: null,    // ✅ Clear trial end for paid users
            subscriptionType: "manual_paid",
          },
          { new: true }
        );

        console.log('✅ User converted to paid subscription!');
        console.log('\n📊 Updated status:');
        console.log('isPaid:', updatedUser.isPaid);
        console.log('plan:', updatedUser.plan);
        console.log('trialStart:', updatedUser.trialStart);
        console.log('trialEnd:', updatedUser.trialEnd);
        console.log('subscriptionType:', updatedUser.subscriptionType);
      }
    }

    // Test the subscription status logic
    console.log('\n🧪 Testing subscription status logic:');
    const testUser = await User.findOne({ email: userEmail });
    
    // Simulate the getSubscriptionStatus function
    function getSubscriptionStatus(subscription) {
      const { isPaid = false, trialEnd } = subscription;
      if (isPaid) return "paid";
      if (!trialEnd) return "none";
      
      const now = new Date();
      const trialEndDate = new Date(trialEnd);
      const diffTime = trialEndDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) return "expired";
      if (diffDays > 0) return "trial";
      return "none";
    }
    
    const subscriptionStatus = getSubscriptionStatus({
      isPaid: testUser.isPaid,
      trialEnd: testUser.trialEnd
    });
    
    console.log('Subscription status:', subscriptionStatus);
    
    if (subscriptionStatus === "paid") {
      console.log('✅ Subscription status is correct - should not show trial messages');
    } else {
      console.log('❌ Subscription status is incorrect - may show trial messages');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
console.log('🚀 Starting user subscription fix...\n');
fixUserSubscription();
