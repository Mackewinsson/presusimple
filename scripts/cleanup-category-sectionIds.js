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

// Clean up sectionId from all categories
async function cleanupCategorySectionIds() {
  try {
    console.log('🧹 Starting cleanup of sectionId from all categories...');
    
    // Get the Category model
    const Category = mongoose.model('Category');
    
    // Find all categories that have sectionId
    const categoriesWithSectionId = await Category.find({ sectionId: { $exists: true } });
    console.log(`📊 Found ${categoriesWithSectionId.length} categories with sectionId`);
    
    if (categoriesWithSectionId.length === 0) {
      console.log('✅ No categories with sectionId found. Database is already clean!');
      return;
    }
    
    // Remove sectionId field from all categories
    const result = await Category.updateMany(
      { sectionId: { $exists: true } },
      { $unset: { sectionId: 1 } }
    );
    
    console.log(`✅ Successfully removed sectionId from ${result.modifiedCount} categories`);
    
    // Verify cleanup
    const remainingCategoriesWithSectionId = await Category.find({ sectionId: { $exists: true } });
    console.log(`🔍 Verification: ${remainingCategoriesWithSectionId.length} categories still have sectionId`);
    
    if (remainingCategoriesWithSectionId.length === 0) {
      console.log('✅ Cleanup completed successfully!');
    } else {
      console.log('⚠️  Some categories still have sectionId. Manual review may be needed.');
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
    await cleanupCategorySectionIds();
    console.log('🎉 Category cleanup script completed!');
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

module.exports = { cleanupCategorySectionIds }; 