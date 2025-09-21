#!/usr/bin/env node

/**
 * Test script for mobile login API
 * 
 * This script tests the mobile login endpoint with a mock Google access token
 * 
 * Usage: node scripts/test-mobile-login.js
 */

const http = require('http');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
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

async function testMobileLogin() {
  console.log('🧪 Testing Mobile Login API\n');
  
  // Test 1: Health check
  console.log('📋 Step 1: Testing health check...');
  try {
    const healthResponse = await makeRequest(`${API_BASE_URL}/api/mobile-login`);
    console.log('Health check status:', healthResponse.status);
    console.log('Health check response:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Test with invalid token
  console.log('\n🔒 Step 2: Testing with invalid token...');
  try {
    const invalidResponse = await makeRequest(`${API_BASE_URL}/api/mobile-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Write invalid request body
    const req = http.request(`${API_BASE_URL}/api/mobile-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          console.log('Invalid token status:', res.statusCode);
          console.log('Invalid token response:', jsonData);
        } catch (e) {
          console.log('Invalid token response (raw):', data);
        }
      });
    });
    
    req.write(JSON.stringify({ accessToken: 'invalid-token' }));
    req.end();
    
  } catch (error) {
    console.log('❌ Invalid token test failed:', error.message);
  }
  
  console.log('\n✅ Mobile Login API test completed!');
  console.log('\nTo test with a real Google access token:');
  console.log('1. Get a Google access token from your mobile app');
  console.log('2. POST to /api/mobile-login with { "accessToken": "your-token" }');
  console.log('3. You should receive a JWT token in response');
}

// Run the test
testMobileLogin().catch(console.error);
