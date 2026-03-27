const app = require("../src/app");
const mongoose = require("mongoose");

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB via Serverless Wrapper");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};
