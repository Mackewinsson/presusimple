import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/test-mongo:
 *   get:
 *     summary: Test MongoDB connection
 *     description: Test endpoint to verify MongoDB connection and retrieve database information
 *     tags: [Testing]
 *     responses:
 *       200:
 *         description: MongoDB connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "MongoDB connection successful"
 *                 database:
 *                   type: string
 *                   example: "simple-budget"
 *                 collections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "users"
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *       500:
 *         description: MongoDB connection failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "MongoDB connection failed"
 */
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
