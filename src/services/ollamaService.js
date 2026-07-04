const axios = require('axios');

// TripMate Fine-tuned Model
// Deployed on HuggingFace Spaces: https://huggingface.co/spaces/AdnanAhmed004/tripmate-ai
// Base Model: Llama 3.2 3B Instruct
// Fine-tuning Method: LoRA (rank=16, alpha=16) via Unsloth framework
// Training Data: 200 travel itinerary examples across 10 global cities
// Cities: Paris, Dubai, London, New York, Tokyo, Lahore, Istanbul, Rome, Bali, Singapore
// Budgets: Cheap, Mid-range, Luxury
// Interests: Culture, Food, Adventure, Shopping, History
// Training Steps: 60 steps | Optimizer: AdamW 8-bit | Learning Rate: 2e-4

const OLLAMA_TIMEOUT_MS = 45000;

/**
 * Generates an itinerary using the TripMate fine-tuned model.
 * Model is deployed on HuggingFace Spaces and also available locally via Ollama.
 */
async function generateItineraryWithOllama(prompt) {
  try {
    console.log(`Requesting TripMate fine-tuned model [timeout: ${OLLAMA_TIMEOUT_MS / 1000}s]...`);

    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'tripmate',
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: false,
      format: 'json'
    }, {
      timeout: OLLAMA_TIMEOUT_MS
    });

    if (response.data && response.data.message) {
      return JSON.parse(response.data.message.content);
    } else {
      throw new Error("Invalid response from model");
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error(`Model timed out after ${OLLAMA_TIMEOUT_MS / 1000}s — switching to cloud fallback.`);
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error("Local model not running — switching to cloud fallback.");
    }
    console.error("TripMate Model Error:", error.message);
    throw error;
  }
}

module.exports = {
  generateItineraryWithOllama
};
