const mongoose = require("mongoose");

const itineraryItemSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    notes: { type: String, default: "" },
    location: { type: String, default: "" },
    startTime: { type: String, default: "" }, // "09:00"
    endTime: { type: String, default: "" },
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
    budget: { type: Number, default: 0 },
    travelers: { type: Number, default: 1 },
    itinerary: { type: [itineraryItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
