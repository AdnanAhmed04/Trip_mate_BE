require('dotenv').config();
const { generateItinerary } = require('./src/services/itineraryGenerator');
const fs = require('fs');

async function test() {
    let log = '';
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
        log += args.join(' ') + '\n';
        originalLog(...args);
    };
    console.error = (...args) => {
        log += 'ERROR: ' + args.join(' ') + '\n';
        originalError(...args);
    };

    try {
        const params = {
            destination: 'Las Vegas',
            startDate: '2026-03-01',
            endDate: '2026-03-03',
            travelers: 2,
            budgetLevel: 'cheap',
            interests: ['sightseeing', 'food']
        };
        console.log('Testing generateItinerary with:', JSON.stringify(params));
        const itinerary = await generateItinerary(params);
        console.log('Success! Itinerary generated:');
        console.log(JSON.stringify(itinerary, null, 2));
    } catch (err) {
        console.error('Test failed with error:', err.message);
        console.error(err.stack);
    } finally {
        fs.writeFileSync('test_output.txt', log);
        console.log = originalLog;
        console.error = originalError;
    }
}

test();
