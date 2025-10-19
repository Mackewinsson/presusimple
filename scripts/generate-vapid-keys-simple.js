#!/usr/bin/env node

const webpush = require('web-push');

console.log('🔑 Generating VAPID keys for Presusimple...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Add these to your .env.local file:\n');
console.log(`WEBPUSH_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`WEBPUSH_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`WEBPUSH_CONTACT_EMAIL=mailto:your-email@example.com`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`ENABLE_PWA_DEV=false\n`);

console.log('📝 Remember to:');
console.log('1. Replace "your-email@example.com" with your actual email');
console.log('2. Add these to your Vercel environment variables for production');
console.log('3. Keep the private key secure and never commit it to version control');
