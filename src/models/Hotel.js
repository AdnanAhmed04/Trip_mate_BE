const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    hotelName: { type: String, required: true, trim: true },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
      sparse: true,   // allows multiple docs with empty/null email
    },

    phone: { type: String, trim: true, default: "" },

    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    description: { type: String, required: true, trim: true },

    // Price per night (used for budget matching against a trip)
    pricePerNight: { type: Number, required: true, default: 0 },

    // Budget category — matched against Trip.budgetLevel
    budgetCategory: {
      type: String,
      enum: ["cheap", "mid", "luxury"],
      required: true,
      default: "mid",
    },

    amenities: { type: [String], default: [] },

    rating: { type: Number, default: 4.5, min: 0, max: 5 },

    // Images
    logoUrl: { type: String, default: "" },
    images: { type: [String], default: [] },

    geoCoordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    // Admin approval flow (mirrors Vendor)
    blocked: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["unpaid", "pending", "pending_approval", "approved", "rejected"],
      default: "unpaid",
    },

    // Payment fields (mirrors Vendor)
    paid: { type: Boolean, default: false },
    stripeSessionId: { type: String, default: "" },
    paymentIntentId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
