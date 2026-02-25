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
Generate a Travel Plan for Location: ${destination}, from ${origin || 'Anywhere'} from ${startDate} to ${endDate} for ${travelers} travelers with a ${budgetLevel} budget.
Interests: ${interests.join(", ")}.
`;

  // Define the system instruction for JSON output structure
  const systemInstruction = `
Return a JSON object with two keys: "hotels" and "itinerary".

"hotels" must be an array of recommended hotels. Each hotel must contain:
{
  "hotelName": string,
  "address": string,
  "price": string,
  "geoCoordinates": { "lat": number, "lng": number },
  "rating": number,
  "description": string
}

"itinerary" must be an array with exactly ${totalDays} items (day 1 to ${totalDays}).
Each day must contain:
{
  "day": number,
  "dayDescription": string,
  "weather": string, // e.g., "Sunny, 20-25°C"
  "morning": [Place],
  "afternoon": [Place],
  "evening": [Place],
  "localTips": [strings],
  "estimatedCost": number
}

Each [Place] object must contain:
{
  "placeName": string,
  "details": string,
  "address": string, // accurate address
  "geoCoordinates": { "lat": number, "lng": number },
  "ticketPricing": string,
  "timeToTravel": string,
  "bestTimeToVisit": string
}

Make sure the plan is realistic for a ${budgetLevel} budget. 
Provide real-world locations and plausible geo-coordinates.
`;

  try {
    console.log("Generating itinerary with Gemini 2.5 Flash (using stable SDK)...");
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in process.env");
    }

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

    console.log("Gemini response received successfully.");
    const text = result.response.text();
    console.log("Response text length:", text.length);

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response. Raw text:", text);
      throw new Error(`Failed to parse JSON from AI response: ${e.message}`);
    }

    if (!json.itinerary || !Array.isArray(json.itinerary) || !json.hotels || !Array.isArray(json.hotels)) {
      console.error("Invalid JSON structure from Gemini:", json);
      throw new Error("Invalid format from AI (missing itinerary or hotels)");
    }

    // --- Post-processing: Fetch real images ---
    console.log("Fetching real images for itinerary...");

    // 1. Fetch images for hotels
    for (const hotel of json.hotels) {
      if (hotel.hotelName) {
        hotel.imageUrl = await fetchImageForQuery(hotel.hotelName + " hotel");
      } else {
        hotel.imageUrl = "https://placehold.co/600x400?text=Hotel";
      }
    }

    // 2. Fetch images for itinerary places
    for (const dayPlan of json.itinerary) {
      // Process morning, afternoon, evening
      const times = ["morning", "afternoon", "evening"];
      for (const time of times) {
        if (Array.isArray(dayPlan[time])) {
          for (const place of dayPlan[time]) {
            if (place.placeName) {
              // Combine destination + place name for better search accuracy
              place.imageUrl = await fetchImageForQuery(`${place.placeName} ${destination}`);

              // Generate Google Maps URL
              if (place.geoCoordinates && place.geoCoordinates.lat && place.geoCoordinates.lng) {
                place.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.geoCoordinates.lat},${place.geoCoordinates.lng}`;
              } else {
                place.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.placeName + " " + destination)}`;
              }
            } else {
              place.imageUrl = "https://placehold.co/600x400?text=Place";
              place.googleMapsUrl = "";
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
    console.error("DETAILED ITINERARY GENERATION ERROR:", err);
    if (err.message && (err.message.includes("API key") || err.message.includes("API_KEY"))) {
      throw new Error("Gemini API key missing or invalid.");
    }
    // Propagate the actual error message for better debugging
    throw new Error(`Itinerary generation failed: ${err.message || 'Unknown error'}`);
  }
}

module.exports = { generateItinerary };
