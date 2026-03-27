const app = require("../src/app");
const connectDB = require("../src/config/db");
const mongoose = require("mongoose");

let isConnected = false;

module.exports = async (req, res) => {
  console.log("Request path:", req.url);
  
  if (!isConnected) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌ MONGODB_URI is missing from environment variables!");
      return res.status(500).json({ error: "MONGODB_URI missing" });
    }

    // Log the partial URI to verify it's the one we expect (hide password)
    const maskedUri = uri.replace(/:([^@]+)@/, ":****@");
    console.log("Connecting to:", maskedUri);

    try {
      // Set a short timeout for the connection attempt itself
      await connectDB(uri);
      isConnected = true;
      console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
      console.error("❌ MongoDB Connection Error:", err.message);
      // Don't mark as connected so next request tries again
      return res.status(500).json({ 
        error: "Database connection failed", 
        details: err.message,
        uri_source: "process.env.MONGODB_URI"
      });
    }
  } else {
    console.log("♻️ Using existing MongoDB connection");
  }

  try {
    return await app(req, res);
  } catch (err) {
    console.error("❌ App Router Error:", err.message);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};
