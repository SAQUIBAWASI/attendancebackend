const axios = require('axios');

async function testStats() {
    try {
        console.log("Testing Recruitment Stats Endpoint...");
        const response = await axios.get('http://localhost:5000/api/job-applications/stats');
        console.log("Response Status:", response.status);
        console.log("Stats Data:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Test Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testStats();
