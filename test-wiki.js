
const https = require('https');

function getWikiImage(query) {
    return new Promise((resolve, reject) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}&origin=*`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId === '-1') {
                        resolve(null);
                    } else {
                        const imageUrl = pages[pageId].original ? pages[pageId].original.source : null;
                        resolve(imageUrl);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => reject(err));
    });
}

(async () => {
    try {
        console.log("Searching for Mazar-e-Quaid...");
        const img1 = await getWikiImage("Mazar-e-Quaid");
        console.log("Result:", img1);

        console.log("Searching for Eiffel Tower...");
        const img2 = await getWikiImage("Eiffel Tower");
        console.log("Result:", img2);

        console.log("Searching for Random Place XYZ...");
        const img3 = await getWikiImage("Random Place XYZ 123");
        console.log("Result:", img3);
    } catch (e) {
        console.error(e);
    }
})();
