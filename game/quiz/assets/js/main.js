// Main JavaScript untuk navigasi dan fungsi umum

// Variabel Global
let currentCategory = "";
let currentLevel = 0;

// Event Listener ketika DOM sudah diload
document.addEventListener('DOMContentLoaded', function() {
    // Update UI dengan data user
    updateUserUI();
    
    // Setup event listeners berdasarkan halaman yang sedang dibuka
    setupPageEventListeners();
});

// Update UI dengan data user
function updateUserUI() {
    // Update username dan level jika elemen ada
    const usernameElements = document.querySelectorAll('.username');
    const levelElements = document.querySelectorAll('.level');
    const coinElements = document.querySelectorAll('.coin-count');
    
    usernameElements.forEach(element => {
        element.textContent = userData.username;
    });
    
    levelElements.forEach(element => {
        element.textContent = `Level ${userData.level}`;
    });
    
    coinElements.forEach(element => {
        element.textContent = userData.coins;
    });
}

// Setup event listeners berdasarkan halaman yang sedang dibuka
function setupPageEventListeners() {
    // Cek halaman mana yang sedang dibuka
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop();
    
    // Halaman utama (index.html atau /)
    if (filename === '' || filename === 'index.html') {
        setupHomePageListeners();
    }
    // Halaman play (play.html)
    else if (filename === 'play.html') {
        setupPlayPageListeners();
    }
    // Halaman level (level.html)
    else if (filename === 'level.html') {
        setupLevelPageListeners();
    }
    // Halaman quiz (quiz.html)
    else if (filename === 'quiz.html') {
        // Quiz listeners akan di-setup di quiz.js
    }
    
    // Setup navigation bar listeners untuk semua halaman
    setupNavBarListeners();
}

// Setup event listeners untuk halaman utama
function setupHomePageListeners() {
    const playButton = document.getElementById('playButton');
    
    if (playButton) {
        playButton.addEventListener('click', function() {
            window.location.href = 'play.html';
        });
    }
}

// Setup event listeners untuk halaman play (kategori)
function setupPlayPageListeners() {
    const backButton = document.getElementById('backToHome');
    const categoriesContainer = document.getElementById('categoriesContainer');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    if (categoriesContainer) {
        // Render kategori
        renderCategories(categoriesContainer);
    }
}

// Setup event listeners untuk halaman level
function setupLevelPageListeners() {
    const backButton = document.getElementById('backToCategories');
    const levelsContainer = document.getElementById('levelsContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    
    // Ambil kategori dari URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'play.html';
        });
    }
    
    if (levelsContainer && currentCategory) {
        // Set judul kategori
        if (categoryTitle) {
            const category = categoryData.find(cat => cat.id === currentCategory);
            if (category) {
                categoryTitle.textContent = category.title;
            }
        }
        
        // Render level
        const levels = getLevelsForCategory(currentCategory);
        renderLevels(levelsContainer, levels);
    }
}

// Setup event listeners untuk navbar
function setupNavBarListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.querySelector('span').textContent.toLowerCase();
            
            // Hapus kelas active dari semua item
            navItems.forEach(i => i.classList.remove('active'));
            
            // Tambah kelas active ke item yang diklik
            this.classList.add('active');
            
            // Navigasi berdasarkan teks
            switch (text) {
                case 'home':
                    window.location.href = 'index.html';
                    break;
                case 'inventory':
                    // TODO: Implementasi halaman inventory
                    alert('Fitur Inventory akan segera hadir!');
                    break;
                case 'shop':
                    // TODO: Implementasi halaman shop
                    alert('Fitur Shop akan segera hadir!');
                    break;
                case 'achievement':
                    // TODO: Implementasi halaman achievement
                    alert('Fitur Achievement akan segera hadir!');
                    break;
            }
        });
    });
}

// Render kategori ke dalam container
function renderCategories(container) {
    container.innerHTML = '';
    
    categoryData.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.dataset.categoryId = category.id;
        
        categoryCard.innerHTML = `
            <img src="${category.image}" alt="${category.title}" class="category-image">
            <div class="category-info">
                <h3 class="category-title">${category.title}</h3>
                <p class="category-description">${category.description}</p>
            </div>
        `;
        
        categoryCard.addEventListener('click', function() {
            const categoryId = this.dataset.categoryId;
            window.location.href = `level.html?category=${categoryId}`;
        });
        
        container.appendChild(categoryCard);
    });
}

// Render level ke dalam container
function renderLevels(container, levels) {
    container.innerHTML = '';
    
    levels.forEach(level => {
        const levelCard = document.createElement('div');
        levelCard.className = `level-card ${level.status}`;
        levelCard.dataset.level = level.level;
        
        levelCard.innerHTML = `
            <div class="level-number">${level.level}</div>
            <div class="level-status">${level.status === 'completed' ? 'Selesai' : (level.status === 'unlocked' ? 'Buka' : 'Terkunci')}</div>
        `;
        
        if (level.status !== 'locked') {
            levelCard.addEventListener('click', function() {
                const levelNumber = parseInt(this.dataset.level);
                startQuiz(currentCategory, levelNumber);
            });
        }
        
        container.appendChild(levelCard);
    });
}

// Mulai quiz dengan kategori dan level tertentu
function startQuiz(categoryId, level) {
    // Simpan kategori dan level yang dipilih ke sessionStorage
    sessionStorage.setItem('quizCategory', categoryId);
    sessionStorage.setItem('quizLevel', level);
    
    // Navigasi ke halaman quiz
    window.location.href = 'quiz.html';
}