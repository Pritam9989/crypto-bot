// Shared price store to be used by crypto routes and AI chat
let priceCache = {
    bitcoin:  { price: 0, change24h: 0, name: 'Bitcoin', symbol: 'BTC' },
    ethereum: { price: 0, change24h: 0, name: 'Ethereum', symbol: 'ETH' },
    solana:   { price: 0, change24h: 0, name: 'Solana', symbol: 'SOL' },
    dogecoin: { price: 0, change24h: 0, name: 'Dogecoin', symbol: 'DOGE' },
    ripple:   { price: 0, change24h: 0, name: 'XRP', symbol: 'XRP' }
};

let lastFetch = 0;

module.exports = {
    getPrices: () => priceCache,
    setPrices: (newPrices) => { 
        priceCache = { ...priceCache, ...newPrices };
        lastFetch = Date.now();
    },
    getLastFetch: () => lastFetch
};
