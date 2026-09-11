import mongoose from "mongoose";

// Singleton database connection: repeated calls to connectDB() reuse the
// same connection promise instead of opening a new connection each time.
let connectionPromise = null;

export const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in the environment variables");
  }

  mongoose.set("strictQuery", true);

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI)
    .then((conn) => {
      console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      connectionPromise = null; // allow a retry on the next call
      console.error("MongoDB connection failed:", error.message);
      throw error;
    });

  return connectionPromise;
};

export default connectDB;
