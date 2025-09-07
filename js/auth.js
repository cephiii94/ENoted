// js/auth.js

// Impor modul yang dibutuhkan dari Firebase
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { db } from "./firestore.js"; // Koneksi ke database, sudah dibuat

const auth = getAuth();
const loginForm = document.getElementById('loginForm');
const responseMessage = document.getElementById('responseMessage');

// Gunakan email dan password Anda yang sudah tersimpan
const adminEmail = 'cecephard12@gmail.com';
const adminPassword = 'password_yang_aman_anda_buat'; // Ganti dengan password yang aman

// Fungsi untuk menangani login
const handleLogin = async (e) => {
    e.preventDefault();

    const email = loginForm['email'].value;
    const password = loginForm['password'].value;
    
    responseMessage.style.display = 'block';
    responseMessage.className = 'response-message';
    responseMessage.innerText = 'Memproses...';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Jika login berhasil, alihkan ke halaman buat postingan
        responseMessage.className = 'response-message success';
        responseMessage.innerText = 'Login berhasil! Mengalihkan...';
        console.log("Login berhasil! UID:", user.uid);

        // Simpan UID admin di local storage atau sesi
        localStorage.setItem('adminUID', user.uid);

        window.location.href = '/admin/create-post.html';

    } catch (error) {
        responseMessage.className = 'response-message error';
        responseMessage.innerText = 'Login gagal. Email atau password salah.';
        console.error("Error login: ", error.code, error.message);
    }
};

// Tambahkan event listener untuk form login
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Catatan: Ini adalah fungsi SEKALI-PAKAI untuk membuat akun admin pertama.
// Setelah akun dibuat, hapus kode ini dari file js/auth.js.
// Buka halaman login di browser untuk menjalankan fungsi ini.

//const createAdminAccount = async () => {
//    try {
  //      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    //    console.log("Akun admin berhasil dibuat. UID:", userCredential.user.uid);
        // Penting: Salin UID ini dan masukkan ke aturan Firestore Anda!
        // UID Anda akan terlihat seperti: "4lP8bJ1...Gk9"
    //} catch (error) {
      //  console.error("Error saat membuat akun admin:", error.code, error.message);
  //  }
//};

// Jalankan fungsi pembuatan akun jika tidak ada pengguna yang login.
// HAPUS ATAU KOMENTARI BARIS INI SETELAH AKUN DIBUAT
// createAdminAccount();