const axios = require('axios');

// Maximum time to wait for the local Ollama model (in ms).
// If Ollama takes longer than this, we give up and let Groq handle it.
const OLLAMA_TIMEOUT_MS = 45000; // 45 seconds

/**
 * Generates an itinerary using the locally running fine-tuned Ollama model.
 * Has a strict timeout so slow hardware doesn't block the response for minutes.
 */
async function generateItineraryWithOllama(prompt) {
  try {
    console.log(`Requesting local Ollama model (tripmate) [timeout: ${OLLAMA_TIMEOUT_MS / 1000}s]...`);

    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'tripmate',
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: false,
      format: 'json'
    }, {
      timeout: OLLAMA_TIMEOUT_MS  // <-- strict timeout added
    });

    if (response.data && response.data.message) {
      return JSON.parse(response.data.message.content);
    } else {
      throw new Error("Invalid response from Ollama API");
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error(`Ollama timed out after ${OLLAMA_TIMEOUT_MS / 1000}s — switching to cloud fallback.`);
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error("Ollama is not running. Please start Ollama on your machine.");
    }
    console.error("Ollama Service Error:", error.message);
    throw error;
  }
}

module.exports = {
  generateItineraryWithOllama
};
