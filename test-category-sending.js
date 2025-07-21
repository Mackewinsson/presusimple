#!/usr/bin/env node

// Test script to verify category sending to AI parsing API
const testCategories = ['Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Income'];

async function testCategorySending() {
  console.log('🧪 Testing AI Transaction Parsing with Categories');
  console.log('Available categories:', testCategories);
  
  try {
    const response = await fetch('http://localhost:3000/api/transactions/ai-parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'coffee 5, lunch 15, gas 40',
        userId: 'test-user',
        budgetId: 'test-budget',
        categories: testCategories
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! AI Response:', data);
      console.log('📊 Transactions parsed:', data.transactions.length);
      data.transactions.forEach((tx, i) => {
        console.log(`  ${i + 1}. ${tx.description} - $${tx.amount} (${tx.type}) → ${tx.category}`);
      });
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Run the test
testCategorySending(); 