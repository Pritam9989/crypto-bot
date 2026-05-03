const express = require('express');
const router  = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const protect = require('../middleware/auth');
const priceStore = require('../priceStore');

// ─── Free Search Engine (DuckDuckGo Lite Scraper) ─────────────────────────────
const searchWeb = async (query) => {
    try {
        const searchUrl = `https://duckduckgo.com/lite/?q=${encodeURIComponent(query + ' cryptocurrency news')}`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('.result-link').each((i, el) => {
            if (i < 3) results.push($(el).text().trim());
        });
        $('.result-snippet').each((i, el) => {
            if (i < 3) results[i] = results[i] + ": " + $(el).text().trim();
        });
        return results.join('\n\n');
    } catch (e) {
        return null;
    }
};

// ─── Smart Crypto AI Response Engine ──────────────────────────────────────────
const getBotReply = async (message) => {
    const msg = message.toLowerCase().trim();
    const prices = priceStore.getPrices();
    const formatPrice = (p) => p > 0 ? `$${p.toLocaleString()}` : "fetching...";

    // ── Check if user is asking for News or Search ──
    const isSearchQuery = msg.includes('news') || msg.includes('latest') || msg.includes('happened') || msg.includes('search') || msg.includes('what is the update');

    if (isSearchQuery && msg.length > 5) {
        const liveInfo = await searchWeb(msg);
        if (liveInfo) {
            return `🔍 **Live Search Results:**\n\n${liveInfo}\n\n*Source: Real-time web results via CryptoAI Engine.*`;
        }
    }

    // ── Check if topic is Crypto-Related ──
    const cryptoKeywords = [
        'crypto', 'bitcoin', 'btc', 'eth', 'sol', 'doge', 'xrp', 'price', 'market', 'chart', 'wallet', 'token', 
        'blockchain', 'mining', 'staking', 'defi', 'nft', 'gas', 'fee', 'bull', 'bear', 'crash', 'invest', 'buy', 
        'sell', 'holding', 'portfolio', 'halving', 'altcoin', 'stablecoin', 'usdt', 'usdc', 'binance', 'coinbase',
        'ledger', 'seed', 'keys', 'satoshi', 'smart contract', 'dapp', 'web3', 'mint', 'airdrop', 'scam', 'risk',
        'trading', 'pump', 'dump', 'whale', 'fud', 'fomo', 'hodl', 'moon', 'diamond hands', 'paper hands', 'bagholder'
    ];
    
    const isCrypto = cryptoKeywords.some(k => msg.includes(k)) || 
                     /how|what|why|when|is|who/.test(msg) && (msg.includes('coin') || msg.includes('chain') || msg.includes('market'));

    // ── Casual Responses (ChatGPT Style) ──
    if (msg === 'hi' || msg === 'hello' || msg === 'hey') {
        return "Hello! How can I help you with crypto today?";
    }
    if (msg.includes('how are you')) {
        return "I'm doing well, thank you! Ready to answer your crypto questions.";
    }
    if (msg.includes('who are you')) {
        return "I'm your Crypto AI Assistant. I can help you with market prices, blockchain info, and more.";
    }

    // ── Direct Crypto Responses ──
    
    // Bitcoin Price specifically
    if (msg === 'price of bitcoin' || msg === 'btc price' || msg === 'bitcoin price' || msg === 'current price of bitcoin') {
        const p = prices.bitcoin;
        return `The current price of **Bitcoin (BTC)** is **${formatPrice(p.price)}** (${p.change24h >= 0 ? '+' : ''}${p.change24h.toFixed(2)}% in 24h).`;
    }

    // Bitcoin General
    if (msg.includes('bitcoin') || msg.includes('btc')) {
        const p = prices.bitcoin;
        return `₿ **Bitcoin (BTC)** is the first cryptocurrency, created by Satoshi Nakamoto. \n\n• **Price:** ${formatPrice(p.price)}\n• **Type:** Digital Gold / Store of Value`;
    }

    // Ethereum
    if (msg.includes('ethereum') || msg.includes('eth')) {
        const p = prices.ethereum;
        return `🔷 **Ethereum (ETH)** is a smart-contract platform.\n\n• **Price:** ${formatPrice(p.price)}\n• **24h Change:** ${p.change24h.toFixed(2)}%\n• **Use Case:** DeFi, NFTs, and dApps.`;
    }

    // Market / Crash
    if (msg.includes('market') || msg.includes('trend') || msg.includes('crash')) {
        return "📈 The crypto market is currently active. For real-time trends, check the 'Market Sentiment' bar at the top of your dashboard.";
    }

    // Investment Advice
    if (msg.includes('should i buy') || msg.includes('invest')) {
        return "Investing in crypto involves risk. A common strategy is DCA (Dollar Cost Averaging), but you should only invest what you are willing to lose. Which coin are you interested in?";
    }

    // Refuse Non-Crypto Topics 
    if (!isCrypto && msg.length > 3) {
        return "I apologize, but I am a specialized Crypto AI. I can only answer questions related to Cryptocurrency, Blockchain, and Finance. Please ask me something about Bitcoin or the market!";
    }

    // General Crypto
    if (isCrypto) {
        return "That's a great crypto question! To give you the best answer, could you be more specific? For example, are you asking about the price, the technology, or the news?";
    }

    // Default
    return "I'm here to help with any crypto questions! Try asking: 'What is the price of Bitcoin?' or 'How does blockchain work?'";
};

// ─── POST /api/chat (Protected) ───────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
        }

        const reply = await getBotReply(message);
        res.json({ success: true, reply });

    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

module.exports = router;
