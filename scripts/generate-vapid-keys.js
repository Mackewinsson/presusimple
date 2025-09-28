#!/usr/bin/env node

/**
 * Generate VAPID keys for push notifications
 * Run this script to generate VAPID keys for your PWA
 */

const webpush = require('web-push');

console.log('🔑 Generating VAPID keys for push notifications...\n');

try {
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('✅ VAPID keys generated successfully!\n');
  console.log('📋 Add these to your .env file:\n');
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
  console.log('VAPID_SUBJECT=mailto:your-email@example.com\n');
  
  console.log('⚠️  Important notes:');
  console.log('- Replace "your-email@example.com" with your actual email');
  console.log('- Keep the private key secure and never commit it to version control');
  console.log('- The public key can be safely exposed in your client-side code');
  console.log('- Restart your development server after adding these environment variables\n');
  
} catch (error) {
  console.error('❌ Error generating VAPID keys:', error.message);
  console.log('\n💡 Make sure you have web-push installed:');
  console.log('npm install web-push');
  process.exit(1);
}
