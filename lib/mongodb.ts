import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

// Check if MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

// Define the interface for the cached connection
interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Define the global namespace to avoid conflicts
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: CachedConnection | undefined
}

// Initialize the cached connection
const cached: CachedConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
}

// Set the global mongoose cache if it doesn't exist
if (!global.mongooseConnection) {
  global.mongooseConnection = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  // If we have a connection, return it
  if (cached.conn) {
    console.log("Using existing MongoDB connection")
    return cached.conn
  }

  // If we don't have a promise to connect, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log("Creating new MongoDB connection to:", MONGODB_URI)
    // Use the imported mongoose, not the cached one
    cached.promise = mongoose.connect(MONGODB_URI as string, opts)
  }

  try {
    // Await the connection
    console.log("Awaiting MongoDB connection...")
    cached.conn = await cached.promise
    console.log("MongoDB connected successfully")
    return cached.conn
  } catch (error) {
    // Reset the promise on error so future attempts can retry
    console.error("MongoDB connection error:", error)
    cached.promise = null
    throw error
  }
}

