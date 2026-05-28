const app = require("../src/app");
const connectDB = require("../src/config/db");

let isConnected = false;

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://frontend-tripmate-fyp.vercel.app",
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.includes("localhost") || origin.includes("ngrok-free.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

module.exports = async (req, res) => {
  // Always set CORS headers first — even on errors
  setCorsHeaders(req, res);

  // Handle preflight immediately
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!isConnected) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return res.status(500).json({ error: "MONGODB_URI missing" });
    }
    try {
      await connectDB(uri);
      isConnected = true;
    } catch (err) {
      console.error("❌ MongoDB Connection Error:", err.message);
      return res.status(500).json({ error: "Database connection failed", details: err.message });
    }
  }

  try {
    return await app(req, res);
  } catch (err) {
    console.error("❌ App Router Error:", err.message);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};
