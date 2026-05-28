const { GoogleGenerativeAI } = require("@google/generative-ai");
const { fetchImageForQuery } = require("./imageService");
const { generateItineraryWithGroq } = require("./groqService");
const { generateItineraryWithOllama } = require("./ollamaService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // inclusive days
}

async function generateItinerary(destination, totalDays, budgetLevel, travelers, interests = []) {
  const startTime = Date.now();
  console.log("--- DEBUG GENERATE ITINERARY ---");
  console.log("Destination:", destination);
  console.log("Total Days:", totalDays);
  console.log("Budget:", budgetLevel);
  console.log("Travelers:", travelers);
  console.log("Interests Type:", typeof interests);
  console.log("Interests Value:", interests);

  let interestString = "";
  try {
    if (Array.isArray(interests)) {
      interestString = interests.join(", ");
    } else if (interests && typeof interests === 'string') {
      interestString = interests;
    } else {
      interestString = "General Interest";
    }
  } catch (joinErr) {
    console.error("CRASH DURING JOIN:", joinErr);
    interestString = "Error in interests";
  }

  const prompt = `
Create a professional, detailed, realistic, and tourism-friendly travel plan in valid JSON format for the following trip:

Destination: ${destination}
Number of Days: ${totalDays}
Number of Travelers: ${travelers}
Budget Level: ${budgetLevel}
Interests: ${interestString}

Return only a valid JSON object with these top-level keys:
{
  "hotels": [],
  "itinerary": []
}

========================
HOTELS REQUIREMENTS
========================
"hotels" must be an array of recommended hotel options suitable for a ${budgetLevel} budget.

Each hotel object must contain:
{
  "hotelName": string,
  "address": string,
  "price": string,
  "geoCoordinates": { "lat": number, "lng": number },
  "rating": number,
  "description": string,
  "uniqueFeature": string,
  "weather": string,
  "locationLink": string,
  "imageUrl": string,
  "nearbyEmergingBusinesses": [
    {
      "name": string,
      "type": string,
      "description": string,
      "address": string,
      "weather": string,
      "locationLink": string,
      "imageUrl": string
    }
  ]
}

Hotel rules:
- Recommend realistic and relevant hotel options
- Mention what makes each hotel special
- Include nearby new or emerging businesses such as cafes, startup hubs, boutique markets, co-working spaces, art spaces, food streets, or modern shopping places where relevant
- Add a direct map-friendly "locationLink" so when the user clicks it, the place location can be opened
- Add weather for the hotel area
- Add a valid-looking image URL related to the hotel

========================
ITINERARY REQUIREMENTS
========================
"itinerary" must be an array with exactly ${totalDays} items, representing day 1 to day ${totalDays}.

Each day object must contain:
{
  "day": number,
  "dayTitle": string,
  "dayDescription": string,
  "weather": string,
  "uniqueHighlights": [string],
  "morning": [Place],
  "afternoon": [Place],
  "evening": [Place],
  "localTips": [string],
  "estimatedCost": number,
  "dayImage": string
}

Each [Place] object must contain:
{
  "placeName": string,
  "details": string,
  "address": string,
  "geoCoordinates": { "lat": number, "lng": number },
  "locationLink": string,
  "ticketPricing": string,
  "timeToTravel": string,
  "bestTimeToVisit": string,
  "weather": string,
  "uniqueThing": string,
  "imageUrl": string,
  "relatedEmergingBusinesses": [
    {
      "name": string,
      "type": string,
      "description": string,
      "address": string,
      "weather": string,
      "locationLink": string,
      "imageUrl": string
    }
  ]
}

========================
SPECIAL INSTRUCTIONS
========================
1. The itinerary must be realistic, practical, and well-structured.
2. Include real-world places, plausible geo-coordinates, and relevant weather for the destination and each activity place.
3. For every major place, clearly point out its unique thing, specialty, cultural importance, famous food, architecture, local vibe, or signature experience.
4. Include image URLs for hotels, daily overview, and each important place.
5. Include emerging or trending business spots where relevant, such as new cafes, local brands, food markets, creative spaces, shopping areas, and startup-friendly business hubs.
6. The daily plan must flow logically by distance, timing, and traveler comfort.
7. Make sure recommendations match a ${budgetLevel} budget.
8. Every hotel, place, and emerging business must include a clickable "locationLink" that opens its location on map.
9. Every hotel, place, and emerging business must include weather information for that specific area.
10. Ensure the weather values are destination-appropriate and realistic, such as:
   "Sunny, 30-34°C"
   "Cloudy, 22-27°C"
   "Rainy, 18-21°C"
11. STRICT RULE — NO REPEATED PLACES: Every "placeName" across ALL days must be completely unique.
    - Do NOT recommend the same place, attraction, market, shrine, park, or restaurant on more than one day.
    - Each day must feature entirely different locations from every other day.
    - Scan your entire itinerary before finalizing — if any placeName appears more than once, replace the duplicate with a different place.

========================
ARRIVAL DAY RULE
========================
On the first day, the dayDescription paragraph must naturally include:
"Arrival in Lahore & Hotel Check-in"
if the destination is Lahore.

If the destination is any other city, adapt it naturally as:
"Arrival in [Destination] & Hotel Check-in"

This arrival and hotel check-in text must be included inside the dayDescription paragraph, not as a separate field.

========================
LOCATION LINK FORMAT
========================
For every hotel, place, and business, generate the "locationLink" in this format:
https://www.google.com/maps?q=LAT,LNG

Example:
https://www.google.com/maps?q=31.5204,74.3587

========================
OUTPUT RULES
========================
- Return only valid JSON
- Do not include markdown
- Do not include explanations outside JSON
- Do not omit any required fields
- Ensure exactly ${totalDays} itinerary days
`;

  try {
    // --- LLM GENERATION ---
    let json;
    const llmStart = Date.now();

    // NOTE: Ollama (local Llama 3.2) is skipped because it's too slow on CPU hardware.
    // To re-enable it, uncomment the block below and comment out the Groq primary block.
    //
    // try {
    //   console.log("Generating with Local Fine-Tuned Model (Ollama)...");
    //   json = await generateItineraryWithOllama(prompt);
    //   console.log(`✅ Ollama succeeded in ${((Date.now() - llmStart) / 1000).toFixed(1)}s`);
    // } catch (ollamaErr) {
    //   console.warn(`⚠️ Ollama failed: ${ollamaErr.message}`);
    // }

    // 1. PRIMARY: Groq (Llama 3.3 70b — fast cloud inference)
    if (!json && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_XXXX') {
      try {
        console.log(2); // Groq (Llama 3.3) Active
        const groqStart = Date.now();
        json = await generateItineraryWithGroq(prompt);
        console.log(`Generating with Llama 3.3 succeeded in ${((Date.now() - groqStart) / 1000).toFixed(1)}s`);
      } catch (groqErr) {
        console.warn(`⚠️  Groq failed: ${groqErr.message}. Trying Gemini fallback...`);
      }
    }

    // 2. FALLBACK: Gemini
    if (!json) {
      console.log(2);
      console.log("Generating with Gemini AI (fallback)...");
      const geminiStart = Date.now();
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "You are a professional travel planner. Return ONLY valid JSON."
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      let jsonString = result.response.text().trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      json = JSON.parse(jsonString);
      console.log(`✅ Gemini succeeded in ${((Date.now() - geminiStart) / 1000).toFixed(1)}s`);
    }

    const llmDone = Date.now();
    console.log(`⏱️  LLM generation: ${((llmDone - llmStart) / 1000).toFixed(1)}s`);

    const imgStart = Date.now();
    const normalized = deduplicatePlaces(normalizeJson(json));
    const finalItinerary = await enhanceWithImages(normalized, destination);
    console.log(`⏱️  Image enhancement: ${((Date.now() - imgStart) / 1000).toFixed(1)}s`);

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    console.log(`⏱️  Total Trip Creation Time: ${minutes}m ${seconds}s`);

    return finalItinerary;

  } catch (err) {
    console.error("CRITICAL ERROR IN ITINERARY GENERATION:", err);
    throw new Error(`Failed to generate travel plan: ${err.message}`);
  }
}

/**
 * Normalizes the LLM JSON to ensure it matches the expected structure.
 * Handles variations in key names (e.g., 'name' vs 'hotelName').
 */
function normalizeJson(json) {
  if (!json) return { hotels: [], itinerary: [] };

  const normalized = {
    hotels: Array.isArray(json.hotels) ? json.hotels : [],
    itinerary: Array.isArray(json.itinerary) ? json.itinerary : []
  };

  // Normalize Hotels
  normalized.hotels = normalized.hotels.map(hotel => ({
    hotelName: hotel.hotelName || hotel.name || "Recommended Hotel",
    address: hotel.address || "Address available on request",
    price: hotel.price || "Contact for pricing",
    geoCoordinates: hotel.geoCoordinates || { lat: 0, lng: 0 },
    rating: hotel.rating || hotel.stars || 4.5,
    description: hotel.description || hotel.details || "A premium stay option.",
    uniqueFeature: hotel.uniqueFeature || hotel.specialty || "Great location",
    weather: hotel.weather || "Pleasant",
    locationLink: hotel.locationLink || "",
    imageUrl: hotel.imageUrl || "",
    nearbyEmergingBusinesses: hotel.nearbyEmergingBusinesses || []
  }));

  // Normalize Itinerary
  normalized.itinerary = normalized.itinerary.map((day, idx) => {
    const d = {
      day: day.day || idx + 1,
      dayTitle: day.dayTitle || day.title || `Day ${day.day || idx + 1}`,
      dayDescription: day.dayDescription || day.description || "",
      weather: day.weather || "Sunny",
      uniqueHighlights: day.uniqueHighlights || [],
      morning: Array.isArray(day.morning) ? day.morning : [],
      afternoon: Array.isArray(day.afternoon) ? day.afternoon : [],
      evening: Array.isArray(day.evening) ? day.evening : [],
      localTips: day.localTips || [],
      estimatedCost: day.estimatedCost || 0,
      dayImage: day.dayImage || ""
    };

    // If model returned a single 'activities' array instead of morning/afternoon/evening
    if (Array.isArray(day.activities) && d.morning.length === 0) {
      const len = day.activities.length;
      d.morning = day.activities.slice(0, Math.ceil(len / 3));
      d.afternoon = day.activities.slice(Math.ceil(len / 3), Math.ceil(2 * len / 3));
      d.evening = day.activities.slice(Math.ceil(2 * len / 3));
    }

    // Ensure places inside morning/afternoon/evening are also normalized
    const periods = ['morning', 'afternoon', 'evening'];
    periods.forEach(p => {
      d[p] = d[p].map(place => ({
        placeName: place.placeName || place.name || "Tourist Attraction",
        details: place.details || place.description || "Historical and cultural site.",
        address: place.address || place.location || "Central Area",
        geoCoordinates: place.geoCoordinates || { lat: 0, lng: 0 },
        locationLink: place.locationLink || "",
        ticketPricing: place.ticketPricing || "Free",
        timeToTravel: place.timeToTravel || "30 mins",
        bestTimeToVisit: place.bestTimeToVisit || "Morning",
        weather: place.weather || "Clear",
        uniqueThing: place.uniqueThing || "Architecture",
        imageUrl: place.imageUrl || "",
        relatedEmergingBusinesses: place.relatedEmergingBusinesses || []
      }));
    });

    return d;
  });

  return normalized;
}

/**
 * Removes duplicate places from the itinerary.
 * If a placeName appears on Day 1 and again on Day 3, the Day 3 copy is removed.
 * This is a safety net in case the LLM ignores the "no repeat" prompt rule.
 */
function deduplicatePlaces(json) {
  if (!json || !Array.isArray(json.itinerary)) return json;

  // Normalize a name for comparison: lowercase, trim, remove punctuation
  const normalize = (name) => (name || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

  const seenPlaces = new Set(); // tracks all place names seen so far
  let removedCount = 0;

  json.itinerary = json.itinerary.map((day, dayIdx) => {
    const periods = ['morning', 'afternoon', 'evening'];

    periods.forEach(period => {
      if (!Array.isArray(day[period])) return;

      const before = day[period].length;
      day[period] = day[period].filter(place => {
        const key = normalize(place.placeName);
        if (!key) return true; // keep if name is empty (edge case)

        if (seenPlaces.has(key)) {
          console.log(`  🔁 Duplicate removed: "${place.placeName}" (Day ${dayIdx + 1} ${period})`);
          removedCount++;
          return false; // remove this duplicate
        }

        seenPlaces.add(key);
        return true;
      });
    });

    return day;
  });

  if (removedCount > 0) {
    console.log(`✅ Deduplication: removed ${removedCount} repeated place(s) from itinerary.`);
  } else {
    console.log(`✅ Deduplication: no repeated places found — all ${seenPlaces.size} places are unique.`);
  }

  return json;
}

/**
 * Runs async task factories in batches to avoid network exhaustion.
 * @param {Array<() => Promise>} taskFns - Array of functions that return promises.
 * @param {number} batchSize - Max concurrent tasks at a time.
 */
async function runInBatches(taskFns, batchSize = 15) {
  for (let i = 0; i < taskFns.length; i += batchSize) {
    const batch = taskFns.slice(i, i + batchSize).map(fn => fn());
    await Promise.all(batch);
    console.log(`  ✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(taskFns.length / batchSize)} done`);
  }
}

/**
 * Enhanced travel plan with images and map links.
 * Uses batched parallel fetching (max 15 concurrent) and instant placeholders
 * for minor items (emerging businesses) to drastically cut total time.
 */
async function enhanceWithImages(json, destination) {
  const { getPlaceholderRaw } = require('./imageService');
  console.log("🚀 Step 2: Enhancing travel plan with real images and verified location links...");

  const buildLocationLink = (item, fallbackDestination) => {
    if (item.geoCoordinates && item.geoCoordinates.lat && item.geoCoordinates.lng) {
      return `https://www.google.com/maps?q=${item.geoCoordinates.lat},${item.geoCoordinates.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.placeName || item.hotelName || item.name || "")}+${fallbackDestination}`;
  };

  // We collect task FACTORIES (functions returning promises) for batching
  const imageTasks = [];

  // 1. Process Hotels — only fetch images for hotels, NOT for businesses
  if (json.hotels && json.hotels.length > 0) {
    console.log(`🏨 Preparing image tasks for ${json.hotels.length} hotels...`);
    json.hotels.forEach(hotel => {
      imageTasks.push(() => (async () => {
        hotel.imageUrl = await fetchImageForQuery(`${hotel.hotelName} ${destination} hotel`);
        hotel.locationLink = buildLocationLink(hotel, destination);
      })());

      // For nearby businesses: use instant placeholder, no network call
      if (Array.isArray(hotel.nearbyEmergingBusinesses)) {
        hotel.nearbyEmergingBusinesses.forEach(biz => {
          biz.imageUrl = getPlaceholderRaw(`${biz.type || ''} ${biz.name}`);
          biz.locationLink = biz.locationLink || buildLocationLink(biz, destination);
        });
      }
    });
  }

  // 2. Process Itinerary — fetch real images for day overviews and places only
  if (json.itinerary && json.itinerary.length > 0) {
    console.log(`📅 Preparing image tasks for ${json.itinerary.length} days of itinerary...`);
    json.itinerary.forEach(dayPlan => {
      // Day overview image
      imageTasks.push(() => (async () => {
        dayPlan.dayImage = await fetchImageForQuery(`${dayPlan.dayTitle || destination} travel`);
      })());

      const periods = ["morning", "afternoon", "evening"];
      periods.forEach(period => {
        if (Array.isArray(dayPlan[period])) {
          dayPlan[period].forEach(place => {
            // Real image for each tourist place
            imageTasks.push(() => (async () => {
              place.imageUrl = await fetchImageForQuery(`${place.placeName} ${destination} tourist spot`);
              place.locationLink = buildLocationLink(place, destination);
            })());

            // For related businesses: instant placeholder, no network call
            if (Array.isArray(place.relatedEmergingBusinesses)) {
              place.relatedEmergingBusinesses.forEach(biz => {
                biz.imageUrl = getPlaceholderRaw(`${biz.type || ''} ${biz.name}`);
                biz.locationLink = biz.locationLink || buildLocationLink(biz, destination);
              });
            }
          });
        }
      });
    });
  }

  console.log(`⚡ Running ${imageTasks.length} image tasks in batches of 15...`);
  await runInBatches(imageTasks, 15);

  console.log("✨ Step 3: Enhancement complete! Sending response to frontend.");
  return {
    itinerary: json.itinerary,
    hotels: json.hotels
  };
}

module.exports = { generateItinerary };
