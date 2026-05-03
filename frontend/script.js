// ============================================================================
// CONFIG & UTILS
// ============================================================================
const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const getToken = () => localStorage.getItem('cryptoToken');
const getUser  = () => JSON.parse(localStorage.getItem('cryptoUser') || '{}');

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

function showAlert(id, msg, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = msg; // allow icons
    el.className = `alert ${type}`;
}

function hideAlert(id) {
    const el = document.getElementById(id);
    if (el) el.className = 'alert hidden';
}

function setLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = isLoading;
    const textSpan = btn.querySelector('.btn-text');
    const icon = btn.querySelector('i');
    if (textSpan) {
        textSpan.textContent = isLoading ? 'Please wait...' : (btn.dataset.label || 'Submit');
    }
    if (icon) {
        icon.className = isLoading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-arrow-right';
    }
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check success"></i>' : '<i class="fa-solid fa-triangle-exclamation error"></i>';
    toast.innerHTML = `${icon} <span>${msg}</span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================================
// AUTH ROUTING
// ============================================================================
const isAuthPage = window.location.pathname.includes('index.html') || window.location.pathname.includes('register.html') || window.location.pathname === '/' || window.location.pathname === '';
const isDashPage = window.location.pathname.includes('dashboard.html');

if (isDashPage && !getToken()) {
    window.location.href = 'index.html';
}
if (isAuthPage && getToken()) {
    window.location.href = 'dashboard.html';
}

// ============================================================================
// LOGIN PAGE
// ============================================================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('login-alert');
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) return showAlert('login-alert', 'Please fill in all fields.');

        setLoading('login-btn', true);
        try {
            const res  = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('cryptoToken', data.token);
                localStorage.setItem('cryptoUser', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                showAlert('login-alert', data.message);
            }
        } catch (err) {
            showAlert('login-alert', 'Cannot connect to server.');
        } finally {
            setLoading('login-btn', false);
        }
    });
}

// ============================================================================
// REGISTER PAGE
// ============================================================================
const registerForm = document.getElementById('register-form');
const regPass = document.getElementById('reg-password');
if (regPass) {
    regPass.addEventListener('input', (e) => {
        const val = e.target.value;
        const bar = document.getElementById('pw-bar');
        const label = document.getElementById('pw-label');
        if (!val) { bar.className = 'pw-bar'; bar.style.width = '0'; label.textContent = ''; return; }
        
        let strength = 0;
        if (val.length >= 6) strength++;
        if (/[A-Z]/.test(val) && /[0-9]/.test(val)) strength++;
        if (/[^A-Za-z0-9]/.test(val) && val.length >= 8) strength++;

        if (strength === 1) { bar.className = 'pw-bar pw-weak'; label.textContent = 'Weak'; label.style.color = 'var(--danger)'; }
        else if (strength === 2) { bar.className = 'pw-bar pw-medium'; label.textContent = 'Medium'; label.style.color = 'var(--warning)'; }
        else if (strength === 3) { bar.className = 'pw-bar pw-strong'; label.textContent = 'Strong'; label.style.color = 'var(--success)'; }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('register-alert');
        const email    = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm  = document.getElementById('reg-confirm').value;

        if (!email || !password || !confirm) return showAlert('register-alert', 'Please fill in all fields.');
        if (password.length < 6) return showAlert('register-alert', 'Password must be at least 6 characters.');
        if (password !== confirm) return showAlert('register-alert', 'Passwords do not match.');

        setLoading('register-btn', true);
        try {
            const res  = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('cryptoToken', data.token);
                localStorage.setItem('cryptoUser', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                showAlert('register-alert', data.message);
            }
        } catch {
            showAlert('register-alert', 'Cannot connect to server.');
        } finally {
            setLoading('register-btn', false);
        }
    });
}

// ============================================================================
// DASHBOARD PAGE
// ============================================================================
if (isDashPage) {
    const user = getUser();
    document.getElementById('nav-user-email').textContent = user.email || 'User';
    document.getElementById('user-avatar-sm').textContent = (user.email || 'U')[0].toUpperCase();

    // Set greeting time
    document.getElementById('welcome-time').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // ── PRICES & PORTFOLIO ──
    let pricesData = {
        bitcoin: { price: 65000, change24h: 0, marketCap: 0, volume24h: 0 },
        ethereum: { price: 3500, change24h: 0, marketCap: 0, volume24h: 0 },
        solana: { price: 150, change24h: 0, marketCap: 0, volume24h: 0 },
        dogecoin: { price: 0.15, change24h: 0, marketCap: 0, volume24h: 0 },
        ripple: { price: 0.60, change24h: 0, marketCap: 0, volume24h: 0 }
    };
    const REFRESH_INTERVAL = 60;
    let countdown = REFRESH_INTERVAL;
    let refreshTimer;

    function formatMoney(num) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    }
    function formatCompact(num) {
        return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
    }

    function updateSentiment(coins) {
        // Simple sentiment: average 24h change of top coins
        let totalChange = 0;
        let count = 0;
        for (const key in coins) {
            totalChange += coins[key].change24h;
            count++;
        }
        const avg = totalChange / count;
        
        const labelEl = document.getElementById('sentiment-value');
        const iconEl = document.getElementById('sentiment-icon');
        const fillEl = document.getElementById('sentiment-fill');
        
        // Map -10% to 10% onto 0% to 100% scale
        let pos = 50 + (avg * 5); 
        if (pos < 0) pos = 0; if (pos > 100) pos = 100;
        fillEl.style.left = `${pos}%`;

        if (avg < -3) {
            labelEl.textContent = 'Extreme Fear'; labelEl.style.color = 'var(--danger)'; iconEl.textContent = '😨';
        } else if (avg < 0) {
            labelEl.textContent = 'Fear'; labelEl.style.color = 'var(--warning)'; iconEl.textContent = '😟';
        } else if (avg < 3) {
            labelEl.textContent = 'Neutral'; labelEl.style.color = 'var(--text)'; iconEl.textContent = '😐';
        } else if (avg < 7) {
            labelEl.textContent = 'Greed'; labelEl.style.color = 'var(--success)'; iconEl.textContent = '😌';
        } else {
            labelEl.textContent = 'Extreme Greed'; labelEl.style.color = 'var(--success)'; iconEl.textContent = '🤑';
        }
    }
    async function fetchPrices(manual = false) {
        if (manual) {
            const icon = document.getElementById('refresh-icon');
            if (icon) icon.classList.add('fa-spin');
        }

        try {
            // Try CoinCap first
            let res = await fetch('https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,solana,dogecoin,xrp').catch(() => null);
            let json = res ? await res.json() : null;
            
            if (json && json.data) {
                const newPrices = {};
                json.data.forEach(coin => {
                    const key = coin.id === 'xrp' ? 'ripple' : coin.id;
                    newPrices[key] = {
                        price: parseFloat(coin.priceUsd),
                        change24h: parseFloat(coin.changePercent24Hr),
                        marketCap: parseFloat(coin.marketCapUsd),
                        volume24h: parseFloat(coin.volumeUsd24Hr)
                    };
                });
                pricesData = newPrices;
            } else {
                // Fallback to Binance for at least prices if CoinCap fails
                const binanceUrl = 'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22,%22DOGEUSDT%22,%22XRPUSDT%22%5D';
                const bRes = await fetch(binanceUrl).catch(() => null);
                const bJson = bRes ? await bRes.json() : null;
                
                if (bJson && Array.isArray(bJson)) {
                    const mapping = { BTCUSDT: 'bitcoin', ETHUSDT: 'ethereum', SOLUSDT: 'solana', DOGEUSDT: 'dogecoin', XRPUSDT: 'ripple' };
                    bJson.forEach(item => {
                        const key = mapping[item.symbol];
                        if (key) {
                            pricesData[key] = {
                                price: parseFloat(item.lastPrice),
                                change24h: parseFloat(item.priceChangePercent),
                                marketCap: pricesData[key]?.marketCap || 0,
                                volume24h: parseFloat(item.quoteVolume)
                            };
                        }
                    });
                }
            }

            if (Object.keys(pricesData).length > 0) {
                const coins = ['bitcoin', 'ethereum', 'solana', 'dogecoin', 'ripple'];
                
                coins.forEach(c => {
                    const data = pricesData[c];
                    if (!data) return;

                    // Price
                    const priceEl = document.getElementById(`price-${c}`);
                    if (priceEl) priceEl.textContent = data.price < 1 ? `$${data.price.toFixed(4)}` : formatMoney(data.price);
                    
                    // Change
                    const changeEl = document.getElementById(`change-${c}`);
                    if (changeEl) {
                        const isUp = data.change24h >= 0;
                        changeEl.className = `coin-change ${isUp ? 'up' : 'down'}`;
                        changeEl.innerHTML = `<i class="fa-solid fa-arrow-${isUp ? 'up' : 'down'}"></i> ${Math.abs(data.change24h).toFixed(2)}%`;
                    }

                    // Meta
                    const mcapEl = document.getElementById(`mcap-${c}`);
                    const volEl = document.getElementById(`vol-${c}`);
                    if (mcapEl) mcapEl.textContent = data.marketCap > 0 ? `$${formatCompact(data.marketCap)}` : '—';
                    if (volEl) volEl.textContent = data.volume24h > 0 ? `$${formatCompact(data.volume24h)}` : '—';
                });

                document.getElementById('last-updated').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
                updateSentiment(pricesData);
                calculatePortfolio();
                
                // Sync prices with backend so AI Chatbot can see them
                fetch(`${API}/crypto/sync`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ prices: pricesData })
                }).catch(e => console.error('Sync failed', e));

                if (manual) showToast('Prices updated');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            if (manual) showToast('Failed to update prices', 'error');
        } finally {
            if (manual) {
                const icon = document.getElementById('refresh-icon');
                if (icon) icon.classList.remove('fa-spin');
            }
            countdown = REFRESH_INTERVAL;
            document.getElementById('refresh-countdown').textContent = countdown + 's';
        }
    }

    // Auto-refresh logic
    function startTimer() {
        refreshTimer = setInterval(() => {
            countdown--;
            document.getElementById('refresh-countdown').textContent = countdown + 's';
            if (countdown <= 0) fetchPrices();
        }, 1000);
    }

    document.getElementById('btn-refresh').addEventListener('click', () => fetchPrices(true));
    fetchPrices();
    startTimer();

    // ── PORTFOLIO ──
    const pInputs = document.querySelectorAll('.p-input');
    
    // Load saved portfolio
    const savedP = JSON.parse(localStorage.getItem('cryptoPortfolio') || '{}');
    pInputs.forEach(input => {
        const coin = input.id.replace('p-', '');
        if (savedP[coin]) input.value = savedP[coin];
        input.addEventListener('input', calculatePortfolio);
    });

    function calculatePortfolio() {
        let total = 0;
        const currentP = {};

        pInputs.forEach(input => {
            const coin = input.id.replace('p-', '');
            const amount = parseFloat(input.value) || 0;
            if (amount > 0) currentP[coin] = amount;

            const valEl = document.getElementById(`pv-${coin}`);
            if (pricesData[coin]) {
                const value = amount * pricesData[coin].price;
                total += value;
                if (valEl) valEl.textContent = formatMoney(value);
            }
        });

        document.getElementById('portfolio-total').textContent = formatMoney(total);
        localStorage.setItem('cryptoPortfolio', JSON.stringify(currentP));
    }

    document.getElementById('clear-portfolio').addEventListener('click', () => {
        pInputs.forEach(i => i.value = '');
        calculatePortfolio();
        showToast('Portfolio cleared');
    });

    // ── CHAT ──
    const messagesEl = document.getElementById('chat-messages');
    const chatForm   = document.getElementById('chat-form');
    const chatInput  = document.getElementById('chat-input');
    const sendBtn    = document.getElementById('send-btn');

    function getTime() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

    function appendMsg(text, role) {
        const div = document.createElement('div');
        div.className = `msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
        div.innerHTML = `<div class="msg-bubble">${text}</div><span class="msg-time">${getTime()}</span>`;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'msg bot-msg'; div.id = 'typing-indicator';
        div.innerHTML = `<div class="typing-bubble"><div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div></div>`;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendMessage(text) {
        if (!text.trim()) return;
        appendMsg(text, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;
        showTyping();

        try {
            const res = await fetch(`${API}/chat`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ message: text })
            });

            if (res.status === 401) { localStorage.clear(); window.location.href = 'index.html'; return; }
            
            const data = await res.json();
            document.getElementById('typing-indicator')?.remove();
            
            if (data.success) {
                appendMsg(data.reply, 'bot');
            } else {
                appendMsg('⚠️ ' + (data.message || 'Error occurred.'), 'bot');
            }
        } catch {
            document.getElementById('typing-indicator')?.remove();
            appendMsg('❌ Cannot connect to AI Engine.', 'bot');
        } finally {
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(chatInput.value);
    });

    window.sendQuick = function(text) {
        chatInput.value = text;
        chatForm.dispatchEvent(new Event('submit'));
    };
}
