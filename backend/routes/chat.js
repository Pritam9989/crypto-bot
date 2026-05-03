const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');

// ─── Smart Crypto AI Response Engine ──────────────────────────────────────────
const getBotReply = (message) => {
    const msg = message.toLowerCase().trim();

    // ── Greetings ────────────────────────────────────────────────────────────
    if (/^(hi|hello|hey|yo|sup|hii|helo|greetings)/.test(msg)) {
        const tips = [
            "💡 Tip: Never invest more than you can afford to lose.",
            "💡 Tip: Bitcoin has never recovered to its ATH within 1 week — patience is key.",
            "💡 Tip: DCA (Dollar Cost Averaging) is a great strategy for volatile markets.",
            "💡 Tip: Always store your crypto in a cold wallet for large amounts.",
            "💡 Tip: Research the team and use-case before investing in any altcoin.",
        ];
        const tip = tips[Math.floor(Math.random() * tips.length)];
        return `👋 Hello! I'm your Crypto AI Assistant.\nI can help you understand crypto, market trends, and news.\n\n${tip}\n\nTry asking me about Bitcoin, Ethereum, Solana, or DeFi!`;
    }

    // ── Risk / Crash Alerts ────────────────────────────────────────────────────
    if (msg.includes('crash') || msg.includes('falling') || msg.includes('dropping') ||
        (msg.includes('down') && (msg.includes('market') || msg.includes('price') || msg.includes('crypto')))) {
        return "⚠️ Market Alert: Prices are dropping due to heavy selling pressure.\n📉 Why: Could be macro news, whale sell-offs, or regulatory fears.\n🔴 Risk Level: HIGH\n\nIf you're invested: stay calm, don't panic sell.\nHistorically, markets recover over time.\n\n⚠️ This is not financial advice.";
    }

    // ── Buy / Sell / Investment ────────────────────────────────────────────────
    if (msg.includes('should i buy') || msg.includes('should i sell') || msg.includes('should i invest') ||
        (msg.includes('buy') && (msg.includes('bitcoin') || msg.includes('btc') || msg.includes('eth') || msg.includes('crypto'))) ||
        msg.includes('good time to buy') || msg.includes('good time to sell')) {
        return "📊 Investment Outlook:\n📈 Long-term (1+ year): Historically, BTC & ETH have trended upward.\n📉 Short-term: High volatility, unpredictable swings.\n🟡 Risk Level: Medium to High\n\nStrategy tip: Consider DCA (buy small amounts regularly) rather than lump-sum investing.\n\n⚠️ This is not financial advice. Always do your own research (DYOR).";
    }

    // ── Portfolio Questions ────────────────────────────────────────────────────
    if (msg.includes('portfolio') || msg.includes('how much') || msg.includes('profit') || msg.includes('loss') || msg.includes('gains')) {
        return "📂 Portfolio Tips:\n• Use the Portfolio Calculator on the dashboard to track your holdings.\n• Diversify — don't put all eggs in one basket.\n• Set a stop-loss at 10–15% below entry to limit losses.\n• Review your portfolio weekly, not daily — daily checks cause stress.\n\n⚠️ This is not financial advice.";
    }

    // ── Market Trends / Price ─────────────────────────────────────────────────
    if (msg.includes('price') || msg.includes('trend') || msg.includes('market') || msg.includes('how is') || msg.includes('bull') || msg.includes('bear')) {
        return "📈 Market Overview:\nCrypto markets are highly dynamic and move 24/7.\n\n🟢 Bull Market: Prices rising, high investor optimism.\n🔴 Bear Market: Prices falling, widespread pessimism.\n\nCheck the Live Markets panel above for real-time prices and 24h changes.\n🟡 Risk Level: Medium\n\n⚠️ This is not financial advice.";
    }

    // ── Crypto News ────────────────────────────────────────────────────────────
    if (msg.includes('news') || msg.includes('happened') || msg.includes('latest') || msg.includes('update') || msg.includes('today')) {
        return "📰 Market News Snapshot:\n1. What: Crypto markets are showing mixed signals.\n2. Why: Global economic uncertainty + institutional trading activity.\n3. Impact: Short-term volatility expected — prices may swing both ways.\n\n💡 Stay updated with reliable sources like CoinDesk, CoinTelegraph, and Bloomberg Crypto.\n⚠️ This is not financial advice.";
    }

    // ── Bitcoin ────────────────────────────────────────────────────────────────
    if (msg.includes('bitcoin') || msg.includes('btc')) {
        return "₿ Bitcoin (BTC):\n• Created in 2009 by the anonymous Satoshi Nakamoto.\n• Fixed supply of 21 million coins — true digital scarcity.\n• Called 'Digital Gold' — a store of value like gold bars.\n• Halving events (every ~4 years) cut new supply, historically boosting price.\n\n🔴 Risk: Highly volatile. Prices can drop 30–50% in weeks.\n⚠️ This is not financial advice.";
    }

    // ── Ethereum ──────────────────────────────────────────────────────────────
    if (msg.includes('ethereum') || msg.includes('eth')) {
        return "🔷 Ethereum (ETH):\n• More than currency — it's a programmable blockchain platform.\n• Powers smart contracts and 1000s of decentralised apps (dApps).\n• ETH is the 'gas' that fuels all operations on the Ethereum network.\n• Transitioned to Proof-of-Stake (PoS) in 2022 — 99.9% more energy efficient.\n\n🟡 Risk: Volatile but strong fundamentals.\n⚠️ This is not financial advice.";
    }

    // ── Solana ────────────────────────────────────────────────────────────────
    if (msg.includes('solana') || msg.includes('sol')) {
        return "⚡ Solana (SOL):\n• One of the fastest blockchains — 65,000 transactions per second.\n• Very low fees (< $0.01 per tx) — great for NFTs and DeFi.\n• A strong competitor to Ethereum.\n• Known for occasional network outages in the past.\n\n🔴 Risk: Higher volatility than BTC/ETH. Strong tech but still maturing.\n⚠️ This is not financial advice.";
    }

    // ── Dogecoin ──────────────────────────────────────────────────────────────
    if (msg.includes('dogecoin') || msg.includes('doge')) {
        return "🐶 Dogecoin (DOGE):\n• Started as a meme in 2013 — became a top-10 coin!\n• Unlimited supply (no cap) — inflationary by design.\n• Heavily influenced by social media hype and Elon Musk tweets.\n• Used for tipping online and some payments.\n\n🔴 Risk: Very HIGH — primarily meme/sentiment driven.\n⚠️ This is not financial advice.";
    }

    // ── XRP / Ripple ──────────────────────────────────────────────────────────
    if (msg.includes('xrp') || msg.includes('ripple')) {
        return "💎 XRP (Ripple):\n• Designed for ultra-fast international bank transfers.\n• Settlement in 3–5 seconds, fees less than 1 cent.\n• Ripple Labs controls a significant portion of XRP — centralization concern.\n• Faced major SEC lawsuit (2020–2023) — partially resolved, boosting price.\n\n🟡 Risk: Medium — dependent on regulatory outcomes.\n⚠️ This is not financial advice.";
    }

    // ── Blockchain ────────────────────────────────────────────────────────────
    if (msg.includes('blockchain')) {
        return "🔗 Blockchain Explained:\nImagine a shared Google Sheet that thousands of computers hold simultaneously.\n• Every transaction is recorded as a 'block' and chained to previous ones.\n• Once written, data CANNOT be altered — permanent and transparent.\n• No central authority controls it — it's decentralised.\n\n💡 It's the technology that makes crypto trustworthy and secure.";
    }

    // ── Cryptocurrency General ──────────────────────────────────────────────────
    if (msg.includes('crypto') || msg.includes('cryptocurrency') || msg.includes('cruncy')) {
        return "💰 Cryptocurrency Explained:\nCryptocurrency is a digital or virtual currency secured by cryptography.\n• It doesn't rely on banks to verify transactions.\n• It is decentralized, meaning no single government or entity controls it.\n• Bitcoin was the first cryptocurrency, created in 2009.\n• It uses 'Blockchain' technology to keep a public ledger of all transactions.\n\n💡 Try asking me: 'What is Bitcoin?' or 'What is Blockchain?'";
    }

    // ── Wallet ────────────────────────────────────────────────────────────────
    if (msg.includes('wallet')) {
        return "👛 Crypto Wallets:\n• Hot Wallet (online): MetaMask, Trust Wallet — easy to use, less secure.\n• Cold Wallet (offline): Ledger, Trezor — hardware device, most secure for large amounts.\n• Exchange Wallet: Coinbase, Binance — convenient but NOT fully yours.\n\n🔒 Golden Rule: 'Not your keys, not your coins!'\nAlways back up your seed phrase — NEVER share it with anyone.";
    }

    // ── DeFi ──────────────────────────────────────────────────────────────────
    if (msg.includes('defi') || msg.includes('decentralized finance') || msg.includes('decentralised finance')) {
        return "🏦 DeFi (Decentralized Finance):\nBanking without banks — financial services run on blockchain code.\n• Lending & Borrowing: Earn interest or borrow crypto (Aave, Compound).\n• DEX (Decentralized Exchange): Trade without a middleman (Uniswap).\n• Yield Farming: Earn rewards by providing liquidity.\n\n🔴 Risk: Very HIGH — smart contract bugs, rug pulls, high volatility.\n⚠️ This is not financial advice.";
    }

    // ── NFT ───────────────────────────────────────────────────────────────────
    if (msg.includes('nft') || msg.includes('non-fungible')) {
        return "🎨 NFTs (Non-Fungible Tokens):\nUnique digital assets stored on a blockchain — like digital collectibles.\n• Each NFT is one-of-a-kind and provably scarce.\n• Used for: art, music, gaming items, virtual real estate.\n• Peak in 2021–2022, market has cooled significantly since.\n\n🔴 Risk: Very HIGH — most NFTs lost 90%+ of value after the hype cycle.\nOnly buy what you genuinely appreciate, not for speculation.";
    }

    // ── Staking ───────────────────────────────────────────────────────────────
    if (msg.includes('staking') || msg.includes('stake')) {
        return "🥩 Staking Explained:\nEarn passive income by locking up crypto to help validate transactions.\n• Like earning interest in a savings account — but for crypto.\n• ETH staking: ~3–5% APY. SOL staking: ~6–8% APY.\n• Risk: Your coins are locked for a period. If price drops, your rewards may not cover the loss.\n\n💡 Best for long-term holders who believe in the coin anyway.";
    }

    // ── Mining ────────────────────────────────────────────────────────────────
    if (msg.includes('mining') || msg.includes('mine crypto')) {
        return "⛏️ Crypto Mining:\nThe process of validating transactions using computing power (Proof of Work).\n• Bitcoin mining: Requires massive energy + expensive ASICs.\n• Miners earn BTC as reward for solving complex math puzzles.\n• Ethereum stopped mining in 2022 — switched to Proof of Stake.\n\n💡 Home mining Bitcoin is not profitable in 2024 unless you have very cheap electricity.\n⚠️ This is not financial advice.";
    }

    // ── Gas Fees ──────────────────────────────────────────────────────────────
    if (msg.includes('gas') || msg.includes('gas fee') || msg.includes('transaction fee')) {
        return "⛽ Gas Fees:\nThe cost to execute a transaction on a blockchain.\n• Ethereum gas can spike to $50–$100 during high demand.\n• Solana & Polygon have gas fees under $0.01.\n• Gas fees go to validators, not the network's developers.\n\n💡 Tip: Use off-peak hours (weekends, late nights UTC) to save on Ethereum gas fees.";
    }

    // ── USDT / Stablecoins ────────────────────────────────────────────────────
    if (msg.includes('usdt') || msg.includes('usdc') || msg.includes('stablecoin') || msg.includes('stable')) {
        return "💵 Stablecoins (USDT, USDC):\nCryptocurrencies pegged 1:1 to a fiat currency like USD.\n• USDT (Tether): Largest stablecoin by market cap.\n• USDC (Circle): More transparent and regulated.\n• Use case: Park money safely during market crashes, earn yield, pay on-chain.\n\n⚠️ Risk: Even stablecoins can 'de-peg' — USDC briefly lost its peg in 2023.\n⚠️ This is not financial advice.";
    }

    // ── Altcoin ───────────────────────────────────────────────────────────────
    if (msg.includes('altcoin') || msg.includes('alt coin') || msg.includes('alts')) {
        return "🪙 Altcoins:\nAny cryptocurrency that is NOT Bitcoin is called an altcoin.\n• Large caps: ETH, SOL, XRP, BNB — more stable, higher liquidity.\n• Mid/Small caps: Higher risk, higher potential reward.\n• Meme coins: DOGE, SHIB — driven by hype, very risky.\n\n💡 Rule of thumb: Higher risk = higher potential return, but also higher chance of 0.\n⚠️ This is not financial advice.";
    }

    // ── What can you do / help ─────────────────────────────────────────────────
    if (msg.includes('what can you') || msg.includes('help me') || msg.includes('what do you know') || msg.includes('topics')) {
        return "🤖 I can help you with:\n\n• 📈 Market trends (bull, bear, crash)\n• 💰 Coins: Bitcoin, Ethereum, Solana, Dogecoin, XRP\n• 🏦 DeFi, NFTs, Staking, Mining, Gas Fees\n• 📰 Crypto news summaries\n• 👛 Wallets & Security\n• 💵 Stablecoins (USDT, USDC)\n• 📂 Portfolio tips\n\nJust ask me anything about crypto! 🚀";
    }

    // ── Default Fallback ───────────────────────────────────────────────────────
    return "🤖 I'm your Crypto AI Assistant. I didn't quite catch that!\n\nYou can ask me about:\n• Bitcoin, Ethereum, Solana, Dogecoin, XRP\n• DeFi, NFTs, Staking, Mining, Gas Fees\n• Wallets, Stablecoins, Market Trends\n• Portfolio tips and crypto news\n\nTry: 'What is blockchain?' or 'Should I buy Bitcoin?' 💬";
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
