/**
 * Seed 6 more trusted Karachi/Pakistan-based travel vendors.
 * Run:  node scripts/seedMoreVendors.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Vendor = require("../src/models/Vendor");

const VENDORS = [
  {
    companyName: "Bukhari Travel & Tours",
    vendorType: "Tour Operator",
    email: "info@bukharitravels.pk",
    phone: "+92 321 2345678",
    aboutUs:
      "A well-established tour operator in Karachi with over 15 years of experience. We specialize in Hajj & Umrah packages, international holiday tours, and corporate travel management. IATA accredited and trusted by thousands of families across Pakistan.",
    services: ["Hajj & Umrah", "International Tours", "Corporate Travel", "Visa Services", "Airline Ticketing"],
    customServices: ["VIP Hajj Packages", "Family Group Tours"],
    branches: [
      { name: "Saddar Office", location: "Saddar, Karachi", phone: "+92 321 2345678" },
      { name: "North Nazimabad Branch", location: "North Nazimabad, Karachi", phone: "+92 321 2345678" },
    ],
    serviceLocations: ["Karachi", "Saudi Arabia", "UAE", "Turkey", "Egypt"],
    city: "Karachi",
    budgetMin: 200,
    budgetMax: 4500,
    specialOffer: "Early bird Hajj 2026 packages — reserve your spot with just 50% deposit!",
    logoUrl: "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
  {
    companyName: "Northern Escapades Pakistan",
    vendorType: "Adventure & Trekking",
    email: "explore@northernescapades.pk",
    phone: "+92 333 4567890",
    aboutUs:
      "Specialized adventure travel company focused exclusively on Northern Pakistan. From Fairy Meadows to Deosai Plains, K2 base camp to Attabad Lake — we craft thrilling expeditions with certified mountain guides, safety gear, and small groups for the ultimate experience.",
    services: ["Trekking Tours", "Jeep Safaris", "Camping Expeditions", "Photography Tours", "Winter Sports"],
    customServices: ["K2 Base Camp Trek", "Karakoram Highway Road Trip"],
    branches: [
      { name: "Karachi Booking Office", location: "DHA, Karachi", phone: "+92 333 4567890" },
      { name: "Gilgit Operations Base", location: "Gilgit", phone: "+92 333 4567890" },
    ],
    serviceLocations: ["Hunza", "Skardu", "Fairy Meadows", "Deosai", "Gilgit", "Naltar"],
    city: "Karachi",
    budgetMin: 250,
    budgetMax: 4000,
    specialOffer: "Book a 7-day Northern trip and get a free drone photography session!",
    logoUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
  {
    companyName: "Al-Madina Tours International",
    vendorType: "Tour Operator",
    email: "booking@almadinatours.pk",
    phone: "+92 300 1122334",
    aboutUs:
      "Premier religious and leisure travel operator serving Pakistan since 2005. We are renowned for our premium Umrah packages, Ziyarat tours, and international holiday packages. Our dedicated team ensures a spiritually fulfilling and comfortable journey every time.",
    services: ["Umrah Packages", "Ziyarat Tours", "International Holidays", "Visa Processing", "Hotel Reservations"],
    customServices: ["Ramadan Umrah Special", "Family Ziyarat Package"],
    branches: [
      { name: "Head Office", location: "Gulshan-e-Iqbal, Karachi", phone: "+92 300 1122334" },
    ],
    serviceLocations: ["Karachi", "Makkah", "Madinah", "Iraq", "Iran", "Jordan"],
    city: "Karachi",
    budgetMin: 180,
    budgetMax: 3500,
    specialOffer: "Ramadan Umrah packages with 5-star hotel stay — booking open now!",
    logoUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51571?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
  {
    companyName: "Dreamland Vacations",
    vendorType: "Travel Agency",
    email: "hello@dreamlandvacations.pk",
    phone: "+92 312 9876543",
    aboutUs:
      "Making dream vacations affordable for every Pakistani family. We offer budget-friendly international packages to Baku, Istanbul, Kuala Lumpur, Bangkok, and more. Complete packages including flights, hotels, transfers, and sightseeing — all hassle-free.",
    services: ["Budget Packages", "Family Tours", "Honeymoon Trips", "Flight Booking", "Hotel Deals"],
    customServices: ["Student Travel Packages", "Solo Traveler Deals"],
    branches: [
      { name: "Tariq Road Office", location: "Tariq Road, Karachi", phone: "+92 312 9876543" },
    ],
    serviceLocations: ["Karachi", "Baku", "Istanbul", "Bangkok", "Kuala Lumpur", "Dubai"],
    city: "Karachi",
    budgetMin: 80,
    budgetMax: 2000,
    specialOffer: "Baku 5-day package starting from PKR 135,000 per person — all inclusive!",
    logoUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
  {
    companyName: "Pak Voyagers",
    vendorType: "Tour Operator",
    email: "tours@pakvoyagers.com",
    phone: "+92 345 6789012",
    aboutUs:
      "Domestic travel experts connecting Pakistanis with the beauty of their own country. We organize group tours to Swat, Kumrat, Neelum Valley, Murree, Naran-Kaghan, and coastal Gwadar. Safe, affordable, and unforgettable experiences for families, couples, and solo adventurers.",
    services: ["Domestic Tours", "Group Travel", "Coastal Tours", "Mountain Tours", "Transport Arrangement"],
    customServices: ["Gwadar Beach Trip", "Kumrat Valley Expedition"],
    branches: [
      { name: "Clifton Office", location: "Clifton, Karachi", phone: "+92 345 6789012" },
    ],
    serviceLocations: ["Swat", "Kumrat", "Neelum Valley", "Naran", "Gwadar", "Murree"],
    city: "Karachi",
    budgetMin: 50,
    budgetMax: 1500,
    specialOffer: "Weekend getaway to Gorakh Hill Station — PKR 12,000 per person all-in!",
    logoUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    paid: true,
    status: "approved",
    blocked: false,
  },
  {
    companyName: "Globe Trotters Pakistan",
    vendorType: "Travel Agency",
    email: "info@globetrotterspk.com",
    phone: "+92 322 5544332",
    aboutUs:
      "Modern travel agency catering to the new generation of Pakistani travelers. We specialize in European tours, Schengen visa assistance, cruise packages, and luxury travel planning. Our tech-savvy team provides seamless booking experience with 24/7 support.",
    services: ["European Tours", "Schengen Visa", "Cruise Packages", "Luxury Travel", "Travel Insurance"],
    customServices: ["Swiss Alps Package", "Mediterranean Cruise"],
    branches: [
      { name: "DHA Office", location: "DHA Phase 6, Karachi", phone: "+92 322 5544332" },
    ],
    serviceLocations: ["Karachi", "Switzerland", "France", "Italy", "Spain", "Greece"],
    city: "Karachi",
    budgetMin: 300,
    budgetMax: 8000,
    specialOffer: "Europe 10-day multi-country tour with Schengen visa assistance included!",
    logoUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
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
