// js/admin/dashboard-logic.js

import { collection, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { db, auth } from "../firestore.js";

const postList = document.getElementById('post-list');
const loadingIndicator = document.getElementById('loading');

// Redirect jika pengguna tidak terautentikasi
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/admin/login.html';
    } else {
        fetchAndDisplayPosts();
    }
});

// Fungsi untuk mengambil dan menampilkan postingan
const fetchAndDisplayPosts = async () => {
    try {
        const postsQuery = query(collection(db, "posts"), orderBy("publishedAt", "desc"));
        const querySnapshot = await getDocs(postsQuery);

        loadingIndicator.style.display = 'none';
        postList.innerHTML = ''; // Kosongkan daftar

        if (querySnapshot.empty) {
            postList.innerHTML = '<li>Belum ada postingan yang dibuat.</li>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const postId = doc.id;
            const listItem = document.createElement('li');
            listItem.className = 'post-item';
            listItem.innerHTML = `
                <div class="post-item-info">
                    <h3>${post.title}</h3>
                    <p>Kategori: ${post.category} | Diterbitkan: ${new Date(post.publishedAt.toDate()).toLocaleDateString()}</p>
                </div>
                <div class="post-item-actions">
                    <button class="btn-edit" data-id="${postId}">Edit</button>
                    <button class="btn-delete" data-id="${postId}">Hapus</button>
                </div>
            `;
            postList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error memuat postingan:", error);
        postList.innerHTML = '<li>Gagal memuat daftar postingan.</li>';
    }
};

// Event Listener untuk tombol Edit dan Hapus
postList.addEventListener('click', async (e) => {
    const postId = e.target.dataset.id;
    if (e.target.classList.contains('btn-edit')) {
        // Logika Edit: Arahkan ke halaman create-post dengan parameter ID
        window.location.href = `/admin/create-post.html?id=${postId}`;
    }

    if (e.target.classList.contains('btn-delete')) {
        if (confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
            try {
                await deleteDoc(doc(db, "posts", postId));
                alert("Postingan berhasil dihapus!");
                fetchAndDisplayPosts(); // Muat ulang daftar
            } catch (error) {
                console.error("Error menghapus dokumen: ", error);
                alert("Gagal menghapus postingan.");
            }
        }
    }
});