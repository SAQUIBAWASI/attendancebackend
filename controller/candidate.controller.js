const Candidate = require("../models/Candidate");
const JobApplication = require("../models/JobApplication");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Candidate
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, skills, experience, address, currentCompany, currentCTC, expectedCTC } = req.body;

        // Check if candidate already exists
        let candidate = await Candidate.findOne({ email });
        if (candidate) {
            return res.status(400).json({ message: "Candidate already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        candidate = new Candidate({
            name,
            email,
            password: hashedPassword,
            phone,
            skills,
            experience,
            address,
            currentCompany,
            currentCTC,
            expectedCTC,
        });

        await candidate.save();

        // Create JWT Payload
        const payload = {
            candidate: {
                id: candidate.id,
            },
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secret_ecom",
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, message: "Candidate registered successfully" });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Login Candidate
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if candidate exists
        let candidate = await Candidate.findOne({ email });
        if (!candidate) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, candidate.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Create JWT Payload
        const payload = {
            candidate: {
                id: candidate.id,
            },
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secret_ecom",
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, message: "Login successful" });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Get Candidate Profile
exports.getProfile = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.candidate.id).select("-password");
        res.json(candidate);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Update Candidate Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, skills, experience, address } = req.body;
        let candidate = await Candidate.findById(req.candidate.id);

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Update fields
        if (name) candidate.name = name;
        if (phone) candidate.phone = phone;
        if (skills) candidate.skills = skills;
        if (experience) candidate.experience = experience;
        if (address) candidate.address = address;

        // Handle Resume Upload if present (req.file)
        if (req.file) {
            candidate.resume = req.file.path;
        }

        await candidate.save();
        res.json({ message: "Profile updated successfully", candidate });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}


// Get Applied Jobs
const getAppliedJobs = async (req, res) => {
    try {
        const applications = await JobApplication.find({ candidateId: req.candidate.id })
            .populate("jobId")
            .sort({ appliedAt: -1 });
        res.status(200).json(applications);
    } catch (err) {
        console.error("Get Applied Jobs Error:", err.message);
        res.status(500).send("Server Error");
    }
};

const checkCandidateExists = async (req, res) => {
    try {
        const { email } = req.body;
        const candidate = await Candidate.findOne({ email }).select("-password");
        if (candidate) {
            return res.status(200).json({ exists: true, message: "Candidate found", candidate });
        }
        res.status(200).json({ exists: false, message: "Candidate not found" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    register: exports.register,
    login: exports.login,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    getAppliedJobs,
    checkCandidateExists
};
