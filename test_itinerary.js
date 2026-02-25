require("dotenv").config();
const { generateItinerary } = require("./src/services/itineraryGenerator");
const fs = require('fs');

async function test() {
    try {
        const result = await generateItinerary({
            destination: "Paris",
            origin: "London",
            startDate: "2024-06-01",
            endDate: "2024-06-03",
            travelers: 2,
            budgetLevel: "mid",
            interests: ["food", "history"]
        });

        console.log("Itinerary generated successfully!");
        fs.writeFileSync('test_result.json', JSON.stringify(result, null, 2));

    } catch (err) {
        console.error("Error:", err);
    }
}

test();
