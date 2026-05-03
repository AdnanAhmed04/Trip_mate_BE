const { Groq } = require("groq-sdk");

/**
 * Generates a travel itinerary JSON using Llama 3 on Groq.
 * @param {string} prompt - The prompt to send to the LLM.
 * @returns {Promise<Object>} - The parsed JSON result.
 */
async function generateItineraryWithGroq(prompt) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_XXXX') {
    throw new Error("GROQ_API_KEY is missing or invalid. Please add a valid key to .env");
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    console.log("Generating itinerary with Groq (Llama 3)...");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional travel planner. Return ONLY valid JSON that matches the requested structure precisely. No preamble, no markdown, no explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 8000,   // increased from 4096 so long trips don't get cut off
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq API");
    }

    return JSON.parse(content);
  } catch (err) {
    console.error("Groq API Error:", err.message);
    throw err;
  }
}

module.exports = { generateItineraryWithGroq };
