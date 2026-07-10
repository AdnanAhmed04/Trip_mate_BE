/**
 * Seed script — inserts trusted Karachi-based travel vendors into the database.
 * Run:  node scripts/seedVendors.js   (from the BE root)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Vendor = require("../src/models/Vendor");

const VENDORS = [
  {
    companyName: "Holidays Maker",
    vendorType: "Travel Agency",
    email: "info@holidaysmaker.pk",
    phone: "+92 313 2864885",
    aboutUs:
      "One of the best travel agencies in Karachi, Pakistan. We specialize in domestic and international tour packages, visa assistance, airline ticketing, and custom holiday planning. With years of trusted service, we make your dream vacations a reality.",
    services: ["Tour Packages", "Visa Assistance", "Airline Ticketing", "Hotel Booking", "Honeymoon Packages"],
    customServices: ["Corporate Travel", "Umrah Packages"],
    branches: [
      { name: "Head Office", location: "Karachi", phone: "+92 313 2864885" },
    ],
    serviceLocations: ["Karachi", "Dubai", "Malaysia", "Turkey", "Thailand", "Northern Pakistan"],
    city: "Karachi",
    budgetMin: 150,
    budgetMax: 3000,
    specialOffer: "20% off on family holiday packages booked this month!",
    logoUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
  {
    companyName: "Umair Travels",
    vendorType: "Travel Agency",
    email: "info@umairtravels.pk",
    phone: "+92 317 2754873",
    aboutUs:
      "Established travel agency based in Gulshan-e-Iqbal, Karachi. We provide complete travel solutions including domestic & international ticketing, visa processing, Hajj & Umrah packages, and customized tour planning. GL# 3224 certified with years of trusted service across Pakistan.",
    services: ["Airline Ticketing", "Visa Processing", "Hajj & Umrah", "Tour Packages", "Hotel Booking"],
    customServices: ["Corporate Travel Management", "Group Pilgrimages"],
    branches: [
      { name: "Gulshan-e-Iqbal Office", location: "Gulshan-e-Iqbal, Karachi", phone: "+92 317 2754873" },
    ],
    serviceLocations: ["Karachi", "Saudi Arabia", "UAE", "Turkey", "Malaysia"],
    city: "Karachi",
    budgetMin: 100,
    budgetMax: 4000,
    specialOffer: "Special Umrah packages starting from PKR 250,000 — limited slots!",
    logoUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
  {
    companyName: "Skyline Travels (Pvt) Ltd",
    vendorType: "Travel Agency",
    email: "info@skylinetravels.pk",
    phone: "+92 316 2484348",
    aboutUs:
      "Where imagination takes flight! Skyline Travels is a registered private limited company offering premium travel services. From international flights to complete holiday packages, cruise bookings to visa assistance — we turn your travel dreams into reality with competitive rates and reliable service.",
    services: ["International Flights", "Holiday Packages", "Cruise Booking", "Visa Assistance", "Travel Insurance"],
    customServices: ["Luxury Travel", "Honeymoon Destinations"],
    branches: [
      { name: "New Town Office", location: "New Town, Karachi", phone: "+92 316 2484348" },
    ],
    serviceLocations: ["Karachi", "Dubai", "Europe", "Far East", "Maldives"],
    city: "Karachi",
    budgetMin: 150,
    budgetMax: 5000,
    specialOffer: "Book a Europe tour package and get travel insurance free!",
    logoUrl: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
  {
    companyName: "HikeWhiz Travel & Tours",
    vendorType: "Adventure & Trekking",
    email: "info@hikewhiz.com",
    phone: "+92 318 8397656",
    aboutUs:
      "Adventure travel specialists based in Karachi. We organize hiking expeditions, trekking tours, camping trips, and outdoor adventures across Pakistan's breathtaking northern regions. Professional guides, safety gear provided, and small group sizes for an intimate experience.",
    services: ["Hiking Expeditions", "Trekking Tours", "Camping Trips", "Adventure Sports", "Photography Tours"],
    customServices: ["Corporate Team Building Treks", "Winter Expeditions"],
    branches: [
      { name: "Karachi Office", location: "Karachi", phone: "+92 318 8397656" },
      { name: "Northern Base", location: "Gilgit", phone: "+92 317 2589121" },
    ],
    serviceLocations: ["Karachi", "Fairy Meadows", "Hunza", "Skardu", "Deosai", "Neelum Valley"],
    city: "Karachi",
    budgetMin: 150,
    budgetMax: 3500,
    specialOffer: "Free camping gear rental on all 5+ day trekking packages!",
    logoUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    for (const v of VENDORS) {
      const existing = await Vendor.findOne({ email: v.email });
      if (existing) {
        console.log(`↩️  Skipped (already exists): ${v.companyName}`);
        continue;
      }
      await Vendor.create(v);
      console.log(`🏢 Added: ${v.companyName} (${v.city}, ${v.vendorType})`);
    }

    const total = await Vendor.countDocuments();
    console.log(`\n✅ Done. Total vendors in DB: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
