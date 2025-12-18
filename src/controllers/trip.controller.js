// controllers/trip.controller.js
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const { generateItinerary } = require("../services/itineraryGenerator");

// CREATE (already yours)
exports.createTrip = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      destination,
      startDate,
      endDate,
      travelers = 1,
      budgetLevel = "cheap",
      interests = [],
    } = req.body;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const itinerary = await generateItinerary({
      destination,
      startDate,
      endDate,
      travelers,
      budgetLevel,
      interests,
    });

    const trip = await Trip.create({
      userId,
      title,
      destination,
      startDate,
      endDate,
      travelers,
      budgetLevel,
      interests,
      itinerary,
      generatedBy: "ai",
    });

    return res.status(201).json({ trip });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Failed to generate trip",
    });
  }
};

// GET ALL (for logged-in user)
exports.getTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    return res.json({ trips });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch trips" });
  }
};

// GET ONE (by id, owned by user)
exports.getTripById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    return res.json({ trip });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch trip" });
  }
};

// UPDATE (owned by user)
exports.updateTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    // prevent changing ownership/metadata
    const forbidden = ["userId", "generatedBy", "_id", "createdAt", "updatedAt"];
    for (const key of forbidden) {
      if (key in req.body) delete req.body[key];
    }

    const trip = await Trip.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!trip) return res.status(404).json({ message: "Trip not found" });
    return res.json({ trip });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to update trip" });
  }
};

// DELETE (owned by user)
exports.deleteTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const trip = await Trip.findOneAndDelete({ _id: id, userId });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    return res.json({ message: "Trip deleted", tripId: id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete trip" });
  }
};
