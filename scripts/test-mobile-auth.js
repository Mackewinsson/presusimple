#!/usr/bin/env node

/**
 * Test script for mobile authentication flow
 * 
 * This script simulates the mobile authentication process:
 * 1. Opens the NextAuth signin URL with mobile callback
 * 2. After manual authentication, extracts the code from the redirect
 * 3. Exchanges the code for a JWT token
 * 4. Tests the JWT with a protected endpoint
 * 
 * Usage: node scripts/test-mobile-auth.js
 */

const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const readline = require('readline');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const MOBILE_SCHEME = 'myapp';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testMobileAuth() {
  console.log('🧪 Testing Mobile Authentication Flow\n');
  
  // Step 1: Build the signin URL
  const finishUrl = `${API_BASE_URL}/api/mobile/finish?redirect=${MOBILE_SCHEME}://auth/callback`;
  const signinUrl = `${API_BASE_URL}/api/auth/signin?callbackUrl=${encodeURIComponent(finishUrl)}`;
  
  console.log('📱 Step 1: Open this URL in your browser to sign in:');
  console.log(signinUrl);
  console.log('\nAfter signing in, you should be redirected to a URL like:');
  console.log(`${MOBILE_SCHEME}://auth/callback?code=some-uuid-here`);
  console.log('\nPlease copy the code from the redirect URL and paste it below:\n');
  
  // Step 2: Get the code from user
  const code = await new Promise((resolve) => {
    rl.question('Enter the code from the redirect URL: ', resolve);
  });
  
  if (!code) {
    console.log('❌ No code provided. Exiting.');
    rl.close();
    return;
  }
  
  console.log(`\n🔄 Step 2: Exchanging code for JWT token...`);
  
  // Step 3: Exchange code for JWT
  try {
    const exchangeResponse = await makeRequest(`${API_BASE_URL}/api/mobile/exchange?code=${code}`);
    
    if (exchangeResponse.status !== 200) {
      console.log('❌ Failed to exchange code for token:');
      console.log('Status:', exchangeResponse.status);
      console.log('Response:', exchangeResponse.data);
      rl.close();
      return;
    }
    
    const { token } = exchangeResponse.data;
    console.log('✅ Successfully obtained JWT token');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Step 4: Test the JWT with a protected endpoint
    console.log('\n🔒 Step 3: Testing JWT with protected endpoint...');
    
    const testResponse = await makeRequest(`${API_BASE_URL}/api/mobile/example`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.status === 200) {
      console.log('✅ JWT authentication successful!');
      console.log('Response:', testResponse.data);
    } else {
      console.log('❌ JWT authentication failed:');
      console.log('Status:', testResponse.status);
      console.log('Response:', testResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Error during token exchange:', error.message);
  }
  
  rl.close();
}

// Run the test
testMobileAuth().catch(console.error);
