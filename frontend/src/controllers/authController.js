const User = require('../models/User');
// In a real app, you'd use bcrypt for hashing and jsonwebtoken (JWT) for the token

exports.register = async (req, res) => {
    try {
        const { email, name, password } = req.body; // Taking data from the frontend
        
        // 1. Create a new user instance using our model
        const newUser = new User({
            email,
            name,
            password, // NOTE: You MUST hash this before saving in the real code
            personalInfo: { education: [], skills: [], interests: [] } // Initialize empty profile
        });

        // 2. The "doing" part: saving it to MongoDB
        await newUser.save(); 

        res.status(201).json({ message: "User created successfully!", user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 3. Finding the user in the database
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Update last login timestamp from our schema
        user.lastLogin = Date.now();
        await user.save();

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};