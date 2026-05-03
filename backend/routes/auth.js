const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// In-memory fallback if MongoDB is not connected
const fallbackUsers = [];

// Helper to generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
};

// Check if MongoDB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        let user, userId;

        if (isDbConnected()) {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(409).json({ success: false, message: 'User already exists.' });
            
            user = await User.create({ email, password });
            userId = user._id;
        } else {
            // FALLBACK IN-MEMORY
            const existingUser = fallbackUsers.find(u => u.email === email);
            if (existingUser) return res.status(409).json({ success: false, message: 'User already exists (in-memory).' });
            
            user = { _id: Date.now().toString(), email, password };
            fallbackUsers.push(user);
            userId = user._id;
            console.log("⚠️ Created user in memory fallback");
        }

        const token = generateToken(userId);
        res.status(201).json({ success: true, message: 'Account created successfully!', token, user: { id: userId, email: user.email } });

    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        let user, userId, isMatch;

        if (isDbConnected()) {
            user = await User.findOne({ email });
            if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            
            isMatch = await user.comparePassword(password);
            userId = user._id;
        } else {
            // FALLBACK IN-MEMORY
            user = fallbackUsers.find(u => u.email === email);
            if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials (in-memory).' });
            
            isMatch = (user.password === password); // Simple string compare for in-memory
            userId = user._id;
        }

        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

        const token = generateToken(userId);
        res.json({ success: true, message: 'Login successful!', token, user: { id: userId, email: user.email } });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

module.exports = router;
