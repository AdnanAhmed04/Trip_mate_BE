// services/itineraryGenerator.js

const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  // inclusive days: if start=1st, end=2nd => 2 days
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

async function generateItinerary({ destination, startDate, endDate, travelers, budgetLevel, interests }) {
  const totalDays = daysBetween(startDate, endDate);

  const system = `
You are a travel planner. Output ONLY valid JSON, no markdown.
Return an array "itinerary" with exactly ${totalDays} items (day 1..${totalDays}).
Each item must contain:
{
  "day": number,

  "morning": { "title": string, "startTime": "HH:MM", "endTime": "HH:MM", "places": [3 strings], "food":[strings], "notes": string },
  "afternoon": { ...same... },
  "evening": { ...same... },
  "localTips": [strings],
  "estimatedCost": number
}
Keep it realistic for the destination and budget.
If user wants "cheap", prioritize free/low-cost options + street food + public transport.
`;

  const user = {
    destination,
    startDate,
    endDate,
    travelers,
    budgetLevel,
    interests
  };

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: system.trim() },
      { role: "user", content: JSON.stringify(user) }
    ],
    response_format: { type: "json_object" },
  });

  const json = JSON.parse(resp.choices[0].message.content);
  if (!json.itinerary || !Array.isArray(json.itinerary)) {
    throw new Error("Invalid itinerary format from AI");
  }
  return json.itinerary;
}

module.exports = { generateItinerary };
