const https = require('https');

/**
 * Fetches an image URL from Wikipedia for a given query.
 * @param {string} query - The search term (e.g., "Eiffel Tower", "Mazar-e-Quaid").
 * @returns {Promise<string>} - The URL of the image or a placeholder if not found.
 */
function fetchImageForQuery(query) {
    return new Promise((resolve) => {
        if (!query) return resolve(getPlaceholderRaw(query));

        // Step 1: Search for the page title
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

        const options = {
            headers: { 'User-Agent': 'Tripplannerwebsite/1.0 (adnanahmedb7208@gmail.com)' }
        };

        https.get(searchUrl, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.query || !json.query.search || json.query.search.length === 0) {
                        return resolve(getPlaceholderRaw(query));
                    }

                    const bestMatch = json.query.search[0];
                    const pageId = bestMatch.pageid;

                    // Step 2: Fetch image for the found page ID
                    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&pageids=${pageId}&origin=*`;

                    https.get(imgUrl, options, (imgRes) => {
                        let imgData = '';
                        imgRes.on('data', chunk => imgData += chunk);
                        imgRes.on('end', () => {
                            try {
                                const imgJson = JSON.parse(imgData);
                                const pages = imgJson.query?.pages;
                                if (pages && pages[pageId] && pages[pageId].original) {
                                    resolve(pages[pageId].original.source);
                                } else {
                                    resolve(getPlaceholderRaw(query));
                                }
                            } catch (e) {
                                console.error(`Error parsing image response for "${query}":`, e.message);
                                resolve(getPlaceholderRaw(query));
                            }
                        });
                    }).on('error', (err) => {
                        console.error(`Error fetching image details for "${query}":`, err.message);
                        resolve(getPlaceholderRaw(query));
                    });

                } catch (e) {
                    console.error(`Error parsing search response for "${query}":`, e.message);
                    resolve(getPlaceholderRaw(query));
                }
            });
        }).on('error', (err) => {
            console.error(`Error searching for "${query}":`, err.message);
            resolve(getPlaceholderRaw(query));
        });
    });
}

function getPlaceholderRaw(text) {
    const safeText = text ? encodeURIComponent(text.substring(0, 20)) : 'No+Image';
    return `https://placehold.co/600x400?text=${safeText}`;
}

module.exports = { fetchImageForQuery };
