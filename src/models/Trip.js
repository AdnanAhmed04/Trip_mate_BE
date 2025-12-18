// models/Trip.js
const mongoose = require("mongoose");

const itineraryItemSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },

    // optional: make it more structured than a single "title"
    morning: {
      title: { type: String, default: "" },
      startTime: { type: String, default: "" }, // "09:00"
      endTime: { type: String, default: "" },
      places: { type: [String], default: [] },  // top 3 places
      food: { type: [String], default: [] },    // what to try nearby
      notes: { type: String, default: "" },
    },
    afternoon: {
      title: { type: String, default: "" },
      startTime: { type: String, default: "" },
      endTime: { type: String, default: "" },
      places: { type: [String], default: [] },
      food: { type: [String], default: [] },
      notes: { type: String, default: "" },
    },
    evening: {
      title: { type: String, default: "" },
      startTime: { type: String, default: "" },
      endTime: { type: String, default: "" },
      places: { type: [String], default: [] },
      food: { type: [String], default: [] },
      notes: { type: String, default: "" },
    },

    // quick extras
    localTips: { type: [String], default: [] },
    estimatedCost: { type: Number, default: 0 },
  },
  { _id: true }
);

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    budgetLevel: { type: String, enum: ["cheap", "mid", "luxury"], default: "cheap" },
    travelers: { type: Number, default: 1 },

    interests: { type: [String], default: [] }, // ["food","travel","mountains"]

    itinerary: { type: [itineraryItemSchema], default: [] },

    // optional metadata
    generatedBy: { type: String, enum: ["ai", "rules"], default: "ai" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
