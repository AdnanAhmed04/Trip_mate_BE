const { GoogleGenerativeAI } = require("@google/generative-ai");
const { fetchImageForQuery } = require("./imageService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // inclusive days
}

async function generateItinerary({ destination, origin, startDate, endDate, travelers, budgetLevel, interests }) {
  const totalDays = daysBetween(startDate, endDate);

  const prompt = `
Create a professional, detailed, realistic, and tourism-friendly travel plan in valid JSON format for the following trip:

Destination: ${destination}
Origin: ${origin || 'Anywhere'}
Travel Dates: ${startDate} to ${endDate}
Number of Travelers: ${travelers}
Budget Level: ${budgetLevel}
Interests: ${interests.join(", ")}

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
    console.log("Generating itinerary with Gemini AI...");

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined in environment variables.");
    }

    const systemInstruction = "You are a professional travel planner. Return ONLY valid JSON that matches the requested structure precisely.";
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text();
    console.log("Gemini response length:", text.length);

    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", jsonString);
      throw new Error(`JSON parsing failed: ${e.message}`);
    }

    if (!json.itinerary || !json.hotels) {
      throw new Error("Invalid response format: Missing itinerary or hotels keys.");
    }

    // --- Post-processing: Enhance with real-world maps and images ---
    console.log("Enhancing travel plan with real images and verified location links...");

    // Helper: Build location link from coordinates or name
    const buildLocationLink = (item, fallbackDestination) => {
      if (item.geoCoordinates && item.geoCoordinates.lat && item.geoCoordinates.lng) {
        return `https://www.google.com/maps?q=${item.geoCoordinates.lat},${item.geoCoordinates.lng}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.placeName || item.hotelName || item.name || "")}+${fallbackDestination}`;
    };

    // 1. Process Hotels
    for (const hotel of json.hotels) {
      hotel.imageUrl = await fetchImageForQuery(`${hotel.hotelName} ${destination} hotel`);
      hotel.locationLink = buildLocationLink(hotel, destination);

      if (Array.isArray(hotel.nearbyEmergingBusinesses)) {
        for (const biz of hotel.nearbyEmergingBusinesses) {
          biz.imageUrl = await fetchImageForQuery(`${biz.name} ${biz.type || ''} ${destination}`);
          biz.locationLink = biz.locationLink || buildLocationLink(biz, destination);
        }
      }
    }

    // 2. Process Itinerary
    for (const dayPlan of json.itinerary) {
      // Day overview image
      dayPlan.dayImage = await fetchImageForQuery(`${dayPlan.dayTitle || destination} travel`);

      // Process times of day
      const periods = ["morning", "afternoon", "evening"];
      for (const period of periods) {
        if (Array.isArray(dayPlan[period])) {
          for (const place of dayPlan[period]) {
            place.imageUrl = await fetchImageForQuery(`${place.placeName} ${destination} tourist spot`);
            place.locationLink = buildLocationLink(place, destination);

            // Related businesses for each place
            if (Array.isArray(place.relatedEmergingBusinesses)) {
              for (const biz of place.relatedEmergingBusinesses) {
                biz.imageUrl = await fetchImageForQuery(`${biz.name} ${biz.type || ''} ${destination}`);
                biz.locationLink = biz.locationLink || buildLocationLink(biz, destination);
              }
            }
          }
        }
      }
    }

    return {
      itinerary: json.itinerary,
      hotels: json.hotels
    };

  } catch (err) {
    console.error("CRITICAL ERROR IN ITINERARY GENERATION:", err);
    throw new Error(`Failed to generate travel plan: ${err.message}`);
  }
}

module.exports = { generateItinerary };
