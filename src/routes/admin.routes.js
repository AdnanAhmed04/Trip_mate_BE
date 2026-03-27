const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logSecurityEvent } = require("../services/loggingService");

const authAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user || user.email !== "admin@gmail.com") {
        await logSecurityEvent({
            actor: user ? user.email : "unknown",
            action: "UNAUTHORIZED_ADMIN_ACCESS",
            severity: "CRITICAL",
            details: { reason: "Not an admin" },
            req
        });
        return res.status(403).json({ message: "Forbidden: Not an admin" });
    }

    req.user = user;
    next();
  } catch (error) {
    await logSecurityEvent({
        actor: "unauthenticated",
        action: "INVALID_TOKEN",
        severity: "WARN",
        details: { error: error.message },
        req
    });
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

router.use(authAdmin);

router.get("/vendors", adminController.getVendors);
router.get("/users", adminController.getUsers);
router.get("/calculations", adminController.getCalculations);

router.delete("/vendors/:id", adminController.deleteVendor);
router.post("/vendors/:id/renew", adminController.renewVendor);
router.post("/vendors/:id/reject", adminController.rejectVendor);
router.delete("/users/:id", adminController.deleteUser);
router.post("/users/:id/renew", adminController.renewUser);
router.get("/security-logs", adminController.getSecurityLogs);

module.exports = router;
