// Quick test script to verify the job application endpoint
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testApplicationSubmit() {
    try {
        const formData = new FormData();

        // Add test data
        formData.append('jobId', '6989c49fa0612a073eb236cb'); // Use the job ID from user's test
        formData.append('firstName', 'Test');
        formData.append('lastName', 'User');
        formData.append('email', 'test@example.com');
        formData.append('mobile', '1234567890');
        formData.append('dob', '1990-01-01');
        formData.append('highestQualification', 'Bachelor');
        formData.append('experience', '2 years');
        formData.append('skills', 'JavaScript');
        formData.append('percentage', '75');
        formData.append('passingYear', '2015');
        formData.append('address', 'Test Address');
        formData.append('dateOfJoining', 'Immediately');

        // Create a dummy file for resume
        const dummyFile = Buffer.from('Test Resume Content');
        formData.append('resume', dummyFile, { filename: 'test-resume.pdf', contentType: 'application/pdf' });

        console.log('Sending test application...');
        const response = await axios.post('http://localhost:5000/api/applications/submit', formData, {
            headers: formData.getHeaders()
        });

        console.log('✅ Success!', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testApplicationSubmit();
