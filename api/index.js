const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://frontend-tripmate-fyp.vercel.app",
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (
    origin &&
    (ALLOWED_ORIGINS.includes(origin) ||
      origin.includes("localhost") ||
      origin.includes("ngrok-free.app"))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

let app;
let connectDB;
let initError = null;

try {
  app = require("../src/app");
  connectDB = require("../src/config/db");
} catch (e) {
  initError = e;
  console.error("INIT ERROR:", e.message, e.stack);
}

let isConnected = false;

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (initError) {
    return res.status(500).json({
      error: "Server initialization failed",
      message: initError.message,
      stack: initError.stack,
    });
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
      console.error("DB Error:", err.message);
      return res.status(500).json({ error: "Database connection failed", message: err.message });
    }
  }

  try {
    return await app(req, res);
  } catch (err) {
    console.error("App Error:", err.message);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};
