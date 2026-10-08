let currentUserId = null;
let gameLoopInterval = null;

// UI Elements
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const villageNameLabel = document.getElementById('village-name');

// Resource UI
const resWood = document.getElementById('res-wood');
const resStone = document.getElementById('res-stone');
const resFood = document.getElementById('res-food');
const resCoins = document.getElementById('res-coins');

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

// Format numbers (e.g. 1500 -> 1.5k)
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toString();
}

// Update UI state
function updateUI(data) {
    resWood.innerText = formatNumber(data.village.wood);
    resStone.innerText = formatNumber(data.village.stone);
    resFood.innerText = formatNumber(data.village.food);
    resCoins.innerText = formatNumber(data.user.ancient_coins);
}

// Fetch Game State
async function fetchState() {
    if (!currentUserId) return;
    try {
        const response = await fetch(`/api/state/${currentUserId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        updateUI(data);
    } catch (err) {
        console.error("Failed to fetch state:", err);
    }
}

// Login Handler
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) return alert("Enter a warlord name!");

    try {
        loginBtn.innerText = "Forging Path...";
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        currentUserId = data.id; // User ID from server
        villageNameLabel.innerText = `${username}'s Encampment`;

        // Switch Screen
        loginScreen.classList.remove('active');
        gameScreen.classList.add('active');

        // Initial Fetch & Start Loop
        fetchState();
        gameLoopInterval = setInterval(fetchState, 5000); // Poll every 5s

    } catch (err) {
        alert("Login failed: " + err.message);
        loginBtn.innerText = "Enter the Wasteland";
    }
});

// Navigation Handler
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Only switch if data-target exists
        const targetId = btn.getAttribute('data-target');
        if(!targetId) return; // For unimplemented tabs like Map

        // Reset active states
        navBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        // Set new active state
        btn.classList.add('active');
        document.getElementById(targetId).classList.add('active');
    });
});
