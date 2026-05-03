// controllers/trip.controller.js
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const User = require("../models/User");
const { generateItinerary } = require("../services/itineraryGenerator");

// CREATE (already yours)
exports.createTrip = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[Trip Generation] User ${user.email} is currently on the '${user.subscriptionStatus || "free"}' plan.`);

    if (user.subscriptionStatus !== "paid") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const tripsToday = await Trip.countDocuments({
        userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      if (tripsToday >= 1) {
        return res.status(403).json({ 
          code: "LIMIT_REACHED", 
          message: "Daily limit reached. Please upgrade to a paid account." 
        });
      }
    }

    const {
      title,
      destination,
      origin = "",
      startDate,
      endDate,
      travelers = 1,
      budgetLevel = "cheap",
      interests = [],
    } = req.body;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

    // Ensure interests is an array
    const safeInterests = Array.isArray(interests) ? interests : [];

    const { itinerary, hotels } = await generateItinerary(
      destination,
      durationDays,
      budgetLevel,
      travelers,
      safeInterests
    );

    const trip = await Trip.create({
      userId,
      title,
      destination,
      origin,
      startDate,
      endDate,
      travelers,
      budgetLevel,
      interests,
      hotels,
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
    const forbidden = ["userId", "_id", "createdAt", "updatedAt"];
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
