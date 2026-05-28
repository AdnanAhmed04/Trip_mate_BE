const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const tripRoutes = require("./routes/trip.routes");
const vendorRoutes = require("./routes/vendor.routes");
const paymentRoutes = require("./routes/payment.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const adminRoutes = require("./routes/admin.routes");

require("dotenv").config();
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://frontend-tripmate-fyp.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.includes("ngrok-free.app") ||
      origin.includes("localhost");
    if (isAllowed) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS must be first — before any other middleware
app.use(cors(corsOptions));
app.options("/(.*)", cors(corsOptions));

// Stripe webhook needs raw body — register before express.json()
const paymentCtrl = require("./controllers/payment.controller");
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentCtrl.stripeWebhook
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true, name: "tripmate-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
