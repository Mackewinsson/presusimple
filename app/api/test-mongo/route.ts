import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({
      status: "success",
      message: "MongoDB connection successful!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
