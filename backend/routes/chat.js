const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const priceStore = require('../priceStore');

// ─── Smart Crypto AI Response Engine ──────────────────────────────────────────
const getBotReply = (message) => {
    const msg = message.toLowerCase().trim();
    const prices = priceStore.getPrices();
    const formatPrice = (p) => p > 0 ? `$${p.toLocaleString()}` : "fetching...";

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

    // ── Conversational Small Talk (Only if it's about the bot itself) ──
    if (/^(hi|hello|hey|yo|sup|hii|helo|greetings)/.test(msg)) {
        return "👋 Hey there! I'm your Crypto AI. I'm feeling bullish today! 🚀\n\nI can talk about anything in the crypto world—from Bitcoin prices to how Blockchain works. What's on your mind?";
    }
    if (msg.includes('how are you') || msg.includes('how r u')) {
        return "😊 I'm doing great! Just watching the charts and waiting for the next big move. How about you? Ready to talk crypto?";
    }
    if (msg.includes('who are you') || msg.includes('what are you')) {
        return "🤖 I'm your specialized Crypto AI Assistant. My job is to help you navigate the wild world of Web3 and digital currencies. I'm basically a ChatGPT that went to crypto school! 🎓";
    }

    // ── Refuse Non-Crypto Topics ──
    if (!isCrypto && msg.length > 5) {
        return "🙏 I'd love to chat, but I'm specialized **only in Cryptocurrency and Blockchain**. \n\nPlease ask me anything about Bitcoin, Market Trends, or how to stay safe in Crypto! ₿🚀";
    }

    // ── Deep Crypto Knowledge Base ──
    
    // Bitcoin
    if (msg.includes('bitcoin') || msg.includes('btc')) {
        const p = prices.bitcoin;
        return `₿ **Bitcoin (BTC)** is the king! Currently trading at **${formatPrice(p.price)}**. \n\nIt was created by Satoshi Nakamoto to be "Digital Gold." It has a limited supply of 21 million, which makes it scarce. Think of it as a global, permissionless bank in your pocket. 🏦✨`;
    }

    // Ethereum
    if (msg.includes('ethereum') || msg.includes('eth')) {
        const p = prices.ethereum;
        return `🔷 **Ethereum (ETH)** is more than just money—it's a world computer. It's currently at **${formatPrice(p.price)}**. \n\nIt powers "Smart Contracts," which are like digital laws that run automatically. If Bitcoin is gold, Ethereum is the internet's electricity! ⚡🌍`;
    }

    // Market State
    if (msg.includes('market') || msg.includes('price') || msg.includes('trend') || msg.includes('crash')) {
        return "📈 **Market Insight:** Crypto markets never sleep! We're seeing some high volatility right now. \n\nIf you're worried about a crash, remember: 'Time in the market beats timing the market.' Stay calm, keep your seed phrases safe, and always look at the long-term charts! 📊📉";
    }

    // Investment Advice (Casual)
    if (msg.includes('should i buy') || msg.includes('should i invest') || msg.includes('good time')) {
        return "🤔 **Great question!** While I can't give financial advice, many experts suggest 'DCA' (Dollar Cost Averaging). Instead of buying all at once, buy a little bit every week. \n\nIt reduces stress and helps you build a position over time. Are you looking to buy Bitcoin or an altcoin? 💰🔍";
    }

    // Wallets & Security
    if (msg.includes('wallet') || msg.includes('safe') || msg.includes('security') || msg.includes('keys')) {
        return "🛡️ **Security is #1!** Always use a Hardware Wallet (like Ledger or Trezor) for large amounts. \n\n**NEVER** share your 12-word seed phrase with anyone—not even me! If someone asks for it, it's a scam. 'Not your keys, not your coins!' 🔐🚫";
    }

    // DeFi / NFTs
    if (msg.includes('defi') || msg.includes('nft') || msg.includes('staking')) {
        return "🚀 **Web3 is huge!** \n\n• **DeFi:** Banking without banks (Lending, Borrowing).\n• **Staking:** Earning 'interest' on your crypto (like a savings account).\n• **NFTs:** Digital ownership of art and items.\n\nWhich one do you want to dive deeper into? 🌊💎";
    }

    // General Crypto
    if (isCrypto) {
        return "🌟 **That's a fascinating part of crypto!** \n\nThe crypto space is evolving every single day. Whether it's institutional adoption or new technology like Layer 2s, there's always something to learn. \n\nDo you want me to explain the technical side or the investment side? 🧠💸";
    }

    // Default Fallback (Casual)
    return "🤖 I'm here to help! I'm a specialized Crypto AI. \n\nYou can ask me 'anything' about Bitcoin, how to buy crypto, or what a blockchain is. \n\nWhat's your biggest question about the crypto market right now? 💬🚀";
};

// ─── POST /api/chat (Protected) ───────────────────────────────────────────────
router.post('/', protect, (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
        }

        const reply = getBotReply(message);
        res.json({ success: true, reply });

    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

module.exports = router;
