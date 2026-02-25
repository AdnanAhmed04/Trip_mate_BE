const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/feedbacks';

async function testFeedbackAPI() {
    try {
        console.log('--- Testing Feedback API ---');

        // 1. Create a dummy image file for testing
        const dummyImagePath = path.join(__dirname, 'test_image.jpg');
        if (!fs.existsSync(dummyImagePath)) {
            fs.writeFileSync(dummyImagePath, 'dummy image content');
        }

        // 2. Test POST /api/feedbacks
        console.log('\n1. Testing POST /api/feedbacks...');
        const form = new FormData();
        form.append('name', 'John Doe');
        form.append('profession', 'Software Engineer');
        form.append('rating', 5);
        form.append('feedback', 'Great application! Very useful.');
        form.append('image', fs.createReadStream(dummyImagePath));

        const postResponse = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('Status:', postResponse.status);
        console.log('Data:', postResponse.data);

        if (postResponse.status === 201) {
            console.log('✅ POST request successful');
        } else {
            console.error('❌ POST request failed');
        }

        // 3. Test GET /api/feedbacks
        console.log('\n2. Testing GET /api/feedbacks...');
        const getResponse = await axios.get(API_URL);

        console.log('Status:', getResponse.status);
        console.log('Number of feedbacks:', getResponse.data.length);
        console.log('Data:', getResponse.data);

        if (getResponse.status === 200 && Array.isArray(getResponse.data)) {
            const createdFeedback = getResponse.data.find(f => f.name === 'John Doe');
            if (createdFeedback) {
                console.log('✅ GET request successful and found created feedback');
            } else {
                console.error('❌ GET request successful but could not find created feedback');
            }

        } else {
            console.error('❌ GET request failed');
        }

        // Cleanup
        if (fs.existsSync(dummyImagePath)) {
            fs.unlinkSync(dummyImagePath);
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testFeedbackAPI();
