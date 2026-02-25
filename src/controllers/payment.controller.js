const Stripe = require("stripe");
const Vendor = require("../models/Vendor");
const { sendVendorRegistrationEmail } = require("../services/emailService");

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

        const amount = Number(process.env.STRIPE_PRICE_AMOUNT) || 5000; // cents

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
            success_url: `${process.env.CLIENT_ORIGIN || "http://localhost:3000"}/vendor/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_ORIGIN || "http://localhost:3000"}/vendor/payment-cancel`,
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

        // 2. Find the vendor linked to this session
        const vendorId = session.metadata?.vendorId;
        const vendor = vendorId
            ? await Vendor.findById(vendorId)
            : await Vendor.findOne({ stripeSessionId: session_id });

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
