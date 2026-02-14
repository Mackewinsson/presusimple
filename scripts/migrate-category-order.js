#!/usr/bin/env node

/**
 * One-time migration: set `order` for existing categories within each budget.
 * Categories are ordered by createdAt ascending (oldest first).
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    budgeted: Number,
    spent: Number,
    budgetId: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category =
  mongoose.models?.Category || mongoose.model("Category", CategorySchema);

async function migrateCategoryOrder() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    const budgets = await Category.distinct("budgetId");
    console.log(`Found ${budgets.length} budget(s).`);

    for (const budgetId of budgets) {
      const categories = await Category.find({ budgetId })
        .sort({ createdAt: 1 })
        .lean();

      for (let i = 0; i < categories.length; i++) {
        await Category.updateOne(
          { _id: categories[i]._id },
          { $set: { order: i } }
        );
      }
      console.log(
        `  budgetId ${budgetId}: updated order for ${categories.length} categories.`
      );
    }

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected.");
    process.exit(0);
  }
}

migrateCategoryOrder();
