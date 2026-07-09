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

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP Transporter Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
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

  const baseUrl = process.env.CLIENT_ORIGIN;

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
        <tr><td><strong>Vendor ID</strong></td><td>${vendor._id}sasss</td></tr>
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

async function sendVendorApprovalEmail(vendor) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
      <div style="background:#1a73e8;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;">🎉 Application Approved!</h2>
      </div>
      <div style="padding:24px;">
        <h3>Hello ${vendor.companyName},</h3>
        <p>We are excited to inform you that your vendor account has been approved. Your services are now live on the TripMate platform!</p>
        <p><strong>Status:</strong> Approved & Verified</p>
        <br/>
        <p>Thank you for partnering with us.</p>
      </div>
      <div style="background:#f9f9f9;padding:12px 24px;text-align:center;color:#888;font-size:12px;">TripMate Team</div>
    </div>`;

  console.log(`📨 Attempting to send approval email to: ${vendor.email}`);
  await transporter.sendMail({
    from: `"TripMate Admin" <${process.env.SMTP_USER}>`,
    to: vendor.email,
    subject: `Application Approved: ${vendor.companyName}`,
    html,
  });
  console.log(`✅ Approval email successfully sent to: ${vendor.email}`);
}

async function sendVendorRejectionEmail(vendor, reason) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
      <div style="background:#d93025;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;">Vendor Application Update</h2>
      </div>
      <div style="padding:24px;">
        <h3>Hello ${vendor.companyName},</h3>
        <p>Thank you for your interest in TripMate. After reviewing your application, we are unable to approve your request at this time.</p>
        <div style="background:#fff3f3; border-left:4px solid #d93025; padding:12px; margin:16px 0;">
          <strong>Reason for rejection:</strong><br/>
          ${reason || "Does not meet our current provider criteria."}
        </div>
        <p>If you believe this is a mistake, you can reply to this email to provide more information.</p>
      </div>
      <div style="background:#f9f9f9;padding:12px 24px;text-align:center;color:#888;font-size:12px;">TripMate Team</div>
    </div>`;

  console.log(`📨 Attempting to send rejection email to: ${vendor.email}`);
  await transporter.sendMail({
    from: `"TripMate Admin" <${process.env.SMTP_USER}>`,
    to: vendor.email,
    subject: `Update Regarding Your Application: ${vendor.companyName}`,
    html,
  });
  console.log(`✅ Rejection email successfully sent to: ${vendor.email}`);
}

async function sendHotelBookingEmail(booking, hotel, user) {
  const adminEmail = process.env.ADMIN_EMAIL || "adnanahmedb7208@gmail.com";

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
      <div style="background:#1a73e8;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;">🏨 New Hotel Booking Request</h2>
      </div>
      <div style="padding:20px 24px;">
        <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Hotel</h3>
        <table style="width:100%;border-collapse:collapse;" cellpadding="6">
          <tr><td><strong>Hotel</strong></td><td>${hotel.hotelName}</td></tr>
          <tr><td><strong>City</strong></td><td>${hotel.city}</td></tr>
          <tr><td><strong>Price / Night</strong></td><td>$${hotel.pricePerNight}</td></tr>
        </table>

        <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Guest</h3>
        <table style="width:100%;border-collapse:collapse;" cellpadding="6">
          <tr><td><strong>Name</strong></td><td>${booking.contactName || "—"}</td></tr>
          <tr><td><strong>Email</strong></td><td>${booking.contactEmail || "—"}</td></tr>
          <tr><td><strong>Guests</strong></td><td>${booking.guests}</td></tr>
          <tr><td><strong>Check-in</strong></td><td>${fmtDate(booking.checkIn)}</td></tr>
          <tr><td><strong>Check-out</strong></td><td>${fmtDate(booking.checkOut)}</td></tr>
          <tr><td><strong>Nights</strong></td><td>${booking.nights}</td></tr>
          <tr><td><strong>Estimated Total</strong></td><td>$${booking.estimatedTotal}</td></tr>
          <tr><td><strong>Notes</strong></td><td>${booking.notes || "—"}</td></tr>
        </table>

        <p style="margin-top:16px;color:#555;">Please review and confirm this reservation.</p>
      </div>
      <div style="background:#f9f9f9;padding:12px 24px;text-align:center;color:#888;font-size:12px;">
        TripMate Hotel Booking System
      </div>
    </div>`;

  // Send to the hotel (if it has an email) and always CC the admin
  const recipients = [adminEmail];
  if (hotel.email) recipients.push(hotel.email);

  await transporter.sendMail({
    from: `"TripMate Bookings" <${process.env.SMTP_USER}>`,
    to: recipients.join(","),
    subject: `New Booking Request: ${hotel.hotelName}`,
    html,
  });

  console.log(`📧 Booking email sent for hotel ${hotel._id}`);
}

async function sendBookingConfirmedEmail(booking, hotel, userEmail) {
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
      <div style="background:#16a34a;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;">🎉 Booking Confirmed!</h2>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;">Hello <strong>${booking.contactName}</strong>,</p>
        <p>Great news! Your hotel reservation has been <strong style="color:#16a34a;">confirmed</strong>. Here are your booking details:</p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
          <h3 style="margin:0 0 12px;color:#15803d;">📋 Booking Summary</h3>
          <table style="width:100%;border-collapse:collapse;" cellpadding="8">
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;width:40%">Booking ID</td><td><code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${booking._id}</code></td></tr>
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;">Hotel</td><td><strong>${hotel.hotelName}</strong></td></tr>
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;">City</td><td>${hotel.city}</td></tr>
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;">Address</td><td>${hotel.address || "—"}</td></tr>
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;">Check-in</td><td>${fmtDate(booking.checkIn)}</td></tr>
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;">Check-out</td><td>${fmtDate(booking.checkOut)}</td></tr>
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;">Nights</td><td>${booking.nights}</td></tr>
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;">Guests</td><td>${booking.guests}</td></tr>
            <tr style="border-bottom:1px solid #dcfce7;"><td style="color:#6b7280;">Price / Night</td><td>$${hotel.pricePerNight}</td></tr>
            <tr><td style="color:#6b7280;">Estimated Total</td><td><strong style="color:#15803d;font-size:18px;">$${booking.estimatedTotal}</strong></td></tr>
          </table>
        </div>

        <p style="color:#6b7280;">If you have any questions, reply to this email or contact the hotel directly.</p>
        <p>Safe travels! ✈️</p>
      </div>
      <div style="background:#f9f9f9;padding:12px 24px;text-align:center;color:#888;font-size:12px;">TripMate Hotel Booking System</div>
    </div>`;

  await transporter.sendMail({
    from: `"TripMate Bookings" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `✅ Booking Confirmed: ${hotel.hotelName}`,
    html,
  });
  console.log(`📧 Booking confirmation sent to ${userEmail}`);
}

async function sendBookingRejectedEmail(booking, hotel, userEmail, reason) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
      <div style="background:#dc2626;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;">Booking Update</h2>
      </div>
      <div style="padding:24px;">
        <p style="font-size:16px;">Hello <strong>${booking.contactName}</strong>,</p>
        <p>We regret to inform you that your booking request for <strong>${hotel.hotelName}</strong> could not be confirmed at this time.</p>

        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px;margin:16px 0;border-radius:4px;">
          <strong>Reason:</strong><br/>
          ${reason || "The hotel is unable to accommodate your request for the selected dates."}
        </div>

        <h3 style="border-bottom:1px solid #eee;padding-bottom:8px;">Booking Details</h3>
        <table style="width:100%;border-collapse:collapse;" cellpadding="6">
          <tr><td style="color:#6b7280;">Hotel</td><td>${hotel.hotelName}, ${hotel.city}</td></tr>
          <tr><td style="color:#6b7280;">Booking ID</td><td><code>${booking._id}</code></td></tr>
        </table>

        <p style="margin-top:16px;">You can browse other available hotels in your trip plan and try again.</p>
      </div>
      <div style="background:#f9f9f9;padding:12px 24px;text-align:center;color:#888;font-size:12px;">TripMate Hotel Booking System</div>
    </div>`;

  await transporter.sendMail({
    from: `"TripMate Bookings" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Booking Update: ${hotel.hotelName}`,
    html,
  });
  console.log(`📧 Booking rejection sent to ${userEmail}`);
}

module.exports = { 
  sendVendorRegistrationEmail, 
  sendVendorApprovalEmail, 
  sendVendorRejectionEmail,
  sendHotelBookingEmail,
  sendBookingConfirmedEmail,
  sendBookingRejectedEmail
};
