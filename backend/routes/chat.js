const express = require('express');
const router  = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { tavily } = require("@tavily/core");
const protect = require('../middleware/auth');
const priceStore = require('../priceStore');

// ─── Free Search Fallback (DuckDuckGo Lite Scraper) ───────────────────────────
const searchDDG = async (query) => {
    try {
        const searchUrl = `https://duckduckgo.com/lite/?q=${encodeURIComponent(query + ' cryptocurrency')}`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        let results = [];
        $('.result-link').each((i, el) => { if (i < 2) results.push($(el).text().trim()); });
        $('.result-snippet').each((i, el) => { if (i < 2) results[i] = results[i] + ": " + $(el).text().trim(); });
        return results.length > 0 ? results.join('\n\n') : null;
    } catch (e) { return null; }
};

// ─── Smart Crypto AI Response Engine ──────────────────────────────────────────
const getBotReply = async (message) => {
    const msg = message.toLowerCase().trim();
    const prices = priceStore.getPrices();
    const formatPrice = (p) => p > 0 ? `$${p.toLocaleString()}` : "fetching...";

    // ── Search Integration (Tavily first, then DDG) ──
    const searchIntents = ['news', 'latest', 'happened', 'search', 'data', 'history', 'month', 'week', 'year', 'update', 'event', 'why'];
    const isSearchQuery = searchIntents.some(k => msg.includes(k)) || msg.length > 20;

    if (isSearchQuery) {
        // Try Tavily if Key exists
        const tavilyKey = process.env.TAVILY_API_KEY;
        if (tavilyKey) {
            try {
                const tv = tavily({ apiKey: tavilyKey });
                const searchResult = await tv.search(msg, { searchDepth: "advanced", maxResults: 3 });
                if (searchResult && searchResult.results.length > 0) {
                    let reply = "🔍 **Live Market Analysis:**\n\n";
                    searchResult.results.forEach(res => { reply += `• ${res.content.substring(0, 300)}...\n\n`; });
                    return reply;
                }
            } catch (e) { console.error("Tavily Error:", e); }
        }

        // Fallback to DDG Scraper
        const ddgInfo = await searchDDG(msg);
        if (ddgInfo) {
            return `🌐 **Web Search Insight:**\n\n${ddgInfo}\n\n*Analyzed via CryptoAI Real-time Engine.*`;
        }
    }

    // ── Check if topic is Crypto-Related ──
    const cryptoKeywords = ['crypto', 'bitcoin', 'btc', 'eth', 'sol', 'doge', 'xrp', 'price', 'market', 'chart', 'wallet', 'token', 'blockchain', 'mining', 'staking', 'defi', 'nft', 'gas', 'binance', 'coinbase', 'satoshi', 'web3', 'mint', 'airdrop', 'scam', 'risk', 'trading', 'pump', 'dump', 'whale', 'fud', 'fomo', 'hodl', 'moon'];
    const isCrypto = cryptoKeywords.some(k => msg.includes(k)) || /how|what|why|when|is|who/.test(msg) && (msg.includes('coin') || msg.includes('chain') || msg.includes('market'));

    // ── Greetings & Self ──
    if (msg === 'hi' || msg === 'hello' || msg === 'hey') return "Hello! I am CryptoAI Engine v3. How can I help you with crypto today?";
    if (msg.includes('version')) return "I am running on **CryptoAI Engine v3** with real-time search capabilities. 🚀";
    if (msg.includes('how are you')) return "I'm doing well, thank you! Ready to dive into the crypto markets.";

    // ── Direct Crypto Responses ──
    if (msg.includes('what is crypto') || msg.includes('what is cryptocurrency')) {
        return "Cryptocurrency is a digital or virtual currency that uses cryptography for security. Unlike traditional currencies, it's decentralized and typically operates on a blockchain. 🌐";
    }
    if (msg.includes('what is blockchain')) {
        return "A blockchain is a decentralized, distributed ledger that records transactions across many computers. It's the technology that makes cryptocurrencies like Bitcoin possible! ⛓️";
    }
    if (msg.includes('price') && !msg.includes('bitcoin') && !msg.includes('eth') && !msg.includes('sol')) {
        return `📊 **Live Market Prices:**\n• BTC: ${formatPrice(prices.bitcoin.price)}\n• ETH: ${formatPrice(prices.ethereum.price)}\n• SOL: ${formatPrice(prices.solana.price)}\n• XRP: ${formatPrice(prices.ripple.price)}\n• DOGE: ${formatPrice(prices.dogecoin.price)}`;
    }
    if (msg.includes('bitcoin') || msg.includes('btc')) {
        const p = prices.bitcoin;
        return `₿ **Bitcoin (BTC)** is at **${formatPrice(p.price)}**. It's the original digital gold created by Satoshi Nakamoto.`;
    }
    if (msg.includes('ethereum') || msg.includes('eth')) {
        const p = prices.ethereum;
        return `🔷 **Ethereum (ETH)** is currently **${formatPrice(p.price)}**. It powers smart contracts and the DeFi ecosystem.`;
    }

    // ── Non-Crypto Refusal ──
    if (!isCrypto && msg.length > 5) {
        return "I am a specialized Crypto AI. Please ask me anything about Bitcoin, Blockchain, or Market Trends! ₿🚀";
    }

    return "I'm here to help with crypto! Ask me about prices, news, or how blockchain works. 💬";
};

// ─── POST /api/chat (Protected) ───────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
        const reply = await getBotReply(message);
        res.json({ success: true, reply });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ success: false, error: 'AI Error' });
    }
});

module.exports = router;
