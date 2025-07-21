#!/usr/bin/env node

// Debug script to test authentication flow
const https = require('https');
const http = require('http');

console.log('🔍 Authentication Flow Debug Script');
console.log('==================================\n');

// Test URLs
const testUrls = [
  'http://localhost:3000/auth/signin',
  'http://localhost:3000/app',
  'http://localhost:3000/api/auth/providers',
  'http://localhost:3000/api/auth/session'
];

async function testUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500) // First 500 chars
        });
      });
    });
    
    req.on('error', (err) => {
      reject({ url, error: err.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject({ url, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing authentication endpoints...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const result = await testUrl(url);
      
      if (result.status === 200) {
        console.log(`✅ Status: ${result.status}`);
        if (result.data.includes('google')) {
          console.log('   📋 Contains Google provider info');
        }
        if (result.data.includes('session')) {
          console.log('   🔐 Contains session info');
        }
      } else if (result.status === 302 || result.status === 301) {
        console.log(`🔄 Redirect: ${result.status} → ${result.headers.location}`);
      } else {
        console.log(`❌ Status: ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.error || error.message}`);
    }
    console.log('');
  }
  
  console.log('🎯 Authentication Flow Analysis:');
  console.log('1. Check if /api/auth/providers returns Google provider');
  console.log('2. Check if /api/auth/session shows authentication state');
  console.log('3. Check redirects from /auth/signin and /app');
  console.log('');
  console.log('🔧 Common Issues:');
  console.log('- Google OAuth not configured for production domain');
  console.log('- NEXTAUTH_URL mismatch');
  console.log('- Middleware redirect conflicts');
  console.log('- Session not persisting');
}

runTests().catch(console.error); 