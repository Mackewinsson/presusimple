#!/usr/bin/env node

/**
 * PWA Test Script
 * Tests PWA functionality and provides debugging information
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 PWA Test Script\n');

// Check if we're in the right directory
if (!fs.existsSync('next.config.js')) {
  console.log('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Check next.config.js for PWA configuration
console.log('1️⃣ Checking PWA configuration...');
const nextConfig = fs.readFileSync('next.config.js', 'utf8');

if (nextConfig.includes('disable: process.env.NODE_ENV === \'development\'')) {
  console.log('⚠️  PWA is disabled in development mode');
  console.log('   To enable PWA in development, run:');
  console.log('   ENABLE_PWA_DEV=true npm run dev\n');
} else if (nextConfig.includes('disable: false')) {
  console.log('✅ PWA is enabled in development\n');
} else {
  console.log('✅ PWA configuration looks good\n');
}

// Check manifest.json
console.log('2️⃣ Checking manifest.json...');
if (fs.existsSync('public/manifest.json')) {
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  console.log('✅ Manifest exists');
  console.log(`   Name: ${manifest.name}`);
  console.log(`   Start URL: ${manifest.start_url}`);
  console.log(`   Display: ${manifest.display}`);
  console.log(`   Icons: ${manifest.icons?.length || 0} icons\n`);
} else {
  console.log('❌ manifest.json not found\n');
}

// Check service worker files
console.log('3️⃣ Checking service worker files...');
const swFiles = [
  'public/sw.js',
  'worker/index.js',
  'public/register-sw.js'
];

swFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});
console.log('');

// Check if development server is running
console.log('4️⃣ Checking development server...');
try {
  const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3003', { encoding: 'utf8' });
  if (result.trim() === '200') {
    console.log('✅ Development server is running on port 3003');
  } else {
    console.log('⚠️  Development server might not be running or accessible');
  }
} catch (error) {
  console.log('❌ Development server is not running');
  console.log('   Start it with: npm run dev');
}
console.log('');

// Instructions
console.log('5️⃣ Testing Instructions:');
console.log('   1. Make sure development server is running: npm run dev');
console.log('   2. Open browser to: http://localhost:3003');
console.log('   3. Visit: http://localhost:3003/pwa-debug');
console.log('   4. Check the debug information');
console.log('   5. Try the "Force Show Prompt" button');
console.log('   6. If PWA is disabled, run: ENABLE_PWA_DEV=true npm run dev');
console.log('');

console.log('🏁 PWA test complete!');
