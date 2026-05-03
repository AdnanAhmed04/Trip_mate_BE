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

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
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

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
