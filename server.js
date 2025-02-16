require('dotenv').config(); // Load .env file

const express = require('express');
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI; // Get MongoDB connection string

const app = express();
app.use(express.json()); // Middleware to parse JSON

// MongoDB Connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define User Schema & Model
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    location: {
        latitude: Number,
        longitude: Number,
        updatedAt: { type: Date, default: Date.now }
    }
});
const User = mongoose.model('User', userSchema);

// ----------------------
// 1. Create a New User
// ----------------------
app.post('/api/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

        const newUser = new User({ name, email });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ----------------------
// 2. Update User Location
// ----------------------
app.put('/api/users/:id/location', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { location: { latitude, longitude, updatedAt: Date.now() } },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'Location updated', location: user.location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ----------------------
// 3. Get User Location
// ----------------------
app.get('/api/users/:id/location', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ location: user.location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

