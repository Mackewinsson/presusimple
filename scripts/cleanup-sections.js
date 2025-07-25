const mongoose = require('mongoose');

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
async function cleanupSections() {
  try {
    console.log('🧹 Starting cleanup of sections from all budgets...');
    
    // Get the Budget model
    const Budget = mongoose.model('Budget');
    
    // Find all budgets that have sections
    const budgetsWithSections = await Budget.find({ sections: { $exists: true } });
    console.log(`📊 Found ${budgetsWithSections.length} budgets with sections`);
    
    if (budgetsWithSections.length === 0) {
      console.log('✅ No budgets with sections found. Database is already clean!');
      return;
    }
    
    // Remove sections field from all budgets
    const result = await Budget.updateMany(
      { sections: { $exists: true } },
      { $unset: { sections: 1 } }
    );
    
    console.log(`✅ Successfully removed sections from ${result.modifiedCount} budgets`);
    
    // Verify cleanup
    const remainingBudgetsWithSections = await Budget.find({ sections: { $exists: true } });
    console.log(`🔍 Verification: ${remainingBudgetsWithSections.length} budgets still have sections`);
    
    if (remainingBudgetsWithSections.length === 0) {
      console.log('✅ Cleanup completed successfully!');
    } else {
      console.log('⚠️  Some budgets still have sections. Manual review may be needed.');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await connectDB();
    await cleanupSections();
    console.log('🎉 Cleanup script completed!');
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { cleanupSections }; 