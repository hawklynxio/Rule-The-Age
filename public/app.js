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
    },
    fr: {
        login_title: "DOMINEZ L'ÂGE", login_desc: "L'apocalypse est passée. Reconstruisez à partir des cendres avec des épées, des flèches et de la technologie récupérée.",
        login_ph: "Entrez le nom du chef de guerre", login_btn: "Entrer dans les Terres Désolées", supply_banner: "Fournitures gratuites quotidiennes disponibles!", claim_btn: "Réclamer",
        bldg_lumber: "Camp de Bûcherons", bldg_lumber_desc: "Produit 🪵 Bois. Niv 1",
        bldg_stone: "Cabane de Charognard", bldg_stone_desc: "Produit 🪨 Pierre. Niv 1",
        bldg_food: "Pavillon de Chasse", bldg_food_desc: "Produit 🍖 Nourriture. Niv 1", upgrade_btn: "Améliorer",
        store_title: "Marché du Charognard", store_item1: "🔥 Pack de Démarrage", store_item1_desc: "+50k ressources, +500 Pièces",
        clan_title: "Clans", clan_desc: "Rejoignez un clan pour partager des ressources.", clan_find: "Trouver un Clan",
        settings_title: "Paramètres", language_label: "Langue", language_desc: "Sélectionnez la langue du jeu.",
        nav_camp: "Camp", nav_store: "Boutique", nav_clan: "Clan", nav_settings: "Paramètres", forging_path: "Forgeage du Chemin..."
    },
    de: {
        login_title: "BEHERRSCHE DIE EPOCHE", login_desc: "Die Apokalypse ist vorbei. Baue aus der Asche mit Schwertern, Pfeilen und gefundener Technologie wieder auf.",
        login_ph: "Kriegsherr Name eingeben", login_btn: "Betrete das Ödland", supply_banner: "Tägliche kostenlose Vorräte verfügbar!", claim_btn: "Beanspruchen",
        bldg_lumber: "Holzfällerlager", bldg_lumber_desc: "Produziert 🪵 Holz. Stufe 1",
        bldg_stone: "Plündererhütte", bldg_stone_desc: "Produziert 🪨 Stein. Stufe 1",
        bldg_food: "Jagdhütte", bldg_food_desc: "Produziert 🍖 Nahrung. Stufe 1", upgrade_btn: "Verbessern",
        store_title: "Plünderermarkt", store_item1: "🔥 Anfängerpaket", store_item1_desc: "+50k Ressourcen, +500 Münzen",
        clan_title: "Clans", clan_desc: "Tritt einem Clan bei, um Ressourcen zu teilen.", clan_find: "Einen Clan finden",
        settings_title: "Einstellungen", language_label: "Sprache", language_desc: "Wähle deine bevorzugte Spielsprache.",
        nav_camp: "Lager", nav_store: "Laden", nav_clan: "Clan", nav_settings: "Einstellungen", forging_path: "Weg schmieden..."
    },
    it: {
        login_title: "DOMINA L'ERA", login_desc: "L'apocalisse è passata. Ricostruisci dalle ceneri con spade, frecce e tecnologia recuperata.",
        login_ph: "Inserisci il nome del Signore della Guerra", login_btn: "Entra nella Terra Desolata", supply_banner: "Forniture gratuite giornaliere disponibili!", claim_btn: "Richiedi",
        bldg_lumber: "Campo di Taglialegna", bldg_lumber_desc: "Produce 🪵 Legno. Liv 1",
        bldg_stone: "Capanna dello Sciacallo", bldg_stone_desc: "Produce 🪨 Pietra. Liv 1",
        bldg_food: "Capanno da Caccia", bldg_food_desc: "Produce 🍖 Cibo. Liv 1", upgrade_btn: "Migliora",
        store_title: "Mercato dello Sciacallo", store_item1: "🔥 Pacchetto Iniziale", store_item1_desc: "+50k risorse, +500 Monete",
        clan_title: "Clan", clan_desc: "Unisciti a un clan per condividere risorse.", clan_find: "Trova un Clan",
        settings_title: "Impostazioni", language_label: "Lingua", language_desc: "Seleziona la lingua di gioco preferita.",
        nav_camp: "Campo", nav_store: "Negozio", nav_clan: "Clan", nav_settings: "Impostazioni", forging_path: "Forgiando il Percorso..."
    },
    pt: {
        login_title: "DOMINE A ERA", login_desc: "O apocalipse passou. Reconstrua das cinzas com espadas, flechas e tecnologia recuperada.",
        login_ph: "Insira o nome do Senhor da Guerra", login_btn: "Entre no Ermo", supply_banner: "Suprimentos diários gratuitos disponíveis!", claim_btn: "Resgatar",
        bldg_lumber: "Acampamento Madeireiro", bldg_lumber_desc: "Produz 🪵 Madeira. Nív 1",
        bldg_stone: "Cabana do Necrófago", bldg_stone_desc: "Produz 🪨 Pedra. Nív 1",
        bldg_food: "Pavilhão de Caça", bldg_food_desc: "Produz 🍖 Comida. Nív 1", upgrade_btn: "Melhorar",
        store_title: "Mercado do Necrófago", store_item1: "🔥 Pacote Inicial", store_item1_desc: "+50k recursos, +500 Moedas",
        clan_title: "Clãs", clan_desc: "Junte-se a um clã para compartilhar recursos.", clan_find: "Encontrar um Clã",
        settings_title: "Configurações", language_label: "Idioma", language_desc: "Selecione o idioma preferido do jogo.",
        nav_camp: "Campo", nav_store: "Loja", nav_clan: "Clã", nav_settings: "Configurações", forging_path: "Forjando Caminho..."
    },
    ru: {
        login_title: "ПРАВЬ ЭПОХОЙ", login_desc: "Апокалипсис миновал. Восстаньте из пепла с мечами, стрелами и найденными технологиями.",
        login_ph: "Введите имя военачальника", login_btn: "Войти в Пустошь", supply_banner: "Доступны ежедневные бесплатные припасы!", claim_btn: "Забрать",
        bldg_lumber: "Лесозаготовительный лагерь", bldg_lumber_desc: "Производит 🪵 Дерево. Ур. 1",
        bldg_stone: "Хижина Мусорщика", bldg_stone_desc: "Производит 🪨 Камень. Ур. 1",
        bldg_food: "Охотничий домик", bldg_food_desc: "Производит 🍖 Еду. Ур. 1", upgrade_btn: "Улучшить",
        store_title: "Рынок Мусорщика", store_item1: "🔥 Стартовый Набор", store_item1_desc: "+50к ресурсов, +500 Монет",
        clan_title: "Кланы", clan_desc: "Вступите в клан, чтобы делиться ресурсами.", clan_find: "Найти клан",
        settings_title: "Настройки", language_label: "Язык", language_desc: "Выберите предпочитаемый язык игры.",
        nav_camp: "Лагерь", nav_store: "Магазин", nav_clan: "Клан", nav_settings: "Настройки", forging_path: "Ковка Пути..."
    },
    zh: {
        login_title: "统治时代", login_desc: "末日已过。用剑、箭和拾荒得来的科技从灰烬中重建。",
        login_ph: "输入军阀名称", login_btn: "进入废土", supply_banner: "每日免费物资可用！", claim_btn: "领取",
        bldg_lumber: "伐木营地", bldg_lumber_desc: "生产 🪵 木材。1级",
        bldg_stone: "拾荒者小屋", bldg_stone_desc: "生产 🪨 石头。1级",
        bldg_food: "狩猎小屋", bldg_food_desc: "生产 🍖 食物。1级", upgrade_btn: "升级",
        store_title: "拾荒者市场", store_item1: "🔥 军阀新手包", store_item1_desc: "+5万资源，+500硬币",
        clan_title: "氏族", clan_desc: "加入氏族以分享资源。", clan_find: "寻找氏族",
        settings_title: "设置", language_label: "语言", language_desc: "选择您偏好的游戏语言。",
        nav_camp: "营地", nav_store: "商店", nav_clan: "氏族", nav_settings: "设置", forging_path: "正在进入..."
    },
    ja: {
        login_title: "時代を支配せよ", login_desc: "終末は過ぎ去った。剣と弓、そして拾い集めた技術で灰の中から再建せよ。",
        login_ph: "将軍の名前を入力", login_btn: "荒野へ入る", supply_banner: "毎日の無料物資が利用可能です！", claim_btn: "受け取る",
        bldg_lumber: "伐採キャンプ", bldg_lumber_desc: "🪵 木材を生産します。レベル 1",
        bldg_stone: "スカベンジャーの小屋", bldg_stone_desc: "🪨 石を生産します。レベル 1",
        bldg_food: "狩猟小屋", bldg_food_desc: "🍖 食料を生産します。レベル 1", upgrade_btn: "アップグレード",
        store_title: "スカベンジャー市場", store_item1: "🔥 スターターパック", store_item1_desc: "+5万資源, +500コイン",
        clan_title: "クラン", clan_desc: "クランに参加して資源を共有しましょう。", clan_find: "クランを探す",
        settings_title: "設定", language_label: "言語", language_desc: "希望のゲーム言語を選択してください。",
        nav_camp: "キャンプ", nav_store: "ストア", nav_clan: "クラン", nav_settings: "設定", forging_path: "接続中..."
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
const langSelects = document.querySelectorAll('.language-select');

langSelects.forEach(select => {
    select.addEventListener('change', (e) => {
        const newLang = e.target.value;
        // Keep all dropdowns in sync
        langSelects.forEach(s => s.value = newLang);
        setLanguage(newLang);
    });
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
