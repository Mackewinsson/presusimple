import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 20, // Increased for better connection handling
      serverSelectionTimeoutMS: 10000, // Increased timeout for international connections
      socketTimeoutMS: 60000, // Increased socket timeout for slower connections
      connectTimeoutMS: 10000, // Connection timeout
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true, // Enable retry for write operations
      retryReads: true, // Enable retry for read operations
    };

    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts);
      cached.conn = await cached.promise;
      console.log('MongoDB connected successfully');
      return cached.conn;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // Reset cached promise on error to allow retry
      cached.promise = null;
      throw error;
    }
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Reset cached promise on error to allow retry
    cached.promise = null;
    throw error;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection closure:', err);
    process.exit(1);
  }
});
