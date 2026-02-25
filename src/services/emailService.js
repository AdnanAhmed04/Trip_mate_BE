const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send vendor registration details + payment reference to admin.
 * @param {Object} vendor  – Mongoose vendor document
 * @param {String} paymentRef – Stripe payment intent / session ID
 */
async function sendVendorRegistrationEmail(vendor, paymentRef) {
    const adminEmail = process.env.ADMIN_EMAIL || "adnanahmedb7208@gmail.com";

    const branchRows = (vendor.branches || [])
        .map(
            (b) =>
                `<tr><td>${b.name}</td><td>${b.location}</td><td>${b.phone}</td></tr>`
        )
        .join("");

    const baseUrl = process.env.CLIENT_ORIGIN || "http://localhost:5000";

    const html = `
  <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
    <div style="background:#1a73e8;color:#fff;padding:20px 24px;">
      <h2 style="margin:0;">🆕 New Vendor Registration</h2>
    </div>
    <div style="padding:20px 24px;">

      <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Company Details</h3>
      <table style="width:100%;border-collapse:collapse;" cellpadding="6">
        <tr><td><strong>Company Name</strong></td><td>${vendor.companyName}</td></tr>
        <tr><td><strong>Vendor Type</strong></td><td>${vendor.vendorType}</td></tr>
        <tr><td><strong>Email</strong></td><td>${vendor.email}</td></tr>
        <tr><td><strong>City</strong></td><td>${vendor.city || "—"}</td></tr>
        <tr><td><strong>Budget Range</strong></td><td>$${vendor.budgetMin} – $${vendor.budgetMax}</td></tr>
        <tr><td><strong>About Us</strong></td><td>${vendor.aboutUs}</td></tr>
        <tr><td><strong>Special Offer</strong></td><td>${vendor.specialOffer || "—"}</td></tr>
      </table>

      <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Services</h3>
      <p>${(vendor.services || []).join(", ") || "—"}</p>
      ${vendor.customServices?.length
            ? `<p><strong>Custom:</strong> ${vendor.customServices.join(", ")}</p>`
            : ""
        }

      ${branchRows
            ? `
      <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Branches</h3>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;" cellpadding="6">
        <thead style="background:#f5f5f5;"><tr><th>Name</th><th>Location</th><th>Phone</th></tr></thead>
        <tbody>${branchRows}</tbody>
      </table>`
            : ""
        }

      <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Logo</h3>
      <p>
        ${vendor.logoUrl
            ? `<a href="${baseUrl}${vendor.logoUrl}">${baseUrl}${vendor.logoUrl}</a>`
            : "No logo uploaded"
        }
      </p>

      <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Payment</h3>
      <table style="width:100%;border-collapse:collapse;" cellpadding="6">
        <tr><td><strong>Payment Status</strong></td><td style="color:green;font-weight:bold;">✅ PAID</td></tr>
        <tr><td><strong>Transaction / Reference ID</strong></td><td><code>${paymentRef}</code></td></tr>
      </table>

      <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Meta</h3>
      <table style="width:100%;border-collapse:collapse;" cellpadding="6">
        <tr><td><strong>Vendor ID</strong></td><td>${vendor._id}</td></tr>
        <tr><td><strong>Status</strong></td><td>${vendor.status}</td></tr>
        <tr><td><strong>Registered At</strong></td><td>${vendor.createdAt}</td></tr>
      </table>

    </div>
    <div style="background:#f9f9f9;padding:12px 24px;text-align:center;color:#888;font-size:12px;">
      TripMate Vendor Registration System
    </div>
  </div>`;

    await transporter.sendMail({
        from: `"TripMate Admin" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Vendor Registration: ${vendor.companyName}`,
        html,
    });

    console.log(`📧 Admin email sent for vendor ${vendor._id}`);
}

module.exports = { sendVendorRegistrationEmail };
