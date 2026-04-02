// js/firestore.js

// Impor modul yang dibutuhkan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"; // BARIS INI HARUS ADA

// Ganti dengan konfigurasi proyek Firebase Anda
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

// Ekspor objek Firestore dan Auth
export const db = getFirestore(app);
export const auth = getAuth(app);