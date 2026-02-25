const Vendor = require("../models/Vendor");

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
// POST /api/vendors/register
// ──────────────────────────────────────────
exports.registerVendor = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Company logo is required" });
    }

    const { companyName, vendorType, email, aboutUs, specialOffer = "" } = req.body;

    let services = parseJsonField(req.body.services, req.body.services);
    if (typeof services === "string") {
      services = services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (!Array.isArray(services)) services = [];

    const customServices = parseJsonField(req.body.customServices, []);
    const branches = parseJsonField(req.body.branches, []);

    if (!companyName || !vendorType || !email || !aboutUs) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (services.length < 1) {
      return res.status(400).json({ message: "Select at least 1 service" });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    const vendor = await Vendor.create({
      companyName,
      vendorType,
      email,
      aboutUs,
      specialOffer,
      services,
      customServices: Array.isArray(customServices) ? customServices : [],
      branches: Array.isArray(branches) ? branches : [],
      logoUrl,
      logoFileName: req.file.filename,
      budgetMin: Number(req.body.budgetMin) || 0,
      budgetMax: Number(req.body.budgetMax) || 0,
      city: req.body.city || "",
      paid: false,
      status: "unpaid",
    });

    return res.status(201).json({
      message: "Vendor registration submitted. Please complete payment.",
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        email: vendor.email,
        status: vendor.status,
        paid: vendor.paid,
        logoUrl: vendor.logoUrl,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// GET /api/vendors
// Public listing — only paid & non-blocked
// ──────────────────────────────────────────
exports.getAllVendors = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { paid: true, blocked: false };

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { vendorType: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ total: vendors.length, vendors });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// DELETE /api/vendors/:id
// ──────────────────────────────────────────
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Vendor.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Vendor not found" });

    return res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor id" });
    }
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// GET /api/vendors/filter
// Public — only paid & non-blocked
// ──────────────────────────────────────────
exports.filterVendors = async (req, res) => {
  try {
    const { budget, minBudget, maxBudget, location, name, status } = req.query;

    const filter = { paid: true, blocked: false };
    if (status) filter.status = status;

    if (name) {
      filter.companyName = { $regex: name, $options: "i" };
    }

    if (location) {
      filter.$or = [
        { city: { $regex: location, $options: "i" } },
        { "branches.location": { $regex: location, $options: "i" } },
      ];
    }

    const b = budget ? Number(budget) : null;
    const minB = minBudget ? Number(minBudget) : null;
    const maxB = maxBudget ? Number(maxBudget) : null;

    if (b !== null && !Number.isNaN(b)) {
      filter.budgetMin = { $lte: b };
      filter.budgetMax = { $gte: b };
    } else if (
      (minB !== null && !Number.isNaN(minB)) ||
      (maxB !== null && !Number.isNaN(maxB))
    ) {
      const minVal = minB ?? 0;
      const maxVal = maxB ?? Number.MAX_SAFE_INTEGER;

      filter.$and = [{ budgetMax: { $gte: minVal } }, { budgetMin: { $lte: maxVal } }];
    }

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ total: vendors.length, vendors });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ──────────────────────────────────────────
// PATCH /api/vendors/:id/block
// Admin-only — protected by ADMIN_SECRET
// Query: ?action=block  or  ?action=unblock
// Auth:  Authorization: Bearer <ADMIN_SECRET>
// ──────────────────────────────────────────
exports.adminToggleBlock = async (req, res) => {
  try {
    // Verify admin token
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : req.query.token;

    if (!token || token !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Forbidden — invalid admin token" });
    }

    const { id } = req.params;
    const action = req.query.action || req.body.action;

    if (!["block", "unblock"].includes(action)) {
      return res.status(400).json({ message: 'action must be "block" or "unblock"' });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.blocked = action === "block";
    await vendor.save();

    return res.status(200).json({
      message: `Vendor ${action}ed successfully`,
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        blocked: vendor.blocked,
        status: vendor.status,
      },
    });
  } catch (err) {
    if (err?.name === "CastError") {
      return res.status(400).json({ message: "Invalid vendor id" });
    }
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
