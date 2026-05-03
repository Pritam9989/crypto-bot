const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');

// ─── Cache to avoid hammering CoinGecko free tier ─────────────────────────────
let priceCache = null;
let lastFetch  = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

// GET /api/crypto/prices (Protected) — Top 5 coins
router.get('/prices', protect, async (req, res) => {
    try {
        const now = Date.now();

        // Return cached data if fresh
        if (priceCache && (now - lastFetch) < CACHE_TTL) {
            return res.json({ success: true, data: priceCache, cached: true });
        }

        const url = 'https://api.coingecko.com/api/v3/simple/price' +
            '?ids=bitcoin,ethereum,solana,dogecoin,ripple' +
            '&vs_currencies=usd' +
            '&include_24hr_change=true' +
            '&include_market_cap=true' +
            '&include_24hr_vol=true';

        const response = await fetch(url);

        if (!response.ok) {
            // Return stale cache if available
            if (priceCache) {
                return res.json({ success: true, data: priceCache, cached: true, stale: true });
            }
            throw new Error(`CoinGecko responded with ${response.status}`);
        }

        const raw = await response.json();

        const fmt = (coin) => ({
            price:     coin?.usd             ?? 0,
            change24h: coin?.usd_24h_change  ?? 0,
            marketCap: coin?.usd_market_cap  ?? 0,
            volume24h: coin?.usd_24h_vol     ?? 0,
        });

        priceCache = {
            bitcoin:  { ...fmt(raw.bitcoin),  name: 'Bitcoin',  symbol: 'BTC' },
            ethereum: { ...fmt(raw.ethereum), name: 'Ethereum', symbol: 'ETH' },
            solana:   { ...fmt(raw.solana),   name: 'Solana',   symbol: 'SOL' },
            dogecoin: { ...fmt(raw.dogecoin), name: 'Dogecoin', symbol: 'DOGE' },
            ripple:   { ...fmt(raw.ripple),   name: 'XRP',      symbol: 'XRP' },
        };

        lastFetch = now;
        res.json({ success: true, data: priceCache });

    } catch (err) {
        console.error('Price fetch error:', err.message);
        if (priceCache) {
            return res.json({ success: true, data: priceCache, cached: true, stale: true });
        }
        res.status(500).json({ success: false, message: 'Unable to fetch prices right now. Please try again shortly.' });
    }
});

// Keep old /price route for backwards compatibility
router.get('/price', protect, async (req, res) => {
    try {
        const now = Date.now();
        if (priceCache && (now - lastFetch) < CACHE_TTL) {
            return res.json({
                success: true,
                data: {
                    bitcoin:  { price: priceCache.bitcoin.price,  change24h: priceCache.bitcoin.change24h,  marketCap: priceCache.bitcoin.marketCap  },
                    ethereum: { price: priceCache.ethereum.price, change24h: priceCache.ethereum.change24h, marketCap: priceCache.ethereum.marketCap },
                }
            });
        }

        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true'
        );
        const data = await response.json();

        res.json({
            success: true,
            data: {
                bitcoin:  { price: data.bitcoin.usd,  change24h: data.bitcoin.usd_24h_change,  marketCap: data.bitcoin.usd_market_cap  },
                ethereum: { price: data.ethereum.usd, change24h: data.ethereum.usd_24h_change, marketCap: data.ethereum.usd_market_cap },
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to fetch prices.' });
    }
});

module.exports = router;
