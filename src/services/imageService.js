const https = require('https');

// ============================================================
// In-memory cache to avoid fetching the same image twice.
// e.g. two different hotels search for "Lahore hotel" - only one real request is made.
// ============================================================
const imageCache = new Map();

const IMAGE_TIMEOUT_MS = 2500; // Max 2.5 seconds per image request

/**
 * Fetches a high-quality image for a query.
 * Priority: Cache -> Unsplash API -> Wikipedia -> Placeholder
 * All network calls have a strict timeout to prevent hanging.
 * @param {string} query - The search term.
 * @returns {Promise<string>} - The URL of the image.
 */
async function fetchImageForQuery(query) {
  if (!query) return getPlaceholderRaw('travel');

  // Normalize the query key so minor differences don't bypass the cache
  const cacheKey = query.toLowerCase().trim().slice(0, 80);

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  let imageUrl = null;

  // 1. Try Unsplash (fastest, highest quality)
  const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (UNSPLASH_KEY && UNSPLASH_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY') {
    try {
      const url = `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(query)}&client_id=${UNSPLASH_KEY}&per_page=1`;
      const response = await fetchWithTimeout(url, IMAGE_TIMEOUT_MS);
      const json = JSON.parse(response);
      if (json.results && json.results.length > 0) {
        imageUrl = json.results[0].urls.regular;
      }
    } catch (err) {
      // Unsplash failed or timed out — silently fall through
    }
  }

  // 2. Fallback: Wikipedia (with strict timeout)
  if (!imageUrl) {
    try {
      imageUrl = await fetchWikipediaImage(query);
    } catch (err) {
      // Wikipedia failed or timed out — use placeholder
    }
  }

  // 3. Ultimate fallback: placeholder
  if (!imageUrl) {
    imageUrl = getPlaceholderRaw(query);
  }

  // Cache the result so we never re-fetch the same query
  imageCache.set(cacheKey, imageUrl);
  return imageUrl;
}

/**
 * Fetches an image from Wikipedia with a strict timeout.
 */
function fetchWikipediaImage(query) {
  return new Promise((resolve, reject) => {
    // Use only the first 4 words for a cleaner Wikipedia search
    const refinedQuery = query.split(' ').slice(0, 4).join(' ');
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(refinedQuery)}&format=json&origin=*`;
    const options = {
      headers: { 'User-Agent': 'Tripmate/1.0 (https://tripmate.com; contact@tripmate.com)' }
    };

    const timeout = setTimeout(() => {
      reject(new Error(`Wikipedia timeout for: ${query}`));
    }, IMAGE_TIMEOUT_MS);

    const req = https.get(searchUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const json = JSON.parse(data);
          if (!json.query || !json.query.search || json.query.search.length === 0) {
            return resolve(null);
          }

          const pageId = json.query.search[0].pageid;
          const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&pageids=${pageId}&origin=*`;

          const timeout2 = setTimeout(() => resolve(null), IMAGE_TIMEOUT_MS);

          const req2 = https.get(imgUrl, options, (imgRes) => {
            let imgData = '';
            imgRes.on('data', chunk => imgData += chunk);
            imgRes.on('end', () => {
              clearTimeout(timeout2);
              try {
                const imgJson = JSON.parse(imgData);
                const pages = imgJson.query?.pages;
                if (pages && pages[pageId] && pages[pageId].original) {
                  resolve(pages[pageId].original.source);
                } else {
                  resolve(null);
                }
              } catch (e) { resolve(null); }
            });
          });
          req2.on('error', () => { clearTimeout(timeout2); resolve(null); });

        } catch (e) { resolve(null); }
      });
    });

    req.on('error', () => { clearTimeout(timeout); reject(new Error('Wikipedia request error')); });
  });
}

/**
 * Generic HTTP GET with a strict timeout.
 */
function fetchWithTimeout(url, timeoutMs = IMAGE_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out')), timeoutMs);

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { clearTimeout(timer); resolve(data); });
    }).on('error', (err) => { clearTimeout(timer); reject(err); });
  });
}

/**
 * Returns a reliable placeholder image URL based on category.
 */
function getPlaceholderRaw(text = '') {
  const keywords = text.toLowerCase();
  // Map of stable, high-quality Unsplash photo IDs per category
  const placeholders = {
    hotel:      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    nature:     'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&auto=format&fit=crop',
    museum:     'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&auto=format&fit=crop',
    beach:      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    travel:     'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop',
    market:     'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&auto=format&fit=crop',
    mosque:     'https://images.unsplash.com/photo-1545167496-5e2f6e1c0f78?w=800&auto=format&fit=crop',
  };

  if (keywords.includes('hotel') || keywords.includes('resort') || keywords.includes('inn')) return placeholders.hotel;
  if (keywords.includes('cafe') || keywords.includes('restaurant') || keywords.includes('food') || keywords.includes('dining')) return placeholders.restaurant;
  if (keywords.includes('park') || keywords.includes('garden') || keywords.includes('forest') || keywords.includes('lake')) return placeholders.nature;
  if (keywords.includes('museum') || keywords.includes('history') || keywords.includes('heritage') || keywords.includes('fort') || keywords.includes('palace')) return placeholders.museum;
  if (keywords.includes('beach') || keywords.includes('sea') || keywords.includes('ocean') || keywords.includes('coast')) return placeholders.beach;
  if (keywords.includes('market') || keywords.includes('bazar') || keywords.includes('bazaar') || keywords.includes('mall')) return placeholders.market;
  if (keywords.includes('mosque') || keywords.includes('masjid') || keywords.includes('shrine') || keywords.includes('dargah')) return placeholders.mosque;

  return placeholders.travel;
}

module.exports = { fetchImageForQuery, getPlaceholderRaw };
