const mongoose = require("mongoose");

const securityLogSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true }, // Email or ID of admin/user
    action: { type: String, required: true }, // e.g. "VENDOR_DELETED", "LOGIN_SUCCESS"
    target: { type: String, default: "system" }, // Affected entity ID or name
    severity: { 
      type: String, 
      enum: ["INFO", "WARN", "CRITICAL"], 
      default: "INFO" 
    },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SecurityLog", securityLogSchema);
