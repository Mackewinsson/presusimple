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

async function cleanupSections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🧹 Step 1: Cleaning up sections from budgets...');
    
    // Find budgets with sections (including empty arrays)
    const budgetsWithSections = await Budget.find({ sections: { $exists: true } });
    console.log(`📊 Found ${budgetsWithSections.length} budgets with sections`);
    
    if (budgetsWithSections.length > 0) {
      // Remove sections field completely
      const result = await Budget.updateMany(
        { sections: { $exists: true } },
        { $unset: { sections: "" } }
      );
      console.log(`✅ Successfully removed sections from ${result.modifiedCount} budgets`);
    } else {
      console.log('✅ No budgets with sections found');
    }
    
    console.log('\n🧹 Step 2: Cleaning up sectionId from categories...');
    
    // Find categories with sectionId
    const categoriesWithSectionId = await Category.find({ sectionId: { $exists: true } });
    console.log(`📊 Found ${categoriesWithSectionId.length} categories with sectionId`);
    
    if (categoriesWithSectionId.length > 0) {
      // Remove sectionId field completely
      const result = await Category.updateMany(
        { sectionId: { $exists: true } },
        { $unset: { sectionId: "" } }
      );
      console.log(`✅ Successfully removed sectionId from ${result.modifiedCount} categories`);
    } else {
      console.log('✅ No categories with sectionId found');
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    
    const remainingBudgetsWithSections = await Budget.find({ sections: { $exists: true } });
    const remainingCategoriesWithSectionId = await Category.find({ sectionId: { $exists: true } });
    
    console.log(`📊 Remaining budgets with sections: ${remainingBudgetsWithSections.length}`);
    console.log(`📊 Remaining categories with sectionId: ${remainingCategoriesWithSectionId.length}`);
    
    if (remainingBudgetsWithSections.length === 0 && remainingCategoriesWithSectionId.length === 0) {
      console.log('\n🎉 All cleanup operations completed successfully!');
    } else {
      console.log('\n⚠️  Some items may need manual review.');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupSections(); 