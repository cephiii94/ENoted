// js/admin/dashboard-logic.js

// VERSI DIKEMBALIKAN ke 9.23.0 agar cocok dengan firestore.js
import { collection, onSnapshot, deleteDoc, doc, query } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { db, auth } from "../firestore.js";

// Pengambilan elemen DOM
const postListContainer = document.getElementById('post-list');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const loadingIndicator = document.getElementById('loading');
const noResultsMessage = document.getElementById('no-results');
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');

// Variabel state aplikasi
let allPosts = [];
let postToDeleteId = null;

// Fungsi untuk merender (menampilkan) postingan ke halaman
const renderPosts = (posts) => {
    postListContainer.innerHTML = ''; // Kosongkan daftar sebelum merender
    
    if (posts.length === 0) {
        noResultsMessage.classList.remove('hidden');
    } else {
        noResultsMessage.classList.add('hidden');
    }
    
    posts.forEach(post => {
        // Menggunakan publishedAt sesuai skrip asli Anda
        const postDate = post.publishedAt && post.publishedAt.toDate ? post.publishedAt.toDate() : new Date();
        const formattedDate = postDate.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const status = post.status || 'Draft';
        const statusBadgeColor = status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

        const postCard = document.createElement('div');
        postCard.className = "bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all";
        postCard.innerHTML = `
            <div class="p-5">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-lg text-gray-800 mb-2">${post.title || 'Tanpa Judul'}</h3>
                    <span class="text-xs font-semibold px-2 py-1 rounded-full ${statusBadgeColor}">${status}</span>
                </div>
                <p class="text-sm text-gray-500 mb-4">Kategori: ${post.category || '-'} | Diterbitkan: ${formattedDate}</p>
                <div class="flex justify-end gap-3 mt-4 border-t pt-4">
                    <button data-id="${post.id}" class="edit-btn flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-800 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit
                    </button>
                    <button data-id="${post.id}" class="delete-btn flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Hapus
                    </button>
                </div>
            </div>
        `;
        postListContainer.appendChild(postCard);
    });
};

// Fungsi untuk memfilter dan mengurutkan postingan
const filterAndSortPosts = () => {
    let filteredPosts = [...allPosts];
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => 
            (post.title || '').toLowerCase().includes(searchTerm)
        );
    }

    filteredPosts.sort((a, b) => {
        const dateA = a.publishedAt && a.publishedAt.toDate ? a.publishedAt.toDate().getTime() : 0;
        const dateB = b.publishedAt && b.publishedAt.toDate ? b.publishedAt.toDate().getTime() : 0;
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    renderPosts(filteredPosts);
};

// Fungsi-fungsi untuk modal hapus
const openDeleteModal = (id) => {
    postToDeleteId = id;
    deleteModal.classList.remove('hidden');
};

const closeDeleteModal = () => {
    postToDeleteId = null;
    deleteModal.classList.add('hidden');
};

const handleDelete = async () => {
    if (!postToDeleteId) return;
    try {
        // PATH DIKEMBALIKAN ke "posts"
        const postDocRef = doc(db, "posts", postToDeleteId);
        await deleteDoc(postDocRef);
    } catch (error) {
        console.error("Error deleting post: ", error);
        alert("Gagal menghapus postingan.");
    }
    closeDeleteModal();
};

// Listener utama untuk mengambil data dan inisialisasi
const initializeDashboard = (userId) => {
    loadingIndicator.innerHTML = "<p>Memuat postingan...</p>";
    // PATH DIKEMBALIKAN ke "posts"
    const postsCollectionRef = collection(db, "posts");
    const q = query(postsCollectionRef);

    onSnapshot(q, (querySnapshot) => {
        allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loadingIndicator.classList.add('hidden');
        filterAndSortPosts();
    }, (error) => {
        console.error("Error fetching posts: ", error);
        loadingIndicator.innerHTML = "<p class='text-red-500'>Gagal memuat postingan.</p>";
    });
};

// --- INISIALISASI EVENT LISTENERS ---

searchInput.addEventListener('input', filterAndSortPosts);
sortSelect.addEventListener('change', filterAndSortPosts);

cancelDeleteBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', handleDelete);

postListContainer.addEventListener('click', (e) => {
    const editButton = e.target.closest('.edit-btn');
    const deleteButton = e.target.closest('.delete-btn');

    if (editButton) {
        const id = editButton.dataset.id;
        window.location.href = `/admin/create-post.html?id=${id}`;
    }
    if (deleteButton) {
        const id = deleteButton.dataset.id;
        openDeleteModal(id);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        initializeDashboard(user.uid);
    } else {
        // Mengarahkan ke halaman login sesuai skrip asli Anda
        window.location.href = '/admin/login.html';
    }
});

