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
    
    // Setup profile dropdown menu
    setupProfileDropdown();
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

// Setup profile dropdown menu
function setupProfileDropdown() {
    const profileContainers = document.querySelectorAll('.profile-container');
    
    profileContainers.forEach(container => {
        container.addEventListener('click', function(e) {
            // Jika dropdown sudah ada dan terlihat, sembunyikan
            const existingDropdown = document.querySelector('.profile-dropdown');
            if (existingDropdown) {
                existingDropdown.remove();
                return;
            }
            
            // Buat dropdown menu
            const dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';
            
            dropdown.innerHTML = `
                <div class="dropdown-item" id="profileMenuItem">
                    <i class="fas fa-user"></i> Profil Saya
                </div>
                <div class="dropdown-item" id="logoutMenuItem">
                    <i class="fas fa-sign-out-alt"></i> Keluar
                </div>
                <div class="dropdown-item" id="resetMenuItem">
                    <i class="fas fa-trash"></i> Hapus Data
                </div>
            `;
            
            // Tambahkan ke body
            document.body.appendChild(dropdown);
            
            // Posisikan dropdown di bawah profile container
            const rect = container.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
            dropdown.style.left = (rect.left + window.scrollX) + 'px';
            
            // Tambahkan event listeners untuk menu items
            document.getElementById('profileMenuItem').addEventListener('click', function() {
                window.location.href = 'profile.html';
            });
            
            document.getElementById('logoutMenuItem').addEventListener('click', function() {
                if (confirm('Apakah Anda yakin ingin keluar?')) {
                    logoutUser();
                }
            });
            
            document.getElementById('resetMenuItem').addEventListener('click', function() {
                if (confirm('PERHATIAN: Ini akan menghapus semua progres Anda! Lanjutkan?')) {
                    resetUserData();
                    window.location.reload();
                }
            });
            
            // Tutup dropdown jika user klik di luar dropdown
            document.addEventListener('click', function closeDropdown(event) {
                if (!dropdown.contains(event.target) && !container.contains(event.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
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
    // Halaman profile (profile.html)
    else if (filename === 'profile.html') {
        setupProfilePageListeners();
    }
    
    // Setup navigation bar listeners untuk semua halaman
    setupNavBarListeners();
}

// Setup event listeners untuk halaman profile
function setupProfilePageListeners() {
    const backButton = document.getElementById('backToHome');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Update XP display
    const xpCountElement = document.getElementById('xpCount');
    if (xpCountElement) {
        xpCountElement.textContent = userData.xp;
    }
    
    // Render data achievement
    renderAchievements();
}

// Render achievements di halaman profile
function renderAchievements() {
    const achievementsContainer = document.getElementById('achievementsContainer');
    
    if (!achievementsContainer) return;
    
    // Tampilkan achievements yang telah diraih jika ada
    if (userData.achievements && userData.achievements.length > 0) {
        let achievementsHTML = `
            <div class="achievement-category">
                <h3>Penghargaan Khusus</h3>
                <div class="achievement-levels">
        `;
        
        userData.achievements.forEach(achievement => {
            const icon = achievement.icon || 'fas fa-award';
            achievementsHTML += `
                <div class="achievement-badge">
                    <div class="badge-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="badge-info">
                        <p class="badge-title">${achievement.title}</p>
                        <p class="badge-points">${achievement.description}</p>
                    </div>
                </div>
            `;
        });
        
        achievementsHTML += `
                </div>
            </div>
        `;
        
        // Tampilkan progress level setelah penghargaan khusus
        const completedCategories = Object.keys(userData.completedLevels).filter(
            cat => userData.completedLevels[cat].length > 0
        );
        
        if (completedCategories.length > 0) {
            completedCategories.forEach(categoryId => {
                const category = categoryData.find(cat => cat.id === categoryId);
                const completedLevels = userData.completedLevels[categoryId];
                
                if (category && completedLevels.length > 0) {
                    achievementsHTML += `
                        <div class="achievement-category">
                            <h3>${category.title}</h3>
                            <div class="achievement-levels">
                    `;
                    
                    completedLevels.forEach(level => {
                        achievementsHTML += `
                            <div class="achievement-badge">
                                <div class="badge-icon">
                                    <i class="fas fa-star"></i>
                                </div>
                                <div class="badge-info">
                                    <p class="badge-title">Level ${level} Selesai</p>
                                    <p class="badge-points">+${level * 10} Poin</p>
                                </div>
                            </div>
                        `;
                    });
                    
                    achievementsHTML += `
                            </div>
                        </div>
                    `;
                }
            });
        }
        
        achievementsContainer.innerHTML = achievementsHTML;
    } else {
        // Tampilkan level yang diselesaikan jika tidak ada achievement khusus
        const completedCategories = Object.keys(userData.completedLevels).filter(
            cat => userData.completedLevels[cat].length > 0
        );
        
        if (completedCategories.length === 0) {
            achievementsContainer.innerHTML = `
                <div class="no-achievements">
                    <i class="fas fa-trophy"></i>
                    <p>Anda belum memiliki pencapaian. Mulailah bermain quiz untuk mendapatkan pencapaian!</p>
                </div>
            `;
            return;
        }
        
        let achievementsHTML = '';
        
        completedCategories.forEach(categoryId => {
            const category = categoryData.find(cat => cat.id === categoryId);
            const completedLevels = userData.completedLevels[categoryId];
            
            if (category && completedLevels.length > 0) {
                achievementsHTML += `
                    <div class="achievement-category">
                        <h3>${category.title}</h3>
                        <div class="achievement-levels">
                `;
                
                completedLevels.forEach(level => {
                    achievementsHTML += `
                        <div class="achievement-badge">
                            <div class="badge-icon">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="badge-info">
                                <p class="badge-title">Level ${level} Selesai</p>
                                <p class="badge-points">+${level * 10} Poin</p>
                            </div>
                        </div>
                    `;
                });
                
                achievementsHTML += `
                        </div>
                    </div>
                `;
            }
        });
        
        achievementsContainer.innerHTML = achievementsHTML;
    }
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
                    window.location.href = 'profile.html';
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