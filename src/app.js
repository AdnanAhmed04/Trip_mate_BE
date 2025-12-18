const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const tripRoutes = require("./routes/trip.routes");

require("dotenv").config();
const app = express();

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

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const vendorRoutes = require("./routes/vendor.routes");
app.use("/api/vendors", vendorRoutes);


module.exports = app;
