const axios = require('axios');

async function checkOllama() {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    console.log('Ollama is reachable:', response.data);
  } catch (error) {
    console.error('Ollama is NOT reachable:', error.message);
  }
}

checkOllama();
