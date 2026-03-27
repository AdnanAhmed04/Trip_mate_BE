const User = require("../models/User");
const Vendor = require("../models/Vendor");
const SecurityLog = require("../models/SecurityLog");
const { logSecurityEvent } = require("../services/loggingService");
const { sendVendorApprovalEmail, sendVendorRejectionEmail } = require("../services/emailService");

exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    const total = vendors.length;
    const pending = vendors.filter(v => v.status === "pending_approval" || !v.status).length;
    const approved = vendors.filter(v => v.status === "approved" || v.paid).length;
    const rejected = vendors.filter(v => v.status === "rejected" || v.blocked).length;

    res.json({
      stats: { total, pending, approved, rejected },
      vendors
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-passwordHash");
    const filteredUsers = users.filter(u => u.email !== "admin@gmail.com");
    const total = filteredUsers.length;
    const paid = filteredUsers.filter(u => u.subscriptionStatus === "paid").length;
    const free = filteredUsers.filter(u => u.subscriptionStatus === "free").length;

    res.json({
      stats: { total, paid, free },
      users: filteredUsers
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getCalculations = async (req, res) => {
  try {
    const vendors = await Vendor.find({ paid: true });
    const users = await User.find({ subscriptionStatus: "paid" });

    const paidVendorsCount = vendors.length;
    const paidUsersCount = users.filter(u => u.email !== "admin@gmail.com").length;

    const vendorRevenue = paidVendorsCount * 99; 
    const userRevenue = paidUsersCount * 19;

    res.json({
      vendorStats: {
        paidCount: paidVendorsCount,
        revenue: vendorRevenue,
        vendors
      },
      userStats: {
        paidCount: paidUsersCount,
        revenue: userRevenue,
        users: users.filter(u => u.email !== "admin@gmail.com").map(u => ({ _id: u._id, name: u.name, email: u.email, subscriptionStatus: u.subscriptionStatus }))
      },
      totalRevenue: vendorRevenue + userRevenue
    });

  } catch (error) {
    console.error("Error fetching calculations:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    await logSecurityEvent({
      actor: req.user.email,
      action: "VENDOR_DELETED",
      target: req.params.id,
      severity: "WARN",
      req
    });
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.renewVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: "approved", paid: true, blocked: false },
      { new: true }
    );
    
    if (vendor) {
      await logSecurityEvent({
        actor: req.user.email,
        action: "VENDOR_APPROVED",
        target: req.params.id,
        severity: "INFO",
        req
      });
      try {
        await sendVendorApprovalEmail(vendor);
        res.json({ message: "Vendor approved and notified successfully", vendor });
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        res.json({ 
          message: "Vendor approved in database, but email notification failed. Please check your SMTP settings in .env", 
          vendor,
          emailWarn: true 
        });
      }
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  } catch (error) {
    console.error("Error renewing vendor:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await logSecurityEvent({
      actor: req.user.email,
      action: "USER_DELETED",
      target: req.params.id,
      severity: "WARN",
      req
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.renewUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionStatus: "paid" },
      { new: true }
    );
    await logSecurityEvent({
      actor: req.user.email,
      action: "USER_RENEWED",
      target: req.params.id,
      severity: "INFO",
      req
    });
    res.json({ message: "User subscription renewed successfully", user });
  } catch (error) {
    console.error("Error renewing user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ logs });
  } catch (error) {
    console.error("Error fetching security logs:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { status: "rejected", blocked: true },
      { new: true }
    );

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
 
    await logSecurityEvent({
      actor: req.user.email,
      action: "VENDOR_REJECTED",
      target: id,
      severity: "WARN",
      req
    });

    // Send Rejection Email
    try {
      await sendVendorRejectionEmail(vendor, reason);
      res.json({ message: "Vendor rejected and notified", vendor });
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      res.json({ 
        message: "Vendor rejected in database, but email notification failed. Please check your SMTP settings in .env", 
        vendor,
        emailWarn: true 
      });
    }
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
