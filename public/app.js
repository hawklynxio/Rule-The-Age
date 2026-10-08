let currentUserId = null;
let gameLoopInterval = null;

// Translations
const translations = {
    en: {
        login_title: "RULE THE AGE", login_desc: "The apocalypse has passed. Rebuild from the ashes with swords, arrows, and scavenged tech.",
        login_ph: "Enter Warlord Name", login_btn: "Enter the Wasteland", supply_banner: "Daily Free Supplies Available!", claim_btn: "Claim",
        bldg_lumber: "Lumber Camp", bldg_lumber_desc: "Produces 🪵 Wood. Lvl 1",
        bldg_stone: "Scavenger Hut", bldg_stone_desc: "Produces 🪨 Stone. Lvl 1",
        bldg_food: "Hunting Lodge", bldg_food_desc: "Produces 🍖 Food. Lvl 1", upgrade_btn: "Upgrade",
        store_title: "The Scavenger's Market", store_item1: "🔥 Starter Warlord Pack", store_item1_desc: "+50k resources, +500 Coins",
        clan_title: "Clans", clan_desc: "Join a clan to share resources.", clan_find: "Find a Clan",
        settings_title: "Settings", language_label: "Language", language_desc: "Select your preferred game language.",
        nav_camp: "Camp", nav_store: "Store", nav_clan: "Clan", nav_settings: "Settings", forging_path: "Forging Path..."
    },
    tr: {
        login_title: "ÇAĞA HÜKMET", login_desc: "Kıyamet geçti. Kılıçlar, oklar ve toplanan teknolojilerle küllerinden yeniden doğ.",
        login_ph: "Savaş Beyi Adı Girin", login_btn: "Çorak Topraklara Gir", supply_banner: "Günlük Ücretsiz Malzemeler Hazır!", claim_btn: "Al",
        bldg_lumber: "Oduncu Kampı", bldg_lumber_desc: "🪵 Odun üretir. Svy 1",
        bldg_stone: "Yağmacı Kulübesi", bldg_stone_desc: "🪨 Taş üretir. Svy 1",
        bldg_food: "Avcı Köşkü", bldg_food_desc: "🍖 Yemek üretir. Svy 1", upgrade_btn: "Yükselt",
        store_title: "Yağmacı Pazarı", store_item1: "🔥 Başlangıç Paketi", store_item1_desc: "+50b kaynak, +500 Sikke",
        clan_title: "Klanlar", clan_desc: "Kaynakları paylaşmak için bir klana katıl.", clan_find: "Klan Bul",
        settings_title: "Ayarlar", language_label: "Dil", language_desc: "Tercih ettiğiniz oyun dilini seçin.",
        nav_camp: "Kamp", nav_store: "Pazar", nav_clan: "Klan", nav_settings: "Ayarlar", forging_path: "Bağlanıyor..."
    },
    es: {
        login_title: "DOMINA LA ERA", login_desc: "El apocalipsis ha pasado. Reconstruye desde las cenizas con espadas, flechas y tecnología recuperada.",
        login_ph: "Ingresa nombre del Señor de la Guerra", login_btn: "Entrar al Yermo", supply_banner: "¡Suministros Diarios Disponibles!", claim_btn: "Reclamar",
        bldg_lumber: "Campamento Maderero", bldg_lumber_desc: "Produce 🪵 Madera. Nivel 1",
        bldg_stone: "Cabaña de Carroñero", bldg_stone_desc: "Produce 🪨 Piedra. Nivel 1",
        bldg_food: "Pabellón de Caza", bldg_food_desc: "Produce 🍖 Comida. Nivel 1", upgrade_btn: "Mejorar",
        store_title: "Mercado del Carroñero", store_item1: "🔥 Paquete de Inicio", store_item1_desc: "+50k recursos, +500 Monedas",
        clan_title: "Clanes", clan_desc: "Únete a un clan para compartir recursos.", clan_find: "Buscar un Clan",
        settings_title: "Ajustes", language_label: "Idioma", language_desc: "Selecciona el idioma del juego.",
        nav_camp: "Campamento", nav_store: "Tienda", nav_clan: "Clan", nav_settings: "Ajustes", forging_path: "Forjando Camino..."
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    
    // Translate text contents
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.innerText = translations[lang][key];
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
}

// UI Elements
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const villageNameLabel = document.getElementById('village-name');
const langSelect = document.getElementById('language-select');

langSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
});

// Resource UI
const resWood = document.getElementById('res-wood');
const resStone = document.getElementById('res-stone');
const resFood = document.getElementById('res-food');
const resCoins = document.getElementById('res-coins');

const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toString();
}

function updateUI(data) {
    resWood.innerText = formatNumber(data.village.wood);
    resStone.innerText = formatNumber(data.village.stone);
    resFood.innerText = formatNumber(data.village.food);
    resCoins.innerText = formatNumber(data.user.ancient_coins);
}

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

loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) return;

    try {
        loginBtn.innerText = translations[currentLang].forging_path;
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        currentUserId = data.id; 
        villageNameLabel.innerText = `${username}'s Encampment`;

        loginScreen.classList.remove('active');
        gameScreen.classList.add('active');

        fetchState();
        gameLoopInterval = setInterval(fetchState, 5000);

    } catch (err) {
        alert("Login failed: " + err.message);
        loginBtn.innerText = translations[currentLang].login_btn;
    }
});

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        if(!targetId) return; 

        navBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(targetId).classList.add('active');
    });
});

// Initialize default language
setLanguage('en');
