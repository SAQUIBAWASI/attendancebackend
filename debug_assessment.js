const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_BASE = 'http://localhost:5005/api';

async function runDebug() {
    try {
        console.log("1. Fetching all jobs to get a valid Job ID and Quiz ID...");
        const jobsRes = await axios.get(`${API_BASE}/jobs/all`);

        if (!jobsRes.data.success || jobsRes.data.jobPosts.length === 0) {
            console.error("No jobs found to test with.");
            return;
        }

        const job = jobsRes.data.jobPosts[0];
        console.log(`> Found Job: ${job.role} (ID: ${job._id})`);

        let quizId = null;
        if (job.assessmentIds && job.assessmentIds.length > 0) {
            quizId = job.assessmentIds[0];
            console.log(`> Found Quiz ID: ${quizId}`);
        } else {
            console.log("> No Quiz linked to this job. Cannot test assessment.");
            // Try to find a quiz manually if not linked
            try {
                // If there's a route to get all quizzes, we could try that, but let's assume one exists or fail gracefully
                // For now, we proceed only if we have a quizId from the job, or we create a fake one if we really need to test 404
            } catch (e) { }

            if (!quizId) {
                console.log("Skipping assessment test due to missing Quiz ID on job.");
                return;
            }
        }

        console.log("\n2. Creating dummy application to get Application ID...");
        const resumePath = path.join(__dirname, 'test_resume_assessment.pdf');
        fs.writeFileSync(resumePath, 'Dummy PDF Content');

        const form = new FormData();
        form.append('jobId', job._id);
        form.append('firstName', 'Assessment');
        form.append('lastName', 'Tester');
        form.append('email', 'assessment@example.com');
        form.append('mobile', '9876543210');
        form.append('dob', '1995-05-05');
        form.append('highestQualification', 'MCA');
        form.append('experience', '1 Year');
        form.append('currentCTC', '8 LPA');
        form.append('expectedCTC', '12 LPA');
        form.append('noticePeriod', 'Immediate');
        form.append('currentLocation', 'Bangalore');
        form.append('skills', 'Debugging');
        form.append('resume', fs.createReadStream(resumePath));

        let applicationId = null;
        try {
            const submitRes = await axios.post(`${API_BASE}/applications/submit`, form, {
                headers: { ...form.getHeaders() }
            });
            applicationId = submitRes.data.applicationId;
            console.log(`> Application Created. ID: ${applicationId}`);
        } catch (err) {
            console.error("Failed to create application:", err.message);
            return;
        }

        console.log("\n3. Submitting Assessment Result...");
        const assessmentData = {
            applicationId: applicationId,
            quizId: quizId,
            score: 85,
            totalQuestions: 10
        };

        try {
            const assessRes = await axios.post(`${API_BASE}/applications/submit-assessment`, assessmentData);
            console.log("\n✅ SUCCESS! Assessment submitted.");
            console.log("Response:", assessRes.data);
        } catch (err) {
            console.error("\n❌ FAILED! Assessment submission error.");
            if (err.response) {
                console.error("Status:", err.response.status);
                console.log("Server Error Data:", JSON.stringify(err.response.data, null, 2));
            } else {
                console.error("Error:", err.message);
            }
        }

        // Cleanup
        fs.unlinkSync(resumePath);

    } catch (error) {
        console.error("Global Error:", error.message);
    }
}

runDebug();
