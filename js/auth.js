// js/auth.js

// Impor fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// TODO: Ganti dengan konfigurasi Firebase proyek Anda
const firebaseConfig = {
  apiKey: "AIzaSyCb21XVRokKfyEXfPMtrrNAg5FF1mgAIYI",
  authDomain: "enoted-07092025.firebaseapp.com",
  projectId: "enoted-07092025",
  storageBucket: "enoted-07092025.firebasestorage.app",
  messagingSenderId: "221737324344",
  appId: "1:221737324344:web:88e1626a7c6b85cfb37bcd",
  measurementId: "G-K65TBCM8G5"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Ambil elemen-elemen dari DOM yang berhubungan dengan ikon melayang dan modal
const userFab = document.getElementById('userFab');
const loginModal = document.getElementById('loginModal');
const userProfileModal = document.getElementById('userProfileModal');
const modalOverlay = document.getElementById('modalOverlay');

const closeLoginModalBtn = document.getElementById('closeLoginModal');
const closeProfileModalBtn = document.getElementById('closeProfileModal');
const loginForm = document.getElementById('loginForm'); // Form di dalam modal
const logoutButton = document.getElementById('logoutButton');
const userInfo = document.getElementById('userInfo');
const loginError = document.getElementById('loginError');

// --- LOGIKA UTAMA UNTUK IKON MELAYANG ---

// Fungsi untuk menampilkan modal tertentu
function showModal(modal) {
    modalOverlay.style.display = 'block';
    modal.style.display = 'block';
}

// Fungsi untuk menyembunyikan semua modal
function hideModals() {
    modalOverlay.style.display = 'none';
    if (loginModal) loginModal.style.display = 'none';
    if (userProfileModal) userProfileModal.style.display = 'none';
}

// 👂 Pantau perubahan status otentikasi secara real-time
onAuthStateChanged(auth, (user) => {
    // Pastikan elemen userFab ada di halaman ini
    if (!userFab) return; 

    if (user) {
        // ✅ Pengguna sudah login
        console.log("Pengguna terdeteksi:", user.email);
        userInfo.textContent = `Selamat datang, ${user.email}`;
        
        // Atur agar klik pada ikon akan menampilkan profil pengguna
        userFab.onclick = () => showModal(userProfileModal);

    } else {
        // ❌ Pengguna belum login atau sudah logout
        console.log("Tidak ada pengguna yang login.");
        
        // Atur agar klik pada ikon akan menampilkan form login
        userFab.onclick = () => showModal(loginModal);
    }
});

// 🚀 Event listener untuk form login di dalam modal
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if(loginError) loginError.textContent = ''; // Bersihkan pesan error

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Berhasil login
                console.log("Login dari modal berhasil:", userCredential.user);
                hideModals(); // Cukup tutup modal, tidak perlu redirect
                loginForm.reset();
            })
            .catch((error) => {
                // Gagal login
                console.error("Error login dari modal:", error.message);
                if(loginError) loginError.textContent = "Email atau password salah.";
            });
    });
}

// 🚪 Event listener untuk tombol logout
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log("Logout berhasil.");
            hideModals();
        }).catch((error) => {
            console.error("Error saat logout:", error);
        });
    });
}


// ❌ Event listener untuk menutup modal
if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', hideModals);
if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', hideModals);
if (modalOverlay) modalOverlay.addEventListener('click', hideModals);