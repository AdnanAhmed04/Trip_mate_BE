const jwt = require("jsonwebtoken");
const User = require("../models/User");

function requireAuth(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  console.log("token", token);
  if (!token) return res.status(401).json({ message: "Not authenticated XDDDDDD" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

/**
 * Must be used AFTER requireAuth.
 * Loads the user and ensures they are on the paid plan.
 * Free users get a 403 with an upgrade hint — this is the real
 * server-side gate (frontend hiding the button is not enough).
 */
async function requirePaid(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("subscriptionStatus email");
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.subscriptionStatus !== "paid") {
      return res.status(403).json({
        code: "UPGRADE_REQUIRED",
        message: "Hotel booking is available for paid users only. Please upgrade to book.",
      });
    }

    req.user.email = user.email;
    req.user.subscriptionStatus = user.subscriptionStatus;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { requireAuth, requirePaid };
