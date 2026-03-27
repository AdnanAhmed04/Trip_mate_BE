const SecurityLog = require("../models/SecurityLog");

/**
 * Logs a security event to the database.
 * @param {Object} params
 * @param {string} params.actor - Who performed the action (email/ID)
 * @param {string} params.action - Action name (e.g. VENDOR_DELETED)
 * @param {string} [params.target] - ID of the affected entity
 * @param {string} [params.severity] - INFO, WARN, CRITICAL
 * @param {Object} [params.details] - Additional context
 * @param {Object} [params.req] - Express request object to extract IP/UA
 */
const logSecurityEvent = async ({ actor, action, target, severity = "INFO", details = {}, req }) => {
  try {
    const logData = {
      actor,
      action,
      target,
      severity,
      details,
      ip: req ? req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress : "unknown",
      userAgent: req ? req.headers["user-agent"] : "unknown",
    };

    const log = new SecurityLog(logData);
    await log.save();
    console.log(`[SecurityLog] ${action} by ${actor}`);
  } catch (error) {
    console.error("Failed to save security log:", error);
  }
};

module.exports = { logSecurityEvent };
