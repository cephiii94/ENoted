// js/auth.js

// Impor 'auth' dari file konfigurasi terpusat untuk konsistensi
import { auth } from './firestore.js';

// Impor fungsi yang diperlukan dari Firebase SDK
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- AMBIL SEMUA ELEMEN YANG MUNGKIN ADA DI HALAMAN ---

    // Elemen untuk metode Sidebar (digunakan di halaman chat)
    const loginSection = document.getElementById('loginSection');
    const profileSection = document.getElementById('profileSection');
    
    // Elemen untuk metode FAB/Modal (digunakan di halaman lain)
    const userFab = document.getElementById('userFab');
    const loginModal = document.getElementById('loginModal');
    const userProfileModal = document.getElementById('userProfileModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeLoginModalBtn = document.getElementById('closeLoginModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModal');
    
    // Elemen bersama yang digunakan di kedua metode
    // PENTING: Jika Anda menggunakan kedua metode di halaman yang sama,
    // pastikan ID untuk elemen-elemen ini unik (cth: 'sidebarLoginForm', 'modalLoginForm')
    const loginForm = document.getElementById('loginForm');
    const logoutButton = document.getElementById('logoutButton');
    const userInfo = document.getElementById('userInfo');
    const loginError = document.getElementById('loginError');

    // --- FUNGSI BANTU UNTUK MODAL ---
    const showModal = (modal) => {
        if (modalOverlay) modalOverlay.style.display = 'block';
        if (modal) modal.style.display = 'block';
    };

    const hideModals = () => {
        if (modalOverlay) modalOverlay.style.display = 'none';
        if (loginModal) loginModal.style.display = 'none';
        if (userProfileModal) userProfileModal.style.display = 'none';
    };

    // --- LOGIKA UTAMA: PANTAU STATUS LOGIN DAN PERBARUI UI YANG SESUAI ---
    onAuthStateChanged(auth, (user) => {
        if (user) { 
            // --- KONDISI KETIKA PENGGUNA LOGIN ---

            // 1. Perbarui UI Sidebar (jika elemennya ada di halaman ini)
            if (profileSection && loginSection) {
                if (userInfo) userInfo.textContent = user.email;
                profileSection.style.display = 'block';
                loginSection.style.display = 'none';
            }

            // 2. Perbarui UI FAB/Modal (jika elemennya ada di halaman ini)
            if (userFab && userProfileModal) {
                const modalUserInfo = userProfileModal.querySelector('#userInfo');
                if (modalUserInfo) modalUserInfo.textContent = `Selamat datang, ${user.email}`;
                userFab.onclick = () => showModal(userProfileModal);
            }

        } else { 
            // --- KONDISI KETIKA PENGGUNA LOGOUT ---

            // 1. Perbarui UI Sidebar (jika elemennya ada di halaman ini)
            if (profileSection && loginSection) {
                profileSection.style.display = 'none';
                loginSection.style.display = 'block';
            }
            
            // 2. Perbarui UI FAB/Modal (jika elemennya ada di halaman ini)
            if (userFab && loginModal) {
                userFab.onclick = () => showModal(loginModal);
            }
        }
    });

    // --- EVENT LISTENERS ---

    // Listener untuk form login (akan berfungsi di sidebar atau modal)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            if (loginError) loginError.textContent = '';

            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    hideModals(); // Aman untuk dipanggil, akan menutup modal jika terbuka
                })
                .catch(() => {
                    if (loginError) loginError.textContent = "Email atau password salah.";
                });
        });
    }

    // Listener untuk tombol logout (akan berfungsi di sidebar atau modal)
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                hideModals(); // Aman untuk dipanggil
            }).catch(console.error);
        });
    }

    // Listener khusus untuk menutup modal
    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', hideModals);
    if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', hideModals);
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModals();
    });
});

