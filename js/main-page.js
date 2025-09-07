// js/main-page.js

// Impor modul yang dibutuhkan dari Firebase dan file koneksi kita
import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from "./firestore.js";

const postsContainer = document.getElementById('postsContainer');

const fetchAndDisplayPosts = async (category = 'semua') => {
    try {
        postsContainer.innerHTML = '<h2>Memuat artikel...</h2>';
        let postsQuery = collection(db, "posts");

        if (category !== 'semua') {
            postsQuery = query(postsQuery, where("category", "==", category));
        }

        postsQuery = query(postsQuery, orderBy('publishedAt', 'desc'));

        const querySnapshot = await getDocs(postsQuery);
        if (querySnapshot.empty) {
            postsContainer.innerHTML = '<h2>Belum ada postingan yang tersedia.</h2>';
            return;
        }

        postsContainer.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const postData = doc.data();
            const postId = doc.id;

            const postElement = document.createElement('article');
            postElement.classList.add('article');

            // Hapus atribut onclick dan tambahkan data-post-id
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
        console.error("Error mengambil postingan:", error);
        postsContainer.innerHTML = '<h2>Maaf, terjadi kesalahan saat memuat artikel.</h2>';
    }
};

// Panggil fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayPosts();
});

// Event Delegation: Menambahkan satu listener untuk menangani semua klik pada postingan
postsContainer.addEventListener('click', (e) => {
    const postDiv = e.target.closest('.post');
    if (postDiv) {
        const postId = postDiv.dataset.postId;
        // Panggil fungsi openPost dari script.js dengan URL baru
        window.openPost(`/post-template.html?id=${postId}`);
    }
});

// Fungsi untuk filter yang dipanggil dari index.html
window.filterArticles = (category) => {
    const filterLinks = document.querySelectorAll('.filter-link');
    filterLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === category);
    });
    fetchAndDisplayPosts(category);
};