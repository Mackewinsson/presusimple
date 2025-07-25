const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Budget Schema
const BudgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalBudgeted: { type: Number, required: true },
  totalAvailable: { type: Number, required: true },
}, { timestamps: true });

// Define Category Schema
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  budgeted: { type: Number, required: true, min: 0 },
  spent: { type: Number, default: 0, min: 0 },
  budgetId: { type: String, required: true },
}, { timestamps: true });

// Register models
const Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Clean up sections from all budgets
async function cleanupBudgetSections() {
  try {
    console.log('\n🧹 Step 1: Cleaning up sections from budgets...');
    
    // Find all budgets that have sections
    const budgetsWithSections = await Budget.find({ sections: { $exists: true } });
    console.log(`📊 Found ${budgetsWithSections.length} budgets with sections`);
    
    if (budgetsWithSections.length === 0) {
      console.log('✅ No budgets with sections found.');
      return { modified: 0 };
    }
    
    // Remove sections field from all budgets
    const result = await Budget.updateMany(
      { sections: { $exists: true } },
      { $set: { sections: undefined } }
    );
    
    console.log(`✅ Successfully removed sections from ${result.modifiedCount} budgets`);
    
    // Verify cleanup
    const remainingBudgetsWithSections = await Budget.find({ sections: { $exists: true } });
    console.log(`🔍 Verification: ${remainingBudgetsWithSections.length} budgets still have sections`);
    
    return { modified: result.modifiedCount, remaining: remainingBudgetsWithSections.length };
    
  } catch (error) {
    console.error('❌ Error during budget cleanup:', error);
    throw error;
  }
}

// Clean up sectionId from all categories
async function cleanupCategorySectionIds() {
  try {
    console.log('\n🧹 Step 2: Cleaning up sectionId from categories...');
    
    // Find all categories that have sectionId
    const categoriesWithSectionId = await Category.find({ sectionId: { $exists: true } });
    console.log(`📊 Found ${categoriesWithSectionId.length} categories with sectionId`);
    
    if (categoriesWithSectionId.length === 0) {
      console.log('✅ No categories with sectionId found.');
      return { modified: 0 };
    }
    
    // Remove sectionId field from all categories
    const result = await Category.updateMany(
      { sectionId: { $exists: true } },
      { $set: { sectionId: undefined } }
    );
    
    console.log(`✅ Successfully removed sectionId from ${result.modifiedCount} categories`);
    
    // Verify cleanup
    const remainingCategoriesWithSectionId = await Category.find({ sectionId: { $exists: true } });
    console.log(`🔍 Verification: ${remainingCategoriesWithSectionId.length} categories still have sectionId`);
    
    return { modified: result.modifiedCount, remaining: remainingCategoriesWithSectionId.length };
    
  } catch (error) {
    console.error('❌ Error during category cleanup:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting comprehensive section cleanup...');
    await connectDB();
    
    // Run both cleanup operations
    const budgetResult = await cleanupBudgetSections();
    const categoryResult = await cleanupCategorySectionIds();
    
    // Summary
    console.log('\n📋 Cleanup Summary:');
    console.log(`   Budgets cleaned: ${budgetResult.modified}`);
    console.log(`   Categories cleaned: ${categoryResult.modified}`);
    console.log(`   Remaining budgets with sections: ${budgetResult.remaining}`);
    console.log(`   Remaining categories with sectionId: ${categoryResult.remaining}`);
    
    if (budgetResult.remaining === 0 && categoryResult.remaining === 0) {
      console.log('\n🎉 All cleanup operations completed successfully!');
    } else {
      console.log('\n⚠️  Some items may need manual review.');
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { cleanupBudgetSections, cleanupCategorySectionIds }; 