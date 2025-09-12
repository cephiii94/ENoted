// js/main-page.js

import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from "./firestore.js";

const postsContainer = document.getElementById('postsContainer');

const fetchAndDisplayPosts = async (category = 'semua') => {
    try {
        postsContainer.innerHTML = '<h2>Memuat artikel...</h2>';
        let postsCollection = collection(db, "posts");
        
        // --- [PEMBARUAN UTAMA] ---
        // Buat query dasar yang hanya akan mengambil postingan dengan status "Published".
        // Ini memastikan Draft dan Archived tidak akan pernah muncul di halaman utama.
        let q = query(postsCollection, where("status", "==", "Published"));
        // -------------------------

        // Jika ada filter kategori, tambahkan filter tersebut ke query yang sudah ada
        if (category !== 'semua') {
            q = query(q, where("category", "==", category));
        }

        // Terakhir, tambahkan pengurutan berdasarkan tanggal terbit
        q = query(q, orderBy('publishedAt', 'desc'));

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            postsContainer.innerHTML = '<h2>Belum ada postingan yang tersedia di kategori ini.</h2>';
            return;
        }

        postsContainer.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const postData = doc.data();
            const postId = doc.id;

            const postElement = document.createElement('article');
            postElement.classList.add('article');

            postElement.innerHTML = `
                <div class="post" data-post-id="${postId}">
                    <div class="post-title">${postData.title}</div>
                    <div class="post-meta">
                        <time datetime="${postData.publishedAt.toDate().toISOString()}" class="post-date">
                            ${new Date(postData.publishedAt.toDate()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </time>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });

    } catch (error) {
        console.error("Error fetching posts:", error);
        
        // --- [TAMBAHAN] Penanganan Error untuk Composite Index ---
        if (error.code === 'failed-precondition') {
             postsContainer.innerHTML = `
                <h2 style="color: red;">Terjadi Kesalahan Konfigurasi Database</h2>
                <p style="color: grey;">(Catatan untuk Admin: Query membutuhkan 'Composite Index'. Silakan cek console browser untuk link pembuatan index di Firebase, lalu tunggu beberapa menit hingga index aktif).</p>
             `;
             console.log("Pesan error dari Firebase:", error.message);
        } else {
            postsContainer.innerHTML = '<h2>Maaf, terjadi kesalahan saat memuat artikel.</h2>';
        }
    }
};

// Panggil fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayPosts();
});

// Event Delegation
postsContainer.addEventListener('click', (e) => {
    const postDiv = e.target.closest('.post');
    if (postDiv) {
        const postId = postDiv.dataset.postId;
        // Panggil fungsi global dari script.js jika masih ada, atau handle langsung
        if(window.openPost) {
            window.openPost(`/post-template.html?id=${postId}`);
        }
    }
});

// Fungsi untuk filter
window.filterArticles = (category) => {
    const filterLinks = document.querySelectorAll('.filter-link');
    filterLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === category);
    });
    fetchAndDisplayPosts(category);
};
