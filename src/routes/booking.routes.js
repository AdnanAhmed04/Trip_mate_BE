const router = require("express").Router();
const { requireAuth, requirePaid } = require("../middleware/auth");
const ctrl = require("../controllers/booking.controller");

// Create a booking — PAID USERS ONLY (server-side gate)
router.post("/", requireAuth, requirePaid, ctrl.createBooking);

// Current user's bookings
router.get("/my", requireAuth, ctrl.getMyBookings);

// Admin routes (authAdmin is applied in admin.routes — these are separate)
router.get("/", requireAuth, ctrl.getAllBookings);
router.post("/:id/confirm", requireAuth, ctrl.confirmBooking);
router.post("/:id/reject",  requireAuth, ctrl.rejectBooking);

module.exports = router;
