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

async function debugData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check budgets
    const budgets = await Budget.find({});
    console.log(`\n📊 Found ${budgets.length} total budgets`);
    
    const budgetsWithSections = await Budget.find({ sections: { $exists: true } });
    console.log(`📊 Found ${budgetsWithSections.length} budgets with sections`);
    
    if (budgetsWithSections.length > 0) {
      console.log('\n🔍 Sample budget with sections:');
      console.log(JSON.stringify(budgetsWithSections[0], null, 2));
    }
    
    // Check categories
    const categories = await Category.find({});
    console.log(`\n📊 Found ${categories.length} total categories`);
    
    const categoriesWithSectionId = await Category.find({ sectionId: { $exists: true } });
    console.log(`📊 Found ${categoriesWithSectionId.length} categories with sectionId`);
    
    if (categoriesWithSectionId.length > 0) {
      console.log('\n🔍 Sample category with sectionId:');
      console.log(JSON.stringify(categoriesWithSectionId[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugData(); 