import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

/** Updates lastLoginAt when a user authenticates (web or mobile). */
export async function recordUserLogin(email: string): Promise<void> {
  if (!email) return;
  await dbConnect();
  await User.updateOne({ email }, { $set: { lastLoginAt: new Date() } });
}
