import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";

export async function POST() {
  await dbConnect();
  await Budget.deleteMany({});
  return NextResponse.json({ success: true });
}
