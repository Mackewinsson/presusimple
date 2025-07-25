const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function cleanupDirect() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const budgetsCollection = db.collection('budgets');
    const categoriesCollection = db.collection('categories');
    
    console.log('\n🧹 Step 1: Cleaning up sections from budgets...');
    
    // Find budgets with sections
    const budgetsWithSections = await budgetsCollection.find({ sections: { $exists: true } }).toArray();
    console.log(`📊 Found ${budgetsWithSections.length} budgets with sections`);
    
    if (budgetsWithSections.length > 0) {
      // Remove sections field
      const result = await budgetsCollection.updateMany(
        { sections: { $exists: true } },
        { $unset: { sections: "" } }
      );
      console.log(`✅ Successfully removed sections from ${result.modifiedCount} budgets`);
    }
    
    console.log('\n🧹 Step 2: Cleaning up sectionId from categories...');
    
    // Find categories with sectionId
    const categoriesWithSectionId = await categoriesCollection.find({ sectionId: { $exists: true } }).toArray();
    console.log(`📊 Found ${categoriesWithSectionId.length} categories with sectionId`);
    
    if (categoriesWithSectionId.length > 0) {
      // Remove sectionId field
      const result = await categoriesCollection.updateMany(
        { sectionId: { $exists: true } },
        { $unset: { sectionId: "" } }
      );
      console.log(`✅ Successfully removed sectionId from ${result.modifiedCount} categories`);
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    
    const remainingBudgets = await budgetsCollection.find({ sections: { $exists: true } }).toArray();
    const remainingCategories = await categoriesCollection.find({ sectionId: { $exists: true } }).toArray();
    
    console.log(`📊 Remaining budgets with sections: ${remainingBudgets.length}`);
    console.log(`📊 Remaining categories with sectionId: ${remainingCategories.length}`);
    
    if (remainingBudgets.length === 0 && remainingCategories.length === 0) {
      console.log('\n🎉 All cleanup operations completed successfully!');
    } else {
      console.log('\n⚠️  Some items may need manual review.');
      
      if (remainingBudgets.length > 0) {
        console.log('\n🔍 Sample remaining budget:');
        console.log(JSON.stringify(remainingBudgets[0], null, 2));
      }
      
      if (remainingCategories.length > 0) {
        console.log('\n🔍 Sample remaining category:');
        console.log(JSON.stringify(remainingCategories[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupDirect(); 