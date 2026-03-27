const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const vendorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },

    services: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "Select at least 1 service",
      },
      required: true,
    },

    customServices: { type: [String], default: [] },

    branches: { type: [branchSchema], default: [] },

    serviceLocations: { type: [String], default: [] },

    vendorType: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    aboutUs: { type: String, required: true, trim: true },
    specialOffer: { type: String, default: "", trim: true },

    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },

    // main location (optional, branches still work)
    city: { type: String, trim: true, default: "" },

    // logo fields
    logoUrl: { type: String, default: "" },
    logoFileName: { type: String, default: "" },

    // payment fields
    paid: { type: Boolean, default: false },
    stripeSessionId: { type: String, default: "" },
    paymentIntentId: { type: String, default: "" },

    // admin block
    blocked: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["unpaid", "pending", "pending_approval", "approved", "rejected"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
