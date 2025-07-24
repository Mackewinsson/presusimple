import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    
    // Get database info
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }
    
    const collections = await db.listCollections().toArray();
    
    // Get all users
    const users = await User.find({}).select('email name createdAt');
    
    return NextResponse.json({
      status: "success",
      message: "MongoDB connection successful!",
      database: db.databaseName,
      collections: collections.map((c: any) => c.name),
      users: users,
      userCount: users.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
