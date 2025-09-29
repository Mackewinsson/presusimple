#!/usr/bin/env node

/**
 * VAPID Keys Setup Script
 * Adds the generated VAPID keys to your .env.local file
 */

const fs = require('fs');
const path = require('path');

const vapidKeys = {
  publicKey: 'BPOOWJ3IQitxYosaoIxxYC7tj7RpQcQwOuRoQbLuU0JZq144LHLNHU4O5hlU95EMPvjtPOpqIe7sdY0I8BMTzbg',
  privateKey: '3Tya_bo-ltpUfVzlNBk0F9sz0syfmdE7eZw3Ae7RFEM',
  subject: 'mailto:mackewinsson@gmail.com'
};

function setupVapidKeys() {
  console.log('🔑 Setting up VAPID keys for web push notifications');
  console.log('==================================================\n');

  const envPath = path.join(process.cwd(), '.env.local');
  
  // Check if .env.local exists
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    console.log('Please create a .env.local file first by copying from env.example');
    return;
  }

  // Read current .env.local content
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if VAPID keys already exist
  const hasPublicKey = envContent.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY=');
  const hasPrivateKey = envContent.includes('VAPID_PRIVATE_KEY=');
  const hasSubject = envContent.includes('VAPID_SUBJECT=');

  console.log('Current VAPID configuration:');
  console.log(`   NEXT_PUBLIC_VAPID_PUBLIC_KEY: ${hasPublicKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   VAPID_PRIVATE_KEY: ${hasPrivateKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   VAPID_SUBJECT: ${hasSubject ? '✅ Set' : '❌ Missing'}\n`);

  // Add or update VAPID keys
  const vapidConfig = `
# Web Push (VAPID) Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=${vapidKeys.subject}

# Legacy VAPID keys (for backward compatibility)
WEBPUSH_PUBLIC_KEY=${vapidKeys.publicKey}
WEBPUSH_PRIVATE_KEY=${vapidKeys.privateKey}
WEBPUSH_CONTACT_EMAIL=${vapidKeys.subject}`;

  // Remove existing VAPID configuration if it exists
  envContent = envContent.replace(/# Web Push \(VAPID\) Configuration[\s\S]*?WEBPUSH_CONTACT_EMAIL=.*$/m, '');
  envContent = envContent.replace(/# Legacy VAPID keys[\s\S]*?VAPID_SUBJECT=.*$/m, '');
  
  // Add new VAPID configuration
  envContent += vapidConfig;

  // Write updated content
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ VAPID keys have been added to .env.local');
  console.log('\n📋 Configuration added:');
  console.log(`   Public Key: ${vapidKeys.publicKey.substring(0, 20)}...`);
  console.log(`   Private Key: ${vapidKeys.privateKey.substring(0, 10)}...`);
  console.log(`   Subject: ${vapidKeys.subject}`);
  
  console.log('\n🔄 Next steps:');
  console.log('   1. Restart your development server: npm run dev');
  console.log('   2. Visit /dev-tools to test notifications');
  console.log('   3. Run the test script: node scripts/test-mongo-notifications.js');
  
  console.log('\n⚠️  Security Note:');
  console.log('   - Keep your private key secure and never commit it to version control');
  console.log('   - The public key is safe to expose in client-side code');
  console.log('   - Use different keys for development and production');
}

setupVapidKeys();
