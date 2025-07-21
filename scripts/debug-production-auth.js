#!/usr/bin/env node

// Debug script for production authentication issues

const https = require('https');

console.log('🔍 Production Authentication Debug');
console.log('==================================\n');

const baseUrl = 'https://www.simple-budget.pro';

async function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}${path}`;
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 1000)
        });
      });
    });
    
    req.on('error', (err) => reject({ url, error: err.message }));
    req.setTimeout(10000, () => {
      req.destroy();
      reject({ url, error: 'Timeout' });
    });
  });
}

async function debugProduction() {
  console.log('🧪 Testing production endpoints...\n');
  
  const tests = [
    { path: '/api/auth/providers', name: 'Auth Providers' },
    { path: '/api/auth/session', name: 'Session' },
    { path: '/api/auth/csrf', name: 'CSRF Token' },
    { path: '/app', name: 'Protected Route' },
    { path: '/auth/signin', name: 'Sign In Page' }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const result = await testEndpoint(test.path);
      
      if (result.status === 200) {
        console.log(`✅ Status: ${result.status}`);
        
        if (test.path === '/api/auth/providers') {
          try {
            const providers = JSON.parse(result.data);
            if (providers.google) {
              console.log('   📋 Google provider configured');
              console.log(`   🔗 Callback URL: ${providers.google.callbackUrl}`);
            }
          } catch (e) {
            console.log('   ❌ Invalid JSON response');
          }
        }
        
        if (test.path === '/api/auth/session') {
          try {
            const session = JSON.parse(result.data);
            if (Object.keys(session).length === 0) {
              console.log('   ❌ Session is empty (not authenticated)');
            } else {
              console.log('   ✅ Session contains user data');
            }
          } catch (e) {
            console.log('   ❌ Invalid JSON response');
          }
        }
        
      } else if (result.status === 302 || result.status === 307) {
        console.log(`🔄 Redirect: ${result.status} → ${result.headers.location}`);
      } else {
        console.log(`❌ Status: ${result.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.error || error.message}`);
    }
    console.log('');
  }
  
  console.log('🎯 Analysis:');
  console.log('1. If session is empty → NEXTAUTH_URL or NEXTAUTH_SECRET issue');
  console.log('2. If /app redirects → Middleware thinks user is not authenticated');
  console.log('3. If Google callback fails → OAuth configuration issue');
  console.log('');
  console.log('🔧 Most Likely Issues:');
  console.log('- NEXTAUTH_URL in Vercel doesn\'t match actual domain');
  console.log('- NEXTAUTH_SECRET not set in Vercel');
  console.log('- Google OAuth redirect URI mismatch');
  console.log('- Cookie domain issues in production');
  console.log('');
  console.log('💡 Quick Fixes to Try:');
  console.log('1. Check Vercel environment variables');
  console.log('2. Verify Google OAuth configuration');
  console.log('3. Test with different browser/incognito');
  console.log('4. Check Vercel function logs');
}

debugProduction().catch(console.error); 