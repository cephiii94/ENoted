// JavaScript untuk halaman login

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Cek apakah user sudah login sebelumnya
    // PERUBAHAN PENTING: Tambahkan pengecekan lebih detail 
    // untuk mencegah redirect loops
    if (localStorage.getItem('quizUserData')) {
        try {
            const savedData = JSON.parse(localStorage.getItem('quizUserData'));
            // Hanya redirect jika data username benar-benar ada dan tidak kosong
            if (savedData && savedData.username && savedData.username.trim() !== '') {
                // Pastikan kita berada di halaman login sebelum redirect
                if (window.location.pathname.includes('login.html')) {
                    window.location.href = 'index.html';
                }
                return;
            }
        } catch (e) {
            // Jika ada error saat parsing JSON, hapus data yang rusak
            localStorage.removeItem('quizUserData');
            console.error("Error parsing user data:", e);
        }
    }
    
    // Event listener untuk form login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const username = usernameInput.value.trim();
            
            if (username) {
                // Inisialisasi data user baru
                const newUserData = {
                    username: username,
                    level: 1,
                    coins: 100,
                    xp: 0,
                    achievements: [],
                    completedLevels: {
                        "science": [],
                        "history": [],
                        "geography": [],
                        "entertainment": []
                    }
                };
                
                // Simpan data user ke localStorage
                localStorage.setItem('quizUserData', JSON.stringify(newUserData));
                
                // Redirect ke halaman utama
                window.location.href = 'index.html';
            }
        });
    }
});