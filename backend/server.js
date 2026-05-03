const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ─── Serve Frontend Static Files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ───────────────────────────────────────────────────────────────
const authRoutes   = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');
const chatRoutes   = require('./routes/chat');

app.use('/api/auth',   authRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/chat',   chatRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'Crypto AI Backend is running ✅' });
});

// ─── Catch-All → Serve index.html (SPA fallback) ──────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// ─── Connect MongoDB & Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running → http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        // Start server even without DB for frontend access
        app.listen(PORT, () => {
            console.log(`⚠️  Server started WITHOUT MongoDB on http://localhost:${PORT}`);
        });
    });
