const app = require("../src/app");
const connectDB = require("../src/config/db");

let isConnected = false;

module.exports = async (req, res) => {
  // Only connect if not already connected
  if (!isConnected) {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined in environment variables");
      return res.status(500).json({ error: "Database configuration missing" });
    }
    try {
      await connectDB(process.env.MONGODB_URI);
      isConnected = true;
      console.log("MongoDB Connected in Serverless Context");
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err);
      return res.status(500).json({ error: "Database connection failed", details: err.message });
    }
  }

  // Handle the request with the Express app
  return app(req, res);
};
