const Stripe = require("stripe");
const Vendor = require("../models/Vendor");
const Hotel = require("../models/Hotel");
const User = require("../models/User");
const { sendVendorRegistrationEmail, sendHotelBookingEmail } = require("../services/emailService");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ───────────────────────────────────────────
   POST /api/payments/create-checkout-session
   Body: { vendorId }
   ─────────────────────────────────────────── */
exports.createCheckoutSession = async (req, res) => {
    try {
        const { vendorId } = req.body;
        if (!vendorId) {
            return res.status(400).json({ message: "vendorId is required" });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        if (vendor.paid) {
            return res.status(400).json({ message: "Vendor has already paid" });
        }

        const amount = Number(process.env.STRIPE_PRICE_AMOUNT) || 1200; // cents

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Vendor Registration — ${vendor.companyName}`,
                            description: `Registration fee for ${vendor.companyName}`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            metadata: { vendorId: vendor._id.toString() },
            customer_email: vendor.email,
            success_url: `${process.env.CLIENT_ORIGIN}/vendor/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_ORIGIN}/vendor/payment-cancel`,
        });

        // Store the session ID on the vendor
        vendor.stripeSessionId = session.id;
        await vendor.save();

        return res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (err) {
        console.error("Stripe session error:", err.message);
        return res.status(500).json({ message: err.message || "Server error" });
    }
};

/* ───────────────────────────────────────────
   POST /api/payments/create-hotel-checkout-session
   Body: { hotelId }
   ─────────────────────────────────────────── */
exports.createHotelCheckoutSession = async (req, res) => {
    try {
        const { hotelId } = req.body;
        if (!hotelId) return res.status(400).json({ message: "hotelId is required" });

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });
        if (hotel.paid) return res.status(400).json({ message: "Hotel has already paid" });

        const amount = Number(process.env.STRIPE_PRICE_AMOUNT) || 1200; // same as vendor fee

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Hotel Registration — ${hotel.hotelName}`,
                        description: `Listing fee for ${hotel.hotelName}, ${hotel.city}`,
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            metadata: { hotelId: hotel._id.toString(), type: "hotel_registration" },
            success_url: `${process.env.CLIENT_ORIGIN}/vendor/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.CLIENT_ORIGIN}/vendor/payment-cancel`,
        });

        hotel.stripeSessionId = session.id;
        await hotel.save();

        return res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (err) {
        console.error("Hotel Stripe session error:", err.message);
        return res.status(500).json({ message: err.message || "Server error" });
    }
};

/* ───────────────────────────────────────────
   POST /api/payments/create-trip-checkout-session
   ─────────────────────────────────────────── */
exports.createTripCheckoutSession = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.subscriptionStatus === "paid") {
            return res.status(400).json({ message: "User is already subscribed to paid tier" });
        }

        const amount = 500; // 500 cents = $5

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Trip Mate Premium Subscription`,
                            description: `Unlimited Trips for ${user.name}`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            metadata: { userId: user._id.toString(), type: "trip_subscription" },
            customer_email: user.email,
            success_url: `${process.env.CLIENT_ORIGIN}/trip-payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_ORIGIN}/`,
        });

        return res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (err) {
        console.error("Stripe session error:", err.message);
        return res.status(500).json({ message: err.message || "Server error" });
    }
};


/* ───────────────────────────────────────────
   POST /api/payments/webhook
   Stripe webhook — raw body required
   ─────────────────────────────────────────── */
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, // raw buffer
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("⚠️  Webhook signature failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const vendorId = session.metadata?.vendorId;

        if (vendorId) {
            try {
                const vendor = await Vendor.findById(vendorId);
                if (vendor && !vendor.paid) {
                    vendor.paid = true;
                    vendor.status = "pending_approval";
                    vendor.paymentIntentId = session.payment_intent || session.id;
                    await vendor.save();

                    // Send admin email (fire-and-forget, don't block webhook response)
                    sendVendorRegistrationEmail(vendor, vendor.paymentIntentId).catch(
                        (e) => console.error("Email send failed:", e.message)
                    );

                    console.log(`✅ Vendor ${vendorId} marked as paid`);
                }
            } catch (err) {
                console.error("Webhook DB update error:", err.message);
            }
        }

        const userId = session.metadata?.userId;
        const type = session.metadata?.type;
        if (type === "trip_subscription" && userId) {
            try {
                const user = await User.findById(userId);
                if (user && user.subscriptionStatus !== "paid") {
                    user.subscriptionStatus = "paid";
                    await user.save();
                    console.log(`✅ User ${userId} upgraded to paid`);
                }
            } catch (err) {
                console.error("Webhook DB update error:", err.message);
            }
        }

        // Hotel registration payment
        const hotelId = session.metadata?.hotelId;
        if (type === "hotel_registration" && hotelId) {
            try {
                const hotel = await Hotel.findById(hotelId);
                if (hotel && !hotel.paid) {
                    hotel.paid = true;
                    hotel.status = "pending_approval";
                    hotel.paymentIntentId = session.payment_intent || session.id;
                    await hotel.save();
                    console.log(`✅ Hotel ${hotelId} marked as paid`);
                }
            } catch (err) {
                console.error("Webhook hotel DB update error:", err.message);
            }
        }
    }

    // Always acknowledge receipt
    res.json({ received: true });
};

/* ───────────────────────────────────────────
   GET /api/payments/success?session_id=...
   Verifies the Stripe session and marks the
   vendor as paid (webhook fallback).
   ─────────────────────────────────────────── */
exports.paymentSuccess = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) {
            return res.status(400).json({ message: "session_id query param is required" });
        }

        // 1. Retrieve the Checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== "paid") {
            return res.status(402).json({ message: "Payment not completed yet" });
        }

        const type = session.metadata?.type;
        if (type === "trip_subscription") {
            const userId = session.metadata?.userId;
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "User not found" });

            if (user.subscriptionStatus !== "paid") {
                user.subscriptionStatus = "paid";
                await user.save();
                console.log(`✅ User ${userId} upgraded to paid (success-page fallback)`);
            }
            return res.status(200).json({
                message: "Payment successful! Your account is upgraded.",
                user: { id: user._id, name: user.name, subscriptionStatus: user.subscriptionStatus }
            });
        }

        // 2. Find the vendor linked to this session
        const vendorId = session.metadata?.vendorId;
        const vendor = vendorId
            ? await Vendor.findById(vendorId)
            : await Vendor.findOne({ stripeSessionId: session_id });

        // Hotel registration fallback
        const hotelId = session.metadata?.hotelId;
        const sType   = session.metadata?.type;
        if (sType === "hotel_registration" && hotelId) {
            const hotel = await Hotel.findById(hotelId);
            if (!hotel) return res.status(404).json({ message: "Hotel not found" });
            if (!hotel.paid) {
                hotel.paid = true;
                hotel.status = "pending_approval";
                hotel.paymentIntentId = session.payment_intent || session.id;
                await hotel.save();
                console.log(`✅ Hotel ${hotel._id} marked as paid (success-page fallback)`);
            }
            return res.status(200).json({
                message: "Payment successful! Your hotel registration is under review.",
                hotel: { id: hotel._id, hotelName: hotel.hotelName, city: hotel.city, status: hotel.status, paid: hotel.paid },
            });
        }

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found for this session" });
        }

        // 3. Mark as paid if not already (webhook fallback)
        if (!vendor.paid) {
            vendor.paid = true;
            vendor.status = "pending_approval";
            vendor.paymentIntentId = session.payment_intent || session.id;
            await vendor.save();

            // Fire-and-forget admin email
            sendVendorRegistrationEmail(vendor, vendor.paymentIntentId).catch((e) =>
                console.error("Email send failed:", e.message)
            );
            console.log(`✅ Vendor ${vendor._id} marked as paid (success-page fallback)`);
        }

        return res.status(200).json({
            message: "Payment successful! Your registration is under review.",
            vendor: {
                id: vendor._id,
                companyName: vendor.companyName,
                email: vendor.email,
                status: vendor.status,
                paid: vendor.paid,
            },
        });
    } catch (err) {
        console.error("Payment success verification error:", err.message);
        return res.status(500).json({ message: err.message || "Server error" });
    }
};

/* ───────────────────────────────────────────
   GET /api/payments/cancel
   ─────────────────────────────────────────── */
exports.paymentCancel = (req, res) => {
    return res.status(200).json({
        message:
            "Payment was cancelled. You can retry by calling create-checkout-session again.",
    });
};
