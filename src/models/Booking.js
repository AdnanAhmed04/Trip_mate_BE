const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },

    // Optional link to the trip the booking was made from
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },

    // Snapshot of hotel info at booking time (in case hotel changes later)
    hotelName: { type: String, default: "" },
    city: { type: String, default: "" },
    pricePerNight: { type: Number, default: 0 },

    checkIn: { type: Date },
    checkOut: { type: Date },
    guests: { type: Number, default: 1 },
    nights: { type: Number, default: 1 },
    estimatedTotal: { type: Number, default: 0 },

    contactName: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    notes: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
