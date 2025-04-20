// Variabel game
let score = 0;
let scorePerSecond = 0;
let clickPower = 1;
let autoClickers = 0;
let autoClickerCost = 10;
let clickPowerCost = 50;

// Variabel untuk aksesoris
let accessories = {
    hat: false,
    glasses: false,
    watch: false
};

// Elemen DOM
const scoreElement = document.getElementById('score');
const scorePerSecondElement = document.getElementById('score-per-second');
const clickButton = document.getElementById('click-button');
const upgradeAutoClickButton = document.getElementById('upgrade-auto-click');
const upgradeClickPowerButton = document.getElementById('upgrade-click-power');
const autoClickCountElement = document.getElementById('auto-click-count');
const clickPowerElement = document.getElementById('click-power');
const character = document.getElementById('character');
const shopButton = document.getElementById('shop-button');
const shopPopup = document.getElementById('shop-popup');
const closeShop = document.querySelector('.close-shop');
const shopItems = document.querySelectorAll('.shop-item');

// Fungsi untuk menambah score - Dipindahkan ke atas agar dapat dipanggil sebelumnya
function addScore(amount) {
    score += amount;
    updateUI();
}

// Update tombol beli - Dipindahkan ke atas agar dapat dipanggil dari updateUI()
function updateShopButtons() {
    shopItems.forEach(item => {
        const btn = item.querySelector('.buy-btn');
        const itemId = item.dataset.id;
        const cost = parseInt(item.dataset.cost);
        
        btn.disabled = score < cost || accessories[itemId];
        btn.textContent = accessories[itemId] ? 'Terbeli' : `Beli (${cost})`;
    });
}

// Update tampilan
function updateUI() {
    scoreElement.textContent = `Poin: ${Math.floor(score)}`;
    scorePerSecondElement.textContent = `Poin per detik: ${scorePerSecond}`;
    autoClickCountElement.textContent = autoClickers;
    clickPowerElement.textContent = clickPower;
    
    upgradeAutoClickButton.disabled = score < autoClickerCost;
    upgradeAutoClickButton.textContent = `Auto Clicker (${autoClickerCost} poin)`;
    
    upgradeClickPowerButton.disabled = score < clickPowerCost;
    upgradeClickPowerButton.textContent = `Kekuatan Klik (${clickPowerCost} poin)`;
    
    updateShopButtons();
}

// Animasi karakter
function animateCharacter() {
    // Animasi scale (mengedip)
    character.style.transform = 'scale(0.95)';
    character.style.transition = 'transform 0.1s ease';
    
    // Animasi perubahan warna
    character.style.filter = 'brightness(1.2)';
    
    setTimeout(() => {
        character.style.transform = 'scale(1)';
        character.style.filter = 'brightness(1)';
    }, 100);
}

// Fungsi pakai aksesoris
function equipAccessory(itemId) {
    // Buat elemen aksesoris jika belum ada
    if (!document.getElementById(`acc-${itemId}`)) {
        const acc = document.createElement('img');
        acc.id = `acc-${itemId}`;
        acc.src = `${itemId}.png`;
        acc.className = 'accessory';
        document.querySelector('.character-container').appendChild(acc);
    }
}

// Fungsi beli aksesoris
function buyAccessory(itemId, cost) {
    if (score >= cost && !accessories[itemId]) {
        score -= cost;
        accessories[itemId] = true;
        equipAccessory(itemId);
        updateUI();
    }
}

// Tombol klik utama
clickButton.addEventListener('click', () => {
    addScore(clickPower);
    animateCharacter();
});

// Klik langsung pada karakter
character.addEventListener('click', () => {
    addScore(clickPower);
    animateCharacter();
});

// Upgrade auto clicker
upgradeAutoClickButton.addEventListener('click', () => {
    if (score >= autoClickerCost) {
        score -= autoClickerCost;
        autoClickers++;
        scorePerSecond = autoClickers * 0.5; // Setiap auto clicker menghasilkan 0.5 poin per detik
        autoClickerCost = Math.floor(autoClickerCost * 1.5); // Harga naik 50%
        updateUI();
    }
});

// Upgrade kekuatan klik
upgradeClickPowerButton.addEventListener('click', () => {
    if (score >= clickPowerCost) {
        score -= clickPowerCost;
        clickPower++;
        clickPowerCost = Math.floor(clickPowerCost * 2); // Harga naik 100%
        updateUI();
    }
});

// Buka popup toko
shopButton.addEventListener('click', () => {
    shopPopup.style.display = 'flex';
    updateShopButtons(); // Update status tombol beli
});

// Tutup popup toko
closeShop.addEventListener('click', () => {
    shopPopup.style.display = 'none';
});

// Tutup saat klik di luar area konten
shopPopup.addEventListener('click', (e) => {
    if (e.target === shopPopup) {
        shopPopup.style.display = 'none';
    }
});

// Event listener untuk tombol beli
shopItems.forEach(item => {
    item.querySelector('.buy-btn').addEventListener('click', () => {
        buyAccessory(item.dataset.id, parseInt(item.dataset.cost));
    });
});

// Auto clicker logic
setInterval(() => {
    score += scorePerSecond / 10; // Dibagi 10 karena interval 100ms
    updateUI();
}, 100);

// Inisialisasi UI saat halaman dimuat
updateUI();