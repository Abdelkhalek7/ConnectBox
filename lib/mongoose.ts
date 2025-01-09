/* eslint-disable no-var */
import mongoose from "mongoose";

// Get the MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Define the type for the cached Mongoose connection
type CachedMongoose = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
};

// Declare the global variable 'mongoose' with its type
declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;
}

// Initialize the cached connection object
const cached: CachedMongoose = global.mongoose ?? { conn: null, promise: null };

// If 'mongoose' is not already defined globally, assign the cached object to it
if (!global.mongoose) {
  global.mongoose = cached;
}

// Function to connect to the MongoDB database
export async function connectToDatabase(): Promise<mongoose.Connection> {
  // If a connection already exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise doesn't exist, create one
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    // Wait for the connection promise to resolve and store the connection
    cached.conn = await cached.promise;
  } catch (e) {
    // If an error occurs, reset the promise and re-throw the error
    cached.promise = null;
    throw e;
  }

  // Return the established connection
  return cached.conn;
}
