const router = require("express").Router();
const ctrl = require("../controllers/payment.controller");

// Create a Stripe Checkout session for a vendor
router.post("/create-checkout-session", ctrl.createCheckoutSession);

// Create a Stripe Checkout session for a trip (user upgrade)
router.post("/create-trip-checkout-session", ctrl.createTripCheckoutSession);

// Success & cancel pages (frontend can call these)
router.get("/success", ctrl.paymentSuccess);
router.get("/cancel", ctrl.paymentCancel);

// NOTE: The webhook route is mounted separately in app.js
// with express.raw() middleware (Stripe needs the raw body).

module.exports = router;
