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

const paymentCtrl = require("./controllers/payment.controller");
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentCtrl.stripeWebhook
);

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-tripmate-fyp.vercel.app",
  "https://frontend-tripmate-fyp.vercel.app/"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.includes(origin) ||
        origin.includes("ngrok-free.app") ||
        origin.includes("localhost:3000");

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/health", (req, res) => res.json({ ok: true, name: "tripmate-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/admin", adminRoutes);


module.exports = app;
