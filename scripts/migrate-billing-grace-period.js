#!/usr/bin/env node

/**
 * One-time migration: grant billing grace period to legacy Pro users.
 *
 * Targets unpaid users who are not on a manual/admin grant and do not already
 * have an active trial or billing grace period.
 *
 * Usage:
 *   node scripts/migrate-billing-grace-period.js           # apply changes
 *   node scripts/migrate-billing-grace-period.js --dry-run   # preview only
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const BILLING_GRACE_PERIOD_DAYS = parseInt(
  process.env.BILLING_GRACE_PERIOD_DAYS || "30",
  10
);
const BILLING_GRACE_SUBSCRIPTION_TYPE = "billing_grace_period";
const PERMANENT_PRO_SUBSCRIPTION_TYPES = ["manual_paid", "manual_pro_only"];
const dryRun = process.argv.includes("--dry-run");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isPaid: { type: Boolean, default: false },
  trialStart: { type: Date },
  trialEnd: { type: Date },
  subscriptionType: { type: String },
  plan: { type: String, enum: ["free", "pro"], default: "free" },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

function calculateTrialDaysLeft(trialEnd) {
  if (!trialEnd) return 0;
  const diffTime = new Date(trialEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

function isInTrial(trialEnd, isPaid) {
  if (!trialEnd || isPaid) return false;
  return calculateTrialDaysLeft(trialEnd) > 0;
}

function shouldReceiveBillingGracePeriod(user) {
  if (user.isPaid) return false;
  if (
    user.subscriptionType &&
    PERMANENT_PRO_SUBSCRIPTION_TYPES.includes(user.subscriptionType)
  ) {
    return false;
  }
  if (user.subscriptionType === BILLING_GRACE_SUBSCRIPTION_TYPE) return false;
  if (isInTrial(user.trialEnd, false)) return false;

  const hadProOrTrial =
    user.plan === "pro" ||
    user.trialEnd != null ||
    user.subscriptionType === "trial_signup" ||
    user.subscriptionType === "mobile_signup";

  if (!hadProOrTrial) return false;

  return true;
}

function buildGracePeriodUpdate(now = new Date()) {
  const trialEnd = new Date(now);
  trialEnd.setTime(
    trialEnd.getTime() + BILLING_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  return {
    plan: "pro",
    isPaid: false,
    trialStart: now,
    trialEnd,
    subscriptionType: BILLING_GRACE_SUBSCRIPTION_TYPE,
  };
}

async function migrateBillingGracePeriod() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.\n");

    const users = await User.find({});
    const eligible = users.filter(shouldReceiveBillingGracePeriod);

    console.log(`Total users: ${users.length}`);
    console.log(`Eligible for billing grace (${BILLING_GRACE_PERIOD_DAYS} days): ${eligible.length}`);
    console.log(`Mode: ${dryRun ? "DRY RUN (no writes)" : "APPLY"}\n`);

    if (eligible.length === 0) {
      console.log("Nothing to migrate.");
      return;
    }

    for (const user of eligible) {
      const update = buildGracePeriodUpdate();
      console.log(
        `- ${user.email} | plan=${user.plan} | type=${user.subscriptionType || "none"} -> grace until ${update.trialEnd.toISOString()}`
      );

      if (!dryRun) {
        await User.updateOne({ _id: user._id }, { $set: update });
      }
    }

    if (dryRun) {
      console.log("\nDry run complete. Re-run without --dry-run to apply.");
    } else {
      console.log(`\nUpdated ${eligible.length} user(s).`);
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB.");
  }
}

migrateBillingGracePeriod();
