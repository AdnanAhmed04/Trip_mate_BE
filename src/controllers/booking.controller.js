const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const User = require("../models/User");
const { sendHotelBookingEmail, sendBookingConfirmedEmail, sendBookingRejectedEmail } = require("../services/emailService");
const { logSecurityEvent } = require("../services/loggingService");

// ──────────────────────────────────────────
// POST /api/bookings
// Paid users only (enforced by requirePaid middleware).
// Creates a reservation request → emails hotel + admin.
// ──────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hotelId, tripId, checkIn, checkOut, guests = 1, notes = "" } = req.body;

    if (!hotelId) return res.status(400).json({ message: "hotelId is required" });

    const hotel = await Hotel.findOne({ _id: hotelId, status: "approved", blocked: false });
    if (!hotel) return res.status(404).json({ message: "Hotel not found or not available" });

    const user = await User.findById(userId).select("name email");

    // Calculate nights + estimated total
    let nights = 1;
    if (checkIn && checkOut) {
      const inD = new Date(checkIn);
      const outD = new Date(checkOut);
      const diff = Math.ceil((outD - inD) / (1000 * 60 * 60 * 24));
      nights = diff > 0 ? diff : 1;
    }
    const estimatedTotal = nights * (hotel.pricePerNight || 0);

    const booking = await Booking.create({
      user: userId,
      hotel: hotel._id,
      trip: tripId || null,
      hotelName: hotel.hotelName,
      city: hotel.city,
      pricePerNight: hotel.pricePerNight,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      guests: Number(guests) || 1,
      nights,
      estimatedTotal,
      contactName: user?.name || "",
      contactEmail: user?.email || "",
      notes,
      status: "pending",
    });

    await logSecurityEvent({
      actor: user?.email || userId,
      action: "HOTEL_BOOKING_CREATED",
      target: booking._id.toString(),
      severity: "INFO",
      details: { hotel: hotel.hotelName, city: hotel.city },
      req,
    });

    // Fire-and-forget email to hotel + admin (don't block response)
    sendHotelBookingEmail(booking, hotel, user).catch((e) =>
      console.error("Booking email failed:", e.message)
    );

    return res.status(201).json({
      message: "Booking request submitted! The hotel will confirm your reservation shortly.",
      booking,
    });
  } catch (err) {
    console.error("createBooking error:", err.message);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// GET /api/bookings/my  — current user's bookings
// ──────────────────────────────────────────
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("hotel", "_id hotelName city")
      .sort({ createdAt: -1 });
    return res.status(200).json({ total: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// GET /api/bookings — Admin: all bookings
// ──────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("hotel", "hotelName city address pricePerNight logoUrl")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const total   = bookings.length;
    const pending   = bookings.filter(b => b.status === "pending").length;
    const confirmed = bookings.filter(b => b.status === "confirmed").length;
    const cancelled = bookings.filter(b => b.status === "cancelled").length;

    return res.status(200).json({ stats: { total, pending, confirmed, cancelled }, bookings });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// POST /api/bookings/:id/confirm — Admin confirm
// ──────────────────────────────────────────
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("hotel").populate("user", "name email");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "confirmed";
    await booking.save();

    await logSecurityEvent({ actor: req.user.email, action: "BOOKING_CONFIRMED", target: booking._id.toString(), severity: "INFO", req });

    // Email user
    sendBookingConfirmedEmail(booking, booking.hotel, booking.contactEmail || booking.user?.email)
      .catch(e => console.error("Confirm email failed:", e.message));

    return res.status(200).json({ message: "Booking confirmed and user notified.", booking });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// POST /api/bookings/:id/reject — Admin reject
// ──────────────────────────────────────────
exports.rejectBooking = async (req, res) => {
  try {
    const { reason = "" } = req.body;
    const booking = await Booking.findById(req.params.id).populate("hotel").populate("user", "name email");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    await logSecurityEvent({ actor: req.user.email, action: "BOOKING_REJECTED", target: booking._id.toString(), severity: "WARN", req });

    // Email user
    sendBookingRejectedEmail(booking, booking.hotel, booking.contactEmail || booking.user?.email, reason)
      .catch(e => console.error("Reject email failed:", e.message));

    return res.status(200).json({ message: "Booking rejected and user notified.", booking });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
