/**
 * Seed more local Pakistani + international hotels.
 * Run: node scripts/seedMoreHotels.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("../src/models/Hotel");

const HOTELS = [
  // ─── MURREE ────────────────────────────────────────
  {
    hotelName: "Lockwood Hotel Murree",
    email: "info@lockwoodmurree.com",
    phone: "+92 51 3410 1234",
    city: "Murree",
    address: "Mall Road, Murree, Punjab, Pakistan",
    description:
      "A cozy hilltop retreat on Murree's famous Mall Road. Enjoy panoramic views of pine-covered hills, warm rooms with fireplaces, and easy access to Pindi Point and Kashmir Point. Perfect for weekend getaways from Islamabad.",
    pricePerNight: 65,
    budgetCategory: "mid",
    amenities: ["Free WiFi", "Heating", "Restaurant", "Parking", "Room Service", "Mountain Views"],
    rating: 4.2,
    logoUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 33.9070, lng: 73.3943 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Shangrila Resort Murree",
    email: "reservations@shangrilamurree.pk",
    phone: "+92 51 3411 5678",
    city: "Murree",
    address: "Barian Road, Murree Hills, Pakistan",
    description:
      "Nestled among tall pine trees with breathtaking valley views. Features spacious family suites, a bonfire area, kids play zone, and an in-house restaurant serving traditional Pakistani cuisine. Ideal for families seeking a peaceful mountain escape.",
    pricePerNight: 85,
    budgetCategory: "mid",
    amenities: ["Free WiFi", "Bonfire Area", "Kids Zone", "Restaurant", "Parking", "Heating"],
    rating: 4.3,
    logoUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 33.9100, lng: 73.3900 },
    status: "approved",
    blocked: false,
  },

  // ─── NARAN / KAGHAN ────────────────────────────────
  {
    hotelName: "Pine Park Hotel Naran",
    email: "booking@pineparknaran.com",
    phone: "+92 997 510 123",
    city: "Naran",
    address: "Main Bazaar Road, Naran, Kaghan Valley, Pakistan",
    description:
      "Located in the heart of Naran with stunning views of the Kunhar River and surrounding mountains. Comfortable rooms, hot water 24/7, and guided trips to Saif-ul-Malook Lake, Lulusar Lake, and Babusar Pass arranged on request.",
    pricePerNight: 55,
    budgetCategory: "cheap",
    amenities: ["Free WiFi", "Hot Water", "Restaurant", "Tour Desk", "Parking", "River Views"],
    rating: 4.1,
    logoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 34.9093, lng: 73.6500 },
    status: "approved",
    blocked: false,
  },

  // ─── SKARDU ────────────────────────────────────────
  {
    hotelName: "Himalaya Hotel Skardu",
    email: "himalaya@hotelskardu.pk",
    phone: "+92 58 450 3456",
    city: "Skardu",
    address: "Airport Road, Skardu, Gilgit-Baltistan, Pakistan",
    description:
      "A comfortable mid-range hotel with spectacular views of the Karakoram Range. Clean spacious rooms, an excellent restaurant serving local Balti cuisine, and tour desk arranging trips to Shangrila, Deosai, and Upper Kachura Lake.",
    pricePerNight: 70,
    budgetCategory: "mid",
    amenities: ["Free WiFi", "Restaurant", "Tour Desk", "Mountain Views", "Parking", "Laundry"],
    rating: 4.2,
    logoUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 35.2971, lng: 75.6333 },
    status: "approved",
    blocked: false,
  },

  // ─── KARACHI ───────────────────────────────────────
  {
    hotelName: "Pearl Continental Karachi",
    email: "reservations@pckarachi.com",
    phone: "+92 21 111 505 505",
    city: "Karachi",
    address: "Club Road, Karachi, Sindh, Pakistan",
    description:
      "The iconic 5-star luxury hotel in the heart of Karachi's business district. World-class dining with 6 restaurants, a rooftop pool, state-of-the-art fitness center, and elegantly designed rooms with sea and city views.",
    pricePerNight: 200,
    budgetCategory: "luxury",
    amenities: ["Swimming Pool", "Fine Dining", "Spa", "Gym", "Free WiFi", "Business Center", "Airport Shuttle"],
    rating: 4.5,
    logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 24.8500, lng: 67.0300 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Ramada Plaza Karachi",
    email: "info@ramadakarachi.pk",
    phone: "+92 21 3568 0000",
    city: "Karachi",
    address: "Civil Lines, Karachi, Pakistan",
    description:
      "A modern 4-star hotel offering comfortable stays at affordable prices. Located near major corporate offices and shopping centers. Features a rooftop lounge, all-day dining, well-equipped gym, and spacious conference rooms.",
    pricePerNight: 90,
    budgetCategory: "mid",
    amenities: ["Free WiFi", "Gym", "Restaurant", "Conference Room", "Room Service", "Parking"],
    rating: 4.1,
    logoUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 24.8607, lng: 67.0100 },
    status: "approved",
    blocked: false,
  },

  // ─── LAHORE ────────────────────────────────────────
  {
    hotelName: "Nishat Hotel Lahore",
    email: "stay@nishathotels.com",
    phone: "+92 42 3576 1234",
    city: "Lahore",
    address: "Gulberg III, Main Boulevard, Lahore, Pakistan",
    description:
      "A premium 5-star property in Lahore's upscale Gulberg area. Features elegantly appointed rooms, multiple fine-dining options, a luxurious spa, infinity pool, and is minutes from Liberty Market and Lahore's cultural landmarks.",
    pricePerNight: 160,
    budgetCategory: "luxury",
    amenities: ["Swimming Pool", "Spa", "Fine Dining", "Free WiFi", "Gym", "Valet Parking", "Concierge"],
    rating: 4.6,
    logoUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 31.5204, lng: 74.3587 },
    status: "approved",
    blocked: false,
  },

  // ─── ISLAMABAD ─────────────────────────────────────
  {
    hotelName: "Marriott Hotel Islamabad",
    email: "reservations@marriottisb.com",
    phone: "+92 51 2826 121",
    city: "Islamabad",
    address: "Aga Khan Road, Shalimar 5, Islamabad, Pakistan",
    description:
      "A landmark luxury hotel set against the Margalla Hills. Offers sophisticated rooms, award-winning restaurants, outdoor pool, tennis courts, and a world-class spa. Ideal for business and leisure travelers in the capital.",
    pricePerNight: 190,
    budgetCategory: "luxury",
    amenities: ["Swimming Pool", "Spa", "Tennis Court", "Fine Dining", "Free WiFi", "Gym", "Business Center"],
    rating: 4.5,
    logoUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 33.7294, lng: 73.0931 },
    status: "approved",
    blocked: false,
  },

  // ─── SWAT ──────────────────────────────────────────
  {
    hotelName: "Rock City Resort Swat",
    email: "info@rockcityswat.pk",
    phone: "+92 946 720 345",
    city: "Swat",
    address: "Kalam Road, Bahrain, Swat Valley, Pakistan",
    description:
      "A riverside resort in the scenic Swat Valley surrounded by lush green mountains. Features cottages with private balconies overlooking the crystal-clear Swat River, an outdoor BBQ area, and guided tours to Mahodand Lake and Ushu Forest.",
    pricePerNight: 75,
    budgetCategory: "mid",
    amenities: ["River Views", "BBQ Area", "Restaurant", "Tour Desk", "Parking", "Heating"],
    rating: 4.3,
    logoUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 35.2100, lng: 72.5500 },
    status: "approved",
    blocked: false,
  },

  // ─── CHITRAL / KALASH ──────────────────────────────
  {
    hotelName: "Hindukush Heights Chitral",
    email: "stay@hindukushheights.com",
    phone: "+92 943 412 567",
    city: "Chitral",
    address: "Shahi Masjid Road, Chitral, KPK, Pakistan",
    description:
      "An eco-luxury retreat with stunning views of Tirich Mir peak. Built with local materials and traditional Chitrali architecture, it offers organic farm-to-table dining, cultural evenings, and guided trips to the Kalash Valley and Shandur Pass.",
    pricePerNight: 110,
    budgetCategory: "mid",
    amenities: ["Organic Dining", "Cultural Programs", "Tour Desk", "Mountain Views", "Garden", "Free WiFi"],
    rating: 4.6,
    logoUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 35.8518, lng: 71.7864 },
    status: "approved",
    blocked: false,
  },

  // ─── NEELUM VALLEY / AJK ──────────────────────────
  {
    hotelName: "Neelum Valley Resort",
    email: "booking@neelumresort.pk",
    phone: "+92 58 644 1234",
    city: "Neelum Valley",
    address: "Keran, Neelum Valley, Azad Kashmir, Pakistan",
    description:
      "A tranquil riverside resort in the heart of Neelum Valley with breathtaking views of the Neelum River and snow-capped peaks. Wooden cottages, campfire evenings, and access to Ratti Gali Lake and Sharda treks.",
    pricePerNight: 50,
    budgetCategory: "cheap",
    amenities: ["River Views", "Campfire", "Restaurant", "Trekking", "Parking", "Hot Water"],
    rating: 4.0,
    logoUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 34.7930, lng: 74.3900 },
    status: "approved",
    blocked: false,
  },

  // ═══════════════════════════════════════════════════
  // INTERNATIONAL HOTELS
  // ═══════════════════════════════════════════════════

  // ─── DUBAI ─────────────────────────────────────────
  {
    hotelName: "Atlantis The Palm Dubai",
    email: "reservations@atlantisthepalm.com",
    phone: "+971 4 426 2000",
    city: "Dubai",
    address: "Crescent Road, The Palm Jumeirah, Dubai, UAE",
    description:
      "An iconic ocean-themed resort on the crescent of Palm Jumeirah. Features Aquaventure Waterpark, The Lost Chambers Aquarium, celebrity chef restaurants, an underwater suite, and a private beach with panoramic Arabian Gulf views.",
    pricePerNight: 450,
    budgetCategory: "luxury",
    amenities: ["Private Beach", "Waterpark", "Aquarium", "Fine Dining", "Spa", "Kids Club", "Free WiFi"],
    rating: 4.7,
    logoUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 25.1304, lng: 55.1174 },
    status: "approved",
    blocked: false,
  },

  // ─── ISTANBUL ──────────────────────────────────────
  {
    hotelName: "Four Seasons Sultanahmet Istanbul",
    email: "reservations@fsistanbul.com",
    phone: "+90 212 402 3000",
    city: "Istanbul",
    address: "Tevkifhane Sokak No. 1, Sultanahmet, Istanbul, Turkey",
    description:
      "A luxury hotel housed in a neoclassical Turkish prison turned architectural gem. Steps away from the Blue Mosque, Hagia Sophia, and Grand Bazaar. Offers rooftop dining with Bosphorus views, a full-service spa, and impeccable Turkish hospitality.",
    pricePerNight: 550,
    budgetCategory: "luxury",
    amenities: ["Rooftop Restaurant", "Spa", "Concierge", "Free WiFi", "Gym", "Historic Location"],
    rating: 4.8,
    logoUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 41.0082, lng: 28.9784 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Grand Hyatt Istanbul",
    email: "istanbul@grandhyatt.com",
    phone: "+90 212 368 1234",
    city: "Istanbul",
    address: "Taskisla Caddesi, Taksim, Istanbul, Turkey",
    description:
      "A modern 5-star hotel in the vibrant Taksim district with spectacular Bosphorus views. Features multiple restaurants, a state-of-the-art fitness center, indoor pool, and is perfectly positioned for exploring Istanbul's nightlife and cultural sites.",
    pricePerNight: 280,
    budgetCategory: "luxury",
    amenities: ["Bosphorus Views", "Indoor Pool", "Spa", "Fine Dining", "Free WiFi", "Gym", "Bar"],
    rating: 4.5,
    logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 41.0410, lng: 28.9870 },
    status: "approved",
    blocked: false,
  },

  // ─── BAKU ──────────────────────────────────────────
  {
    hotelName: "JW Marriott Absheron Baku",
    email: "reservations@jwmarriottbaku.com",
    phone: "+994 12 499 8800",
    city: "Baku",
    address: "674 Azadliq Avenue, Baku, Azerbaijan",
    description:
      "A sleek luxury hotel on Baku's waterfront boulevard with views of the Caspian Sea and the iconic Flame Towers. Features an infinity pool, world-class dining, a rejuvenating spa, and easy access to the Old City and modern Baku attractions.",
    pricePerNight: 200,
    budgetCategory: "luxury",
    amenities: ["Infinity Pool", "Spa", "Sea Views", "Fine Dining", "Free WiFi", "Gym", "Concierge"],
    rating: 4.6,
    logoUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 40.3721, lng: 49.8524 },
    status: "approved",
    blocked: false,
  },

  // ─── BANGKOK ───────────────────────────────────────
  {
    hotelName: "Mandarin Oriental Bangkok",
    email: "mobkk@mohg.com",
    phone: "+66 2 659 9000",
    city: "Bangkok",
    address: "48 Oriental Avenue, Bang Rak, Bangkok, Thailand",
    description:
      "A legendary riverside hotel blending Thai heritage with world-class luxury. Famous for its two Michelin-starred restaurants, award-winning spa, cooking school, and lush tropical gardens along the Chao Phraya River.",
    pricePerNight: 380,
    budgetCategory: "luxury",
    amenities: ["Riverside", "Michelin Dining", "Spa", "Pool", "Free WiFi", "Cooking School", "Butler Service"],
    rating: 4.9,
    logoUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 13.7234, lng: 100.5163 },
    status: "approved",
    blocked: false,
  },

  // ─── KUALA LUMPUR ──────────────────────────────────
  {
    hotelName: "Traders Hotel Kuala Lumpur",
    email: "traders@shangri-la.com",
    phone: "+60 3 2332 9888",
    city: "Kuala Lumpur",
    address: "Kuala Lumpur City Centre, 50088, Malaysia",
    description:
      "A stylish 4-star hotel directly facing the iconic Petronas Twin Towers. Features an infinity sky pool on the 33rd floor, modern rooms with floor-to-ceiling windows, and excellent connectivity to KLCC shopping and Bukit Bintang entertainment district.",
    pricePerNight: 120,
    budgetCategory: "mid",
    amenities: ["Sky Pool", "Twin Towers View", "Free WiFi", "Gym", "Restaurant", "City Center"],
    rating: 4.4,
    logoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 3.1569, lng: 101.7123 },
    status: "approved",
    blocked: false,
  },

  // ─── LONDON ────────────────────────────────────────
  {
    hotelName: "The Savoy London",
    email: "savoy@fairmont.com",
    phone: "+44 20 7836 4343",
    city: "London",
    address: "Strand, London WC2R 0EZ, United Kingdom",
    description:
      "One of London's most iconic luxury hotels since 1889. Located on the Strand with Thames river views, featuring Art Deco and Edwardian rooms, Gordon Ramsay's Savoy Grill, an award-winning American Bar, and a classic English afternoon tea experience.",
    pricePerNight: 700,
    budgetCategory: "luxury",
    amenities: ["River Views", "Michelin Restaurant", "Spa", "Gym", "Free WiFi", "Concierge", "Bar"],
    rating: 4.8,
    logoUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 51.5103, lng: -0.1205 },
    status: "approved",
    blocked: false,
  },

  // ─── MALDIVES ──────────────────────────────────────
  {
    hotelName: "Conrad Maldives Rangali Island",
    email: "conrad@maldivesresort.com",
    phone: "+960 668 0629",
    city: "Maldives",
    address: "Rangali Island, South Ari Atoll, Maldives",
    description:
      "A twin-island luxury resort connected by a walkway over turquoise waters. Famous for Ithaa, the world's first underwater restaurant. Features overwater villas, pristine white sand beaches, world-class diving, and a holistic spa retreat.",
    pricePerNight: 900,
    budgetCategory: "luxury",
    amenities: ["Overwater Villa", "Underwater Restaurant", "Private Beach", "Diving", "Spa", "Free WiFi"],
    rating: 4.9,
    logoUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 3.8500, lng: 72.9700 },
    status: "approved",
    blocked: false,
  },

  // ─── SINGAPORE ─────────────────────────────────────
  {
    hotelName: "Marina Bay Sands Singapore",
    email: "reservations@marinabaysands.com",
    phone: "+65 6688 8868",
    city: "Singapore",
    address: "10 Bayfront Avenue, Singapore 018956",
    description:
      "The iconic triple-tower hotel topped by the world-famous SkyPark infinity pool. Offers luxury rooms with city or harbour views, a casino, celebrity chef restaurants, ArtScience Museum, and unparalleled rooftop panoramas of the Singapore skyline.",
    pricePerNight: 500,
    budgetCategory: "luxury",
    amenities: ["Infinity Pool", "Casino", "Fine Dining", "Spa", "Free WiFi", "Shopping Mall", "Museum"],
    rating: 4.7,
    logoUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 1.2834, lng: 103.8607 },
    status: "approved",
    blocked: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    for (const h of HOTELS) {
      const existing = await Hotel.findOne({ email: h.email });
      if (existing) {
        console.log(`↩️  Skipped (already exists): ${h.hotelName}`);
        continue;
      }
      h.images = [h.logoUrl];
      await Hotel.create(h);
      console.log(`🏨 Added: ${h.hotelName} (${h.city}, ${h.budgetCategory})`);
    }

    const total = await Hotel.countDocuments();
    console.log(`\n✅ Done. Total hotels in DB: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
