const Hotel = require("../models/Hotel");
const { uploadToCloudinary } = require("../middleware/uploadLogo");

function parseJsonField(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// ──────────────────────────────────────────
// POST /api/hotels/register
// Hotel submits registration → status "pending" → admin approves
// ──────────────────────────────────────────
exports.registerHotel = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least 1 hotel image is required (max 5)" });
    }
    if (req.files.length > 5) {
      return res.status(400).json({ message: "You can upload a maximum of 5 images" });
    }

    const {
      hotelName,
      email = "",
      phone = "",
      city,
      address,
      description,
      pricePerNight,
      budgetCategory = "mid",
    } = req.body;

    if (!hotelName || !city || !address || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let amenities = parseJsonField(req.body.amenities, req.body.amenities);
    if (typeof amenities === "string") {
      amenities = amenities.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(amenities)) amenities = [];

    // Upload all images to Cloudinary in parallel
    const imageUrls = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "hotels"))
    );

    const logoUrl = imageUrls[0]; // first image is the main/cover image

    const hotel = await Hotel.create({
      hotelName,
      city,
      address,
      description,
      pricePerNight: Number(pricePerNight) || 0,
      budgetCategory: ["cheap", "mid", "luxury"].includes(budgetCategory)
        ? budgetCategory
        : "mid",
      amenities,
      logoUrl,
      images: imageUrls,
      status: "unpaid",
      paid: false,
      blocked: false,
    });

    return res.status(201).json({
      message: "Hotel registration submitted. It will be visible after admin approval.",
      hotel: {
        id: hotel._id,
        hotelName: hotel.hotelName,
        email: hotel.email,
        city: hotel.city,
        status: hotel.status,
        logoUrl: hotel.logoUrl,
        images: hotel.images,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Hotel email already registered" });
    }
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// GET /api/hotels
// Public — only approved & non-blocked (for landing "Trusted Hotels")
// Everyone can SEE hotels; booking is gated separately.
// ──────────────────────────────────────────
exports.getAllHotels = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { status: "approved", paid: true, blocked: false };

    if (search) {
      filter.$or = [
        { hotelName: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const hotels = await Hotel.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ total: hotels.length, hotels });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// GET /api/hotels/:id  (public, approved only)
// ──────────────────────────────────────────
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      status: "approved",
      blocked: false,
    });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    return res.status(200).json({ hotel });
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(400).json({ message: "Invalid hotel id" });
    }
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// GET /api/hotels/filter?city=..&budget=..
// Public — approved hotels matching a city + budget category.
// Used when generating a trip.
// ──────────────────────────────────────────
exports.filterHotels = async (req, res) => {
  try {
    const { city, budget } = req.query;
    const filter = { status: "approved", paid: true, blocked: false };

    if (city) filter.city = { $regex: city, $options: "i" };
    if (budget && ["cheap", "mid", "luxury"].includes(budget)) {
      filter.budgetCategory = budget;
    }

    const hotels = await Hotel.find(filter).sort({ rating: -1, createdAt: -1 });
    return res.status(200).json({ total: hotels.length, hotels });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * Internal helper — used by trip generation to fetch registered hotels
 * that match a destination city + budget level.
 * @returns {Promise<Array>} approved hotels (may be empty)
 */
exports.findMatchingHotels = async (destination, budgetLevel) => {
  try {
    if (!destination) return [];
    const filter = { status: "approved", paid: true, blocked: false };

    // Match the first significant word of the destination against city
    const cityTerm = String(destination).split(",")[0].trim();
    filter.city = { $regex: cityTerm, $options: "i" };

    if (["cheap", "mid", "luxury"].includes(budgetLevel)) {
      filter.budgetCategory = budgetLevel;
    }

    return await Hotel.find(filter).sort({ rating: -1 }).limit(6).lean();
  } catch (err) {
    console.error("findMatchingHotels error:", err.message);
    return [];
  }
};
