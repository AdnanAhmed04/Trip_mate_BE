// models/Trip.js
const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotelName: String,
  address: String,
  price: String,
  imageUrl: String,
  geoCoordinates: { lat: Number, lng: Number },
  rating: Number,
  description: String
});

const placeSchema = new mongoose.Schema({
  placeName: String,
  details: String,
  imageUrl: String,
  geoCoordinates: { lat: Number, lng: Number },
  ticketPricing: String,
  timeToTravel: String,
  bestTimeToVisit: String,
  address: { type: String, default: "" }, // Added address
  googleMapsUrl: { type: String, default: "" } // Added Google Maps URL
});

const itineraryItemSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    dayDescription: { type: String, default: "" }, // Make sure dayDescription is here if not already
    weather: { type: String, default: "" }, // Added weather forecast
    morning: [placeSchema],
    afternoon: [placeSchema],
    evening: [placeSchema],
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
    origin: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budgetLevel: { type: String, enum: ["cheap", "mid", "luxury"], default: "cheap" },
    travelers: { type: Number, default: 1 },
    interests: { type: [String], default: [] },
    hotels: [hotelSchema],
    itinerary: { type: [itineraryItemSchema], default: [] },
    generatedBy: { type: String, enum: ["ai", "rules", "manual"], default: "ai" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
