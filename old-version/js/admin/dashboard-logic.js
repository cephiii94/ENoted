// js/admin/dashboard-logic.js

import { collection, onSnapshot, deleteDoc, doc, query, writeBatch } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { db, auth } from "../firestore.js";

// Variabel state aplikasi
let allPosts = [];
let postToDeleteId = null;

// ===============================================================
// DEKLARASI FUNGSI
// ===============================================================

function renderPosts(posts, container) {
    container.innerHTML = '';
    const noResultsMessage = document.getElementById('no-results');
    
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
            <div class="w-10 flex-shrink-0">
                <input type="checkbox" class="post-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" data-id="${post.id}">
            </div>

            <div class="flex-1 min-w-0 mx-4">
                <p class="font-bold text-gray-900" title="${post.title || ''}">${post.title || 'Tanpa Judul'}</p>
                <p class="text-sm text-gray-500">Kategori: ${post.category || '-'} | Diterbitkan: ${formattedDate}</p>
                <div class="sm:hidden mt-2">
                     <span class="text-xs font-semibold px-3 py-1 rounded-full ${statusBadgeColor}">${status}</span>
                </div>
            </div>

            <div class="hidden sm:block w-40 text-center flex-shrink-0">
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${statusBadgeColor}">${status}</span>
            </div>

            <div class="w-32 flex-shrink-0 flex justify-end">
                <div class="hidden sm:flex items-center text-sm font-medium gap-2">
                    <button data-id="${post.id}" class="view-btn text-gray-500 hover:text-gray-800 p-1">Lihat</button>
                    <span class="text-gray-300">|</span>
                    <button data-id="${post.id}" class="edit-btn text-blue-600 hover:text-blue-800 p-1">Edit</button>
                    <span class="text-gray-300">|</span>
                    <button data-id="${post.id}" class="delete-btn text-red-600 hover:text-red-800 p-1">Hapus</button>
                </div>
                <div class="sm:hidden relative">
                    <button data-id="${post.id}" class="kebab-menu-btn p-2 rounded-full hover:bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                    </button>
                    <div class="kebab-menu-dropdown absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 hidden">
                        <button data-id="${post.id}" class="view-btn block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Lihat</button>
                        <button data-id="${post.id}" class="edit-btn block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</button>
                        <button data-id="${post.id}" class="delete-btn block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Hapus</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(postCard);
    });
}

function populateCategoryFilter(posts, filterElement) {
    const categories = new Set(posts.map(post => post.category).filter(Boolean));
    const selectedValue = filterElement.value;
    filterElement.innerHTML = '<option value="">Semua Kategori</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterElement.appendChild(option);
    });
    filterElement.value = selectedValue;
}

async function handleDelete() {
    const modal = document.getElementById('deleteModal');
    if (!postToDeleteId) return;
    try {
        await deleteDoc(doc(db, "posts", postToDeleteId));
    } catch (error) {
        console.error("Error deleting post: ", error);
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus postingan.', 'error');
    }
    postToDeleteId = null;
    modal.classList.add('hidden');
}

// ===============================================================
// FUNGSI UTAMA UNTUK INISIALISASI APLIKASI
// ===============================================================

function initializeApp() {
    const postListContainer = document.getElementById('post-list');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const categoryFilter = document.getElementById('categoryFilter'); 
    const loadingIndicator = document.getElementById('loading');
    const deleteModal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const massActionSelect = document.getElementById('massActionSelect');
    const applyMassActionBtn = document.getElementById('applyMassActionBtn');

    function filterAndSortPosts() {
        let filteredPosts = [...allPosts];
        if (searchInput.value) filteredPosts = filteredPosts.filter(post => (post.title || '').toLowerCase().includes(searchInput.value.toLowerCase()));
        if (categoryFilter.value) filteredPosts = filteredPosts.filter(post => post.category === categoryFilter.value);
        filteredPosts.sort((a, b) => {
            const dateA = a.publishedAt?.toDate()?.getTime() || 0;
            const dateB = b.publishedAt?.toDate()?.getTime() || 0;
            return sortSelect.value === 'newest' ? dateB - dateA : dateA - dateB;
        });
        renderPosts(filteredPosts, postListContainer);
    }
    
    async function handleMassAction() {
        const action = massActionSelect.value;
        const selectedCheckboxes = document.querySelectorAll('.post-checkbox:checked');
        if (!action) return Swal.fire('Perhatian!', 'Silakan pilih tindakan yang ingin diterapkan.', 'warning');
        if (selectedCheckboxes.length === 0) return Swal.fire('Perhatian!', 'Silakan pilih minimal satu postingan.', 'warning');
        
        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);
        const confirmationText = action === 'delete' ? 'menghapus' : 'memperbarui status';
        
        const result = await Swal.fire({
            title: 'Anda Yakin?', text: `Anda akan ${confirmationText} ${selectedIds.length} postingan yang dipilih.`,
            icon: 'question', showCancelButton: true, confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33', confirmButtonText: 'Ya, Lanjutkan!', cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                const batch = writeBatch(db);
                selectedIds.forEach(id => {
                    const postRef = doc(db, "posts", id);
                    if (action === 'delete') batch.delete(postRef);
                    else if (action === 'publish') batch.update(postRef, { status: 'Published' });
                    else if (action === 'draft') batch.update(postRef, { status: 'Draft' });
                });
                await batch.commit();
                Swal.fire('Berhasil!', 'Tindakan massal berhasil diterapkan.', 'success');
            } catch (error) {
                console.error("Error applying mass action: ", error);
                Swal.fire('Gagal!', 'Terjadi kesalahan saat menerapkan tindakan massal.', 'error');
            }
        }
    }
    
    searchInput.addEventListener('input', filterAndSortPosts);
    sortSelect.addEventListener('change', filterAndSortPosts);
    categoryFilter.addEventListener('change', filterAndSortPosts);
    cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.add('hidden'));
    confirmDeleteBtn.addEventListener('click', handleDelete);
    applyMassActionBtn.addEventListener('click', handleMassAction);

    postListContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton) return;
        
        if (targetButton.classList.contains('kebab-menu-btn')) {
            const dropdown = targetButton.nextElementSibling;
            document.querySelectorAll('.kebab-menu-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.add('hidden');
            });
            dropdown.classList.toggle('hidden');
            return;
        }
        
        const id = targetButton.dataset.id;
        
        if (targetButton.classList.contains('view-btn')) {
            const post = allPosts.find(p => p.id === id);
            if (post) {
                Swal.fire({
                    title: `<strong style="font-size: 1.25rem;">${post.title || 'Tanpa Judul'}</strong>`,
                    html: `<div style="text-align: left; max-height: 400px; overflow-y: auto; line-height: 1.6;">${post.content || 'Tidak ada konten.'}</div>`,
                    width: '800px', showCancelButton: true, confirmButtonText: 'Tutup',
                    cancelButtonText: 'Edit', cancelButtonColor: '#ffc107'
                }).then((result) => {
                    if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                        window.location.href = `/admin/create-post.html?id=${id}`;
                    }
                });
            }
        }
        
        if (targetButton.classList.contains('edit-btn')) {
            window.location.href = `/admin/create-post.html?id=${id}`;
        }
        
        if (targetButton.classList.contains('delete-btn')) {
            Swal.fire({
                title: 'Anda Yakin?', text: "Anda tidak akan bisa mengembalikan postingan ini!", icon: 'warning',
                showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
                confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    postToDeleteId = id;
                    handleDelete().then(() => Swal.fire('Terhapus!', 'Postingan Anda telah dihapus.', 'success'));
                }
            });
        }
    });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('.kebab-menu-btn')) {
            document.querySelectorAll('.kebab-menu-dropdown').forEach(d => d.classList.add('hidden'));
        }
    });

    loadingIndicator.innerHTML = "<p>Memuat postingan...</p>";
    const q = query(collection(db, "posts"));
    onSnapshot(q, (querySnapshot) => {
        allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loadingIndicator.classList.add('hidden');
        populateCategoryFilter(allPosts, categoryFilter);
        filterAndSortPosts();
    }, (error) => {
        console.error("Error fetching posts: ", error);
        loadingIndicator.innerHTML = "<p class='text-red-500'>Gagal memuat postingan.</p>";
    });
}

// ===============================================================
// TITIK MASUK UTAMA APLIKASI (ENTRY POINT)
// ===============================================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        initializeApp();
    } else {
        window.location.href = '/admin/login.html';
    }
});