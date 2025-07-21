#!/usr/bin/env node

// Debug script to test authentication configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Authentication Debug Script');
console.log('==============================\n');

// Check environment variables
const envVars = {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
  MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

console.log('📋 Environment Variables:');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value === 'MISSING' ? '❌' : '✅';
  console.log(`${status} ${key}: ${value}`);
});

console.log('\n🔧 Configuration Checks:');

// Check if .env.production exists
const envProductionPath = path.join(process.cwd(), '.env.production');
if (fs.existsSync(envProductionPath)) {
  console.log('✅ .env.production file exists');
} else {
  console.log('❌ .env.production file missing');
}

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists');
} else {
  console.log('❌ .env.local file missing');
}

// Check NextAuth configuration
console.log('\n🎯 NextAuth Configuration:');
if (envVars.NEXTAUTH_URL) {
  console.log(`✅ NEXTAUTH_URL: ${envVars.NEXTAUTH_URL}`);
  
  // Validate URL format
  try {
    const url = new URL(envVars.NEXTAUTH_URL);
    console.log(`✅ URL format is valid`);
    console.log(`   Protocol: ${url.protocol}`);
    console.log(`   Hostname: ${url.hostname}`);
    console.log(`   Port: ${url.port || 'default'}`);
  } catch (error) {
    console.log(`❌ Invalid URL format: ${error.message}`);
  }
} else {
  console.log('❌ NEXTAUTH_URL is not set');
}

// Check Google OAuth configuration
console.log('\n🔐 Google OAuth Configuration:');
if (envVars.GOOGLE_CLIENT_ID === 'SET' && envVars.GOOGLE_CLIENT_SECRET === 'SET') {
  console.log('✅ Google OAuth credentials are set');
} else {
  console.log('❌ Google OAuth credentials are missing');
  if (envVars.GOOGLE_CLIENT_ID === 'MISSING') {
    console.log('   - GOOGLE_CLIENT_ID is missing');
  }
  if (envVars.GOOGLE_CLIENT_SECRET === 'MISSING') {
    console.log('   - GOOGLE_CLIENT_SECRET is missing');
  }
}

// Check database configuration
console.log('\n🗄️ Database Configuration:');
if (envVars.MONGODB_URI === 'SET') {
  console.log('✅ MONGODB_URI is set');
} else {
  console.log('❌ MONGODB_URI is missing');
}

// Production vs Development
console.log('\n🌍 Environment Mode:');
if (envVars.NODE_ENV === 'production') {
  console.log('✅ Running in production mode');
} else {
  console.log('ℹ️  Running in development mode');
}

// Recommendations
console.log('\n💡 Recommendations:');
if (envVars.NEXTAUTH_URL && !envVars.NEXTAUTH_URL.startsWith('https://')) {
  console.log('⚠️  NEXTAUTH_URL should use HTTPS in production');
}

if (envVars.NEXTAUTH_SECRET === 'MISSING') {
  console.log('⚠️  NEXTAUTH_SECRET is required for production');
}

if (envVars.GOOGLE_CLIENT_ID === 'MISSING' || envVars.GOOGLE_CLIENT_SECRET === 'MISSING') {
  console.log('⚠️  Google OAuth credentials are required');
}

console.log('\n🎯 Next Steps:');
console.log('1. Create .env.production with your production values');
console.log('2. Run: chmod +x scripts/simulate-production.sh');
console.log('3. Run: ./scripts/simulate-production.sh');
console.log('4. Test authentication flow');
console.log('5. Check Vercel environment variables if deploying'); 