// Variabel game
let score = 0;
let scorePerSecond = 0;
let clickPower = 1;
let autoClickers = 0;
let autoClickerCost = 10;
let clickPowerCost = 50;

// Variabel untuk aksesoris
let accessories = {
    hat: { owned: false, equipped: false },
    glasses: { owned: false, equipped: false },
    watch: { owned: false, equipped: false }
};

// Audio untuk efek suara/ file suara
// Pastikan untuk mengganti path dengan path yang sesuai di server Anda
const clickSound = new Audio('/game/clicker/sound/click.wav'); // Ganti dengan path file suara Anda
const upgradeSound = new Audio('/game/clicker/sound/upgrade.wav'); // Suara untuk upgrade
const buySound = new Audio('/game/clicker/sound/buy.wav'); // Suara untuk pembelian item
const shopOpenSound = new Audio('/game/clicker/sound/open.wav');
const inventoryOpenSound = new Audio('/game/clicker/sound/open.wav'); // Suara untuk buka inventory
const closeSound = new Audio('/game/clicker/sound/close.wav');
const equipSound = new Audio('/game/clicker/sound/equip.wav'); //belum ada
const unequipSound = new Audio('/game/clicker/sound/unequip.wav'); //belum ada

// Fungsi untuk memainkan suara klik
function playClickSound() {
    if (soundEnabled) { // Tambahkan pengecekan soundEnabled
        // Clone audio agar bisa diputar berulang tanpa menunggu selesai
        const clickSoundClone = clickSound.cloneNode();
        clickSoundClone.volume = 0.5; // Sesuaikan volume (0.0 - 1.0)
        clickSoundClone.play();
    }
}

// Fungsi untuk memainkan suara upgrade
function playUpgradeSound() {
    if (soundEnabled) { // Tambahkan pengecekan soundEnabled
        upgradeSound.currentTime = 0; // Reset ke awal
        upgradeSound.play();
    }
}

// Fungsi untuk memainkan suara pembelian
function playBuySound() {
    if (soundEnabled) { // Tambahkan pengecekan soundEnabled
        buySound.currentTime = 0; // Reset ke awal
        buySound.play();
    }
}
function playShopOpenSound() {
    if (soundEnabled) {
        shopOpenSound.currentTime = 0; // Reset ke awal
        shopOpenSound.play();
    }
}
function playShopCloseSound() {
    if (soundEnabled) {
        closeSound.currentTime = 0; // Reset ke awal
        closeSound.play();
    }
}

// Fungsi untuk memainkan suara equip/unequip
function playEquipSound() {
    if (soundEnabled) {
        equipSound.currentTime = 0;
        equipSound.play();
    }
}
function playUnequipSound() {
    if (soundEnabled) {
        unequipSound.currentTime = 0;
        unequipSound.play();
    }
}
// Fungsi untuk memainkan suara buka/tutup inventory
function playInventoryOpenSound() {
    if (soundEnabled) {
        closeSound.currentTime = 0; // Reset ke awal
        closeSound.play();
    }
}
function playCloseInventorySound() {
    if (soundEnabled) {
        closeSound.currentTime = 0; // Reset ke awal
        closeSound.play();
    }
}

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
const inventoryButton = document.getElementById('inventory-button');
const inventoryPopup = document.getElementById('inventory-popup');
const closeInventory = document.querySelector('.close-inventory');
const inventoryItemsContainer = document.querySelector('.inventory-items');

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
        
        btn.disabled = score < cost || accessories[itemId].owned;
        btn.textContent = accessories[itemId].owned ? 'Terbeli' : `Beli (${cost})`;
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

// Fungsi untuk toggle aksesoris (pakai/lepas)
function toggleAccessory(itemId) {
    if (accessories[itemId].owned) {
        accessories[itemId].equipped = !accessories[itemId].equipped;
        
        if (accessories[itemId].equipped) {
            equipAccessory(itemId);
            playEquipSound();
        } else {
            removeAccessory(itemId);
            playUnequipSound();
        }
        
        updateInventory();
    }
}

// Fungsi untuk memperbarui tampilan inventory
function updateInventory() {
    inventoryItemsContainer.innerHTML = '';
    
    // Daftar semua aksesoris yang ada
    const accessoryItems = [
        { id: 'hat', name: 'Topi', cost: 100 },
        { id: 'glasses', name: 'Kacamata', cost: 200 },
        { id: 'watch', name: 'Jam Tangan', cost: 500 }
    ];
    
    accessoryItems.forEach(item => {
        const div = document.createElement('div');
        div.className = `inventory-item ${!accessories[item.id].owned ? 'not-owned' : ''}`;
        
        const img = document.createElement('img');
        img.src = `${item.id}.png`;
        img.alt = item.name;
        
        const p = document.createElement('p');
        p.textContent = item.name;
        
        const button = document.createElement('button');
        button.className = `toggle-btn ${accessories[item.id].equipped ? 'equipped' : ''}`;
        button.textContent = accessories[item.id].equipped ? 'Lepaskan' : 'Pakai';
        
        if (accessories[item.id].owned) {
            button.addEventListener('click', () => toggleAccessory(item.id));
        }
        
        div.appendChild(img);
        div.appendChild(p);
        if (accessories[item.id].owned) {
            div.appendChild(button);
        } else {
            const notOwned = document.createElement('p');
            notOwned.textContent = 'Belum Dimiliki';
            notOwned.style.color = '#999';
            div.appendChild(notOwned);
        }
        
        inventoryItemsContainer.appendChild(div);
    });
}

// Fungsi untuk melepas aksesoris
function removeAccessory(itemId) {
    const accessoryElement = document.getElementById(`acc-${itemId}`);
    if (accessoryElement) {
        accessoryElement.remove();
    }
}

// Fungsi beli aksesoris
function buyAccessory(itemId, cost) {
    if (score >= cost && !accessories[itemId].owned) {
        score -= cost;
        accessories[itemId].owned = true;
        // Tidak otomatis equip saat beli
        playBuySound();
        updateUI();
        updateInventory();
    }
}

// Event listeners untuk inventory
inventoryButton.addEventListener('click', () => {
    inventoryPopup.style.display = 'flex';
    updateInventory();
    playInventoryOpenSound(); // Mainkan suara buka inventory
    // Bisa tambahkan suara jika mau
});

closeInventory.addEventListener('click', () => {
    inventoryPopup.style.display = 'none';
    playCloseInventorySound(); // Mainkan suara tutup inventory
    
});

inventoryPopup.addEventListener('click', (e) => {
    if (e.target === inventoryPopup) {
        inventoryPopup.style.display = 'none';
        playCloseInventorySound(); // Mainkan suara tutup inventory
    }
});


// Tombol klik utama
clickButton.addEventListener('click', () => {
    addScore(clickPower);
    animateCharacter();
    playClickSound(); // Mainkan suara klik
});

// Klik langsung pada karakter
character.addEventListener('click', () => {
    addScore(clickPower);
    animateCharacter();
    playClickSound(); // Mainkan suara klik
});

// Upgrade auto clicker
upgradeAutoClickButton.addEventListener('click', () => {
    if (score >= autoClickerCost) {
        score -= autoClickerCost;
        autoClickers++;
        scorePerSecond = autoClickers * 0.5; // Setiap auto clicker menghasilkan 0.5 poin per detik
        autoClickerCost = Math.floor(autoClickerCost * 1.5); // Harga naik 50%
        playUpgradeSound(); // Mainkan suara upgrade
        updateUI();
    }
});

// Upgrade kekuatan klik
upgradeClickPowerButton.addEventListener('click', () => {
    if (score >= clickPowerCost) {
        score -= clickPowerCost;
        clickPower++;
        clickPowerCost = Math.floor(clickPowerCost * 2); // Harga naik 100%
        playUpgradeSound(); // Mainkan suara upgrade
        updateUI();
    }
});

// EVENT LISTENER

// Buka popup toko
shopButton.addEventListener('click', () => {
    shopPopup.style.display = 'flex';
    updateShopButtons(); // Update status tombol beli
    playShopOpenSound(); // Mainkan suara buka toko
});

// Tutup popup toko (tombol ×)
closeShop.addEventListener('click', () => {
    shopPopup.style.display = 'none';
    playShopCloseSound(); // Mainkan suara tutup toko
});

// Tutup saat klik di luar area konten
shopPopup.addEventListener('click', (e) => {
    if (e.target === shopPopup) {
        shopPopup.style.display = 'none';
        playShopCloseSound(); // Mainkan suara tutup toko
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
// Inisialisasi inventory saat halaman dimuat
updateInventory();

// Preload audio untuk menghindari delay saat pertama kali diputar
function preloadAudio() {
    clickSound.load();
    upgradeSound.load();
    buySound.load();
    shopOpenSound.load();
    closeSound.load();
    inventoryOpenSound.load();
    equipSound.load();
    unequipSound.load();
}

// Panggil preload saat halaman dimuat
window.addEventListener('load', preloadAudio);

// Variabel untuk kontrol suara 
let soundEnabled = true;

// Mengambil elemen tombol suara yang sudah ada di HTML
const soundToggleButton = document.getElementById('sound-toggle');

// Event listener untuk toggle suara
soundToggleButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    
    // Ubah metode play untuk semua suara
    if (soundEnabled) {
        soundToggleButton.textContent = '🔊 Suara: Aktif';
        clickSound.muted = false;
        upgradeSound.muted = false;
        buySound.muted = false;
        shopOpenSound.muted = false;
        closeSound.muted = false;
        equipSound.muted = false;
        unequipSound.muted = false;
        inventoryOpenSound.muted = false;
    } 
    else {
        soundToggleButton.textContent = '🔇 Suara: Mati';
        clickSound.muted = true;
        upgradeSound.muted = true;
        buySound.muted = true;
        shopOpenSound.muted = true;
        closeSound.muted = true;
        equipSound.muted = true;
        unequipSound.muted = true;
        inventoryOpenSound.muted = true;

    }
});