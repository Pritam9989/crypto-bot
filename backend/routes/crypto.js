const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const priceStore = require('../priceStore');

// ─── Cache to avoid rate limits ─────────────────────────────
let priceCache = null;
let lastFetch  = 0;
const CACHE_TTL = 5000; // 5 seconds for fast real-time updates!

// GET /api/crypto/prices (Protected) — Top 5 coins
router.get('/prices', protect, async (req, res) => {
    try {
        const now = Date.now();

        // Return cached data if fresh
        if (priceCache && (now - lastFetch) < CACHE_TTL) {
            return res.json({ success: true, data: priceCache, cached: true });
        }

        // Using CoinCap API which is much more reliable for free servers than CoinGecko
        const url = 'https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,solana,dogecoin,xrp';
        const response = await fetch(url);

        if (!response.ok) {
            if (priceCache) {
                return res.json({ success: true, data: priceCache, cached: true, stale: true });
            }
            throw new Error(`CoinCap responded with ${response.status}`);
        }

        const json = await response.json();
        
        if (!json.data || !Array.isArray(json.data)) {
            throw new Error("Invalid format from CoinCap");
        }

        const newCache = {};
        
        json.data.forEach(coin => {
            // CoinCap uses 'xrp' as the ID instead of 'ripple'
            const key = coin.id === 'xrp' ? 'ripple' : coin.id;
            newCache[key] = {
                name: coin.name,
                symbol: coin.symbol,
                price: parseFloat(coin.priceUsd) || 0,
                change24h: parseFloat(coin.changePercent24Hr) || 0,
                marketCap: parseFloat(coin.marketCapUsd) || 0,
                volume24h: parseFloat(coin.volumeUsd24Hr) || 0
            };
        });

        // Ensure all 5 coins exist in the output
        priceCache = {
            bitcoin:  newCache.bitcoin  || { price: 65000, change24h: 2.5, marketCap: 1.2e12, volume24h: 30e9, name: 'Bitcoin', symbol: 'BTC' },
            ethereum: newCache.ethereum || { price: 3500, change24h: 1.2, marketCap: 4e11, volume24h: 15e9, name: 'Ethereum', symbol: 'ETH' },
            solana:   newCache.solana   || { price: 150, change24h: 5.4, marketCap: 6e10, volume24h: 4e9, name: 'Solana', symbol: 'SOL' },
            dogecoin: newCache.dogecoin || { price: 0.15, change24h: -1.5, marketCap: 2e10, volume24h: 1e9, name: 'Dogecoin', symbol: 'DOGE' },
            ripple:   newCache.ripple   || { price: 0.60, change24h: 0.5, marketCap: 3e10, volume24h: 1.5e9, name: 'XRP', symbol: 'XRP' }
        };

        lastFetch = now;
        priceStore.setPrices(priceCache);
        res.json({ success: true, data: priceCache });

    } catch (err) {
        console.error('Price fetch error:', err.message);
        if (priceCache) {
            return res.json({ success: true, data: priceCache, cached: true, stale: true });
        }
        
        // Final fallback if everything fails
        priceCache = {
            bitcoin:  { price: 65000, change24h: 2.5, marketCap: 1200000000000, volume24h: 30000000000, name: 'Bitcoin', symbol: 'BTC' },
            ethereum: { price: 3500, change24h: 1.2, marketCap: 400000000000, volume24h: 15000000000, name: 'Ethereum', symbol: 'ETH' },
            solana:   { price: 150, change24h: 5.4, marketCap: 60000000000, volume24h: 4000000000, name: 'Solana', symbol: 'SOL' },
            dogecoin: { price: 0.15, change24h: -1.5, marketCap: 20000000000, volume24h: 1000000000, name: 'Dogecoin', symbol: 'DOGE' },
            ripple:   { price: 0.60, change24h: 0.5, marketCap: 30000000000, volume24h: 1500000000, name: 'XRP', symbol: 'XRP' }
        };
        lastFetch = Date.now();
        res.json({ success: true, data: priceCache, cached: true, stale: true, message: 'Using fallback data' });
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
