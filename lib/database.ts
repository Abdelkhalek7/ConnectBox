import * as mongoose from "mongoose";

let isConnected = false; // Track connection status

export const connectToDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    mongoose.set("strictQuery", true); // Configure mongoose globally

    const MONGO_URI = process.env.MONGO_URI!;
    const db = await mongoose.connect(MONGO_URI);

    isConnected = db.connection.readyState === 1; // Check if connection is successful

    if (isConnected) {
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Database connection failed");
  }
};
