// js/admin/dashboard-logic.js

import { collection, onSnapshot, deleteDoc, doc, query, writeBatch } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { db, auth } from "../firestore.js";

// Pengambilan elemen DOM
const postListContainer = document.getElementById('post-list');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryFilter = document.getElementById('categoryFilter'); 
const loadingIndicator = document.getElementById('loading');
const noResultsMessage = document.getElementById('no-results');
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const massActionSelect = document.getElementById('massActionSelect');
const applyMassActionBtn = document.getElementById('applyMassActionBtn');

// Variabel state aplikasi
let allPosts = [];
let postToDeleteId = null;

const renderPosts = (posts) => {
    postListContainer.innerHTML = ''; 
    
    if (posts.length === 0) {
        noResultsMessage.classList.remove('hidden');
    } else {
        noResultsMessage.classList.add('hidden');
    }
    
    posts.forEach(post => {
        const postDate = post.publishedAt?.toDate() || new Date();
        const formattedDate = postDate.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const status = post.status || 'Draft';

        let statusBadgeColor;
        switch (status) {
            case 'Published': statusBadgeColor = 'bg-green-100 text-green-800'; break;
            case 'Archived': statusBadgeColor = 'bg-gray-100 text-gray-800'; break;
            default: statusBadgeColor = 'bg-yellow-100 text-yellow-800';
        }

        const postCard = document.createElement('div');
        postCard.className = "flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors";
        postCard.innerHTML = `
            <div class="w-10 flex-shrink-0"><input type="checkbox" class="post-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" data-id="${post.id}"></div>
            <div class="flex-1">
                <p class="font-bold text-gray-900">${post.title || 'Tanpa Judul'}</p>
                <p class="text-sm text-gray-500">Kategori: ${post.category || '-'} | Diterbitkan: ${formattedDate}</p>
            </div>
            <div class="w-48 flex-shrink-0 text-right"><span class="text-xs font-semibold px-3 py-1 rounded-full ${statusBadgeColor}">${status}</span></div>
            <div class="w-48 flex-shrink-0 text-right text-sm font-medium">
                <a href="#" class="text-gray-500 hover:text-gray-800">Lihat</a>
                <span class="text-gray-300 mx-2">|</span>
                <button data-id="${post.id}" class="edit-btn text-blue-600 hover:text-blue-800">Edit</button>
                <span class="text-gray-300 mx-2">|</span>
                <button data-id="${post.id}" class="delete-btn text-red-600 hover:text-red-800">Hapus</button>
            </div>
        `;
        postListContainer.appendChild(postCard);
    });
};

const populateCategoryFilter = (posts) => {
    const categories = new Set(posts.map(post => post.category).filter(Boolean));
    const selectedValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">Semua Kategori</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    categoryFilter.value = selectedValue;
};

const filterAndSortPosts = () => {
    let filteredPosts = [...allPosts];
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    const selectedCategory = categoryFilter.value;

    if (searchTerm) filteredPosts = filteredPosts.filter(post => (post.title || '').toLowerCase().includes(searchTerm));
    if (selectedCategory) filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);

    filteredPosts.sort((a, b) => {
        const dateA = a.publishedAt?.toDate()?.getTime() || 0;
        const dateB = b.publishedAt?.toDate()?.getTime() || 0;
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    renderPosts(filteredPosts);
};

const openDeleteModal = (id) => {
    postToDeleteId = id;
    deleteModal.classList.remove('hidden');
};

const closeDeleteModal = () => {
    postToDeleteId = null;
    deleteModal.classList.add('hidden');
};

// === DIPERBARUI: Notifikasi menggunakan SweetAlert2 ===
const handleDelete = async () => {
    if (!postToDeleteId) return;
    try {
        await deleteDoc(doc(db, "posts", postToDeleteId));
        // Notifikasi sukses tidak lagi diperlukan di sini karena modal akan ditutup
        // dan daftar postingan akan diperbarui secara real-time oleh onSnapshot.
    } catch (error) {
        console.error("Error deleting post: ", error);
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus postingan.', 'error');
    }
    closeDeleteModal();
};

const initializeDashboard = (userId) => {
    loadingIndicator.innerHTML = "<p>Memuat postingan...</p>";
    const q = query(collection(db, "posts"));
    onSnapshot(q, (querySnapshot) => {
        allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loadingIndicator.classList.add('hidden');
        populateCategoryFilter(allPosts);
        filterAndSortPosts();
    }, (error) => {
        console.error("Error fetching posts: ", error);
        loadingIndicator.innerHTML = "<p class='text-red-500'>Gagal memuat postingan.</p>";
    });
};

// === DIPERBARUI: Seluruh logika notifikasi di sini menggunakan SweetAlert2 ===
const handleMassAction = async () => {
    const action = massActionSelect.value;
    const selectedCheckboxes = document.querySelectorAll('.post-checkbox:checked');
    
    if (!action) {
        Swal.fire('Perhatian!', 'Silakan pilih tindakan yang ingin diterapkan.', 'warning');
        return;
    }
    if (selectedCheckboxes.length === 0) {
        Swal.fire('Perhatian!', 'Silakan pilih minimal satu postingan.', 'warning');
        return;
    }

    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);
    const confirmationText = action === 'delete' ? 'menghapus' : 'memperbarui status';

    // Mengganti confirm() dengan Swal.fire()
    Swal.fire({
        title: 'Anda Yakin?',
        text: `Anda akan ${confirmationText} ${selectedIds.length} postingan yang dipilih.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Lanjutkan!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const batch = writeBatch(db);
                selectedIds.forEach(id => {
                    const postRef = doc(db, "posts", id);
                    switch (action) {
                        case 'delete': batch.delete(postRef); break;
                        case 'publish': batch.update(postRef, { status: 'Published' }); break;
                        case 'draft': batch.update(postRef, { status: 'Draft' }); break;
                    }
                });
                await batch.commit();
                Swal.fire('Berhasil!', 'Tindakan massal berhasil diterapkan.', 'success');
            } catch (error) {
                console.error("Error applying mass action: ", error);
                Swal.fire('Gagal!', 'Terjadi kesalahan saat menerapkan tindakan massal.', 'error');
            }
        }
    });
};

// --- INISIALISASI EVENT LISTENERS ---
searchInput.addEventListener('input', filterAndSortPosts);
sortSelect.addEventListener('change', filterAndSortPosts);
categoryFilter.addEventListener('change', filterAndSortPosts);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', handleDelete);
applyMassActionBtn.addEventListener('click', handleMassAction); 

postListContainer.addEventListener('click', (e) => {
    const editButton = e.target.closest('.edit-btn');
    if (editButton) {
        window.location.href = `/admin/create-post.html?id=${editButton.dataset.id}`;
    }
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        // Logika hapus tunggal juga kita ubah menggunakan SweetAlert
        const id = deleteButton.dataset.id;
        Swal.fire({
            title: 'Anda Yakin?',
            text: "Anda tidak akan bisa mengembalikan postingan ini!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // Untuk konsistensi, kita panggil fungsi handleDelete yang sudah ada
                // dengan ID yang sudah disimpan, tapi kita perlu set dulu
                postToDeleteId = id;
                handleDelete().then(() => {
                    Swal.fire('Terhapus!', 'Postingan Anda telah dihapus.', 'success');
                });
            }
        });
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        initializeDashboard(user.uid);
    } else {
        window.location.href = '/admin/login.html';
    }
});