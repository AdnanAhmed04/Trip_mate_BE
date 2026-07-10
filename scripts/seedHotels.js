/**
 * Seed script — inserts 5 real, approved hotels into the database.
 * Run:  node scripts/seedHotels.js   (from the BE root)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("../src/models/Hotel");

const HOTELS = [
  {
    hotelName: "Pearl Continental Lahore",
    email: "reservations@pclahore.com",
    phone: "+92 42 111 505 505",
    city: "Lahore",
    address: "Shahrah-e-Quaid-e-Azam, Lahore, Pakistan",
    description:
      "A landmark 5-star hotel in the heart of Lahore, offering elegant rooms, multiple fine-dining restaurants, a spa, and easy access to the historic old city and business district.",
    pricePerNight: 180,
    budgetCategory: "luxury",
    amenities: ["Free WiFi", "Swimming Pool", "Spa", "Fine Dining", "Gym", "Airport Shuttle"],
    rating: 4.6,
    logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 31.5545, lng: 74.3436 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Faletti's Hotel Lahore",
    email: "info@falettishotel.com",
    phone: "+92 42 3636 3660",
    city: "Lahore",
    address: "Egerton Road, Lahore, Pakistan",
    description:
      "A charming heritage hotel blending colonial architecture with modern comfort. Comfortable mid-range rooms, a cozy cafe, and a central location near Mall Road.",
    pricePerNight: 90,
    budgetCategory: "mid",
    amenities: ["Free WiFi", "Restaurant", "Room Service", "Parking", "Business Center"],
    rating: 4.3,
    logoUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 31.5606, lng: 74.3294 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Serena Hotel Islamabad",
    email: "reservations@serena.com.pk",
    phone: "+92 51 111 133 133",
    city: "Islamabad",
    address: "Khayaban-e-Suhrawardy, G-5, Islamabad, Pakistan",
    description:
      "A luxurious 5-star retreat nestled in the Margalla Hills, offering world-class hospitality, award-winning cuisine, lush gardens, and panoramic mountain views. Perfect for both leisure and business travelers.",
    pricePerNight: 220,
    budgetCategory: "luxury",
    amenities: ["Free WiFi", "Swimming Pool", "Spa", "Fine Dining", "Gym", "Conference Rooms", "Garden"],
    rating: 4.7,
    logoUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 33.7215, lng: 73.0900 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Hunza Serena Inn",
    email: "hunza@serena.com.pk",
    phone: "+92 581 245 0004",
    city: "Hunza",
    address: "Karimabad, Hunza Valley, Gilgit-Baltistan, Pakistan",
    description:
      "A serene mountain retreat with breathtaking views of Rakaposhi peak and the ancient Baltit Fort. Traditional stone architecture with modern amenities, organic dining, and guided trekking experiences.",
    pricePerNight: 120,
    budgetCategory: "mid",
    amenities: ["Free WiFi", "Mountain Views", "Restaurant", "Guided Treks", "Heating", "Parking"],
    rating: 4.5,
    logoUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 36.3167, lng: 74.6600 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Shangrila Resort Skardu",
    email: "info@shangrila-resort.com",
    phone: "+92 58 450 2586",
    city: "Skardu",
    address: "Lower Kachura Lake, Skardu, Gilgit-Baltistan, Pakistan",
    description:
      "Famous as 'Heaven on Earth', this iconic resort sits beside the crystal-clear Lower Kachura Lake surrounded by towering mountains. Features unique aircraft-shaped restaurant, lakeside cottages, and stunning natural beauty.",
    pricePerNight: 150,
    budgetCategory: "mid",
    amenities: ["Lake View", "Restaurant", "Boating", "Garden", "Parking", "Room Service"],
    rating: 4.4,
    logoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 35.3370, lng: 75.5511 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Luxus Grand Hotel Lahore",
    email: "info@luxusgrand.com",
    phone: "+92 42 3577 8899",
    city: "Lahore",
    address: "4 Egerton Road, Lahore, Pakistan",
    description:
      "A budget-friendly modern hotel in Lahore's commercial hub. Clean comfortable rooms, rooftop restaurant with city views, and walking distance to major shopping areas and historic sites.",
    pricePerNight: 45,
    budgetCategory: "cheap",
    amenities: ["Free WiFi", "Restaurant", "Parking", "Room Service", "AC Rooms"],
    rating: 4.0,
    logoUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 31.5560, lng: 74.3460 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Burj Al Arab Jumeirah",
    email: "reservations@burjalarab.com",
    phone: "+971 4 301 7777",
    city: "Dubai",
    address: "Jumeirah St, Umm Suqeim 3, Dubai, UAE",
    description:
      "The iconic sail-shaped luxury hotel on its own private island. All-suite accommodation, personal butlers, world-class restaurants, and breathtaking views of the Arabian Gulf.",
    pricePerNight: 1200,
    budgetCategory: "luxury",
    amenities: ["Private Beach", "Butler Service", "Spa", "Infinity Pool", "Fine Dining", "Free WiFi"],
    rating: 4.9,
    logoUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 25.1412, lng: 55.1853 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Rove Downtown Dubai",
    email: "hello@rovedowntown.com",
    phone: "+971 4 561 9999",
    city: "Dubai",
    address: "312 Al Sikka Road, Downtown Dubai, UAE",
    description:
      "A trendy, budget-friendly hotel steps away from the Dubai Mall and Burj Khalifa. Modern compact rooms, a rooftop pool, 24/7 dining, and a vibrant social vibe.",
    pricePerNight: 70,
    budgetCategory: "cheap",
    amenities: ["Free WiFi", "Rooftop Pool", "Gym", "24/7 Cafe", "Self Laundry"],
    rating: 4.4,
    logoUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 25.1972, lng: 55.2795 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Swat Serena Hotel",
    email: "swat@serena.com.pk",
    phone: "+92 946 711 640",
    city: "Swat",
    address: "Saidu Sharif Road, Mingora, Swat, Pakistan",
    description:
      "A peaceful retreat in the 'Switzerland of the East'. Surrounded by lush green valleys and snow-capped peaks, this mid-range hotel offers traditional Pashtun hospitality with modern comfort, organic cuisine, and excursion packages.",
    pricePerNight: 95,
    budgetCategory: "mid",
    amenities: ["Free WiFi", "Restaurant", "Garden", "Tour Desk", "Parking", "Heating"],
    rating: 4.3,
    logoUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 34.7500, lng: 72.3500 },
    status: "approved",
    blocked: false,
  },
  {
    hotelName: "Hotel Le Meurice Paris",
    email: "reservations@lemeurice.com",
    phone: "+33 1 44 58 10 10",
    city: "Paris",
    address: "228 Rue de Rivoli, 75001 Paris, France",
    description:
      "A palace hotel facing the Tuileries Garden, combining 18th-century grandeur with contemporary art. Michelin-starred dining, an award-winning spa, and refined Parisian luxury.",
    pricePerNight: 950,
    budgetCategory: "luxury",
    amenities: ["Free WiFi", "Michelin Restaurant", "Spa", "Concierge", "Bar", "Fitness Center"],
    rating: 4.8,
    logoUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    geoCoordinates: { lat: 48.8656, lng: 2.3281 },
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
