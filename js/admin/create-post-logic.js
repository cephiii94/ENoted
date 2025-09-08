// js/admin/create-post-logic.js

import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, onSnapshot, query, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db, auth } from "../firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Inisialisasi Quill.js
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'Tulis konten artikel di sini...'
});

// Elemen Form Utama
const createPostForm = document.getElementById('createPostForm');
const responseMessage = document.getElementById('responseMessage');
const postCategorySelect = document.getElementById('postCategory');

// Elemen Modal Kategori
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoryModal = document.getElementById('categoryModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const categoryListContainer = document.getElementById('categoryListContainer');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');

// Elemen Modal Konfirmasi Hapus (BARU)
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

let currentUser = null;
const postId = new URLSearchParams(window.location.search).get('id');
let postDataToSelect = null;
let categoryToDelete = null; // Menyimpan info kategori yang akan dihapus

// Fungsi untuk memuat kategori secara real-time
const loadCategories = () => {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, orderBy("name", "asc"));

    onSnapshot(q, (snapshot) => {
        postCategorySelect.innerHTML = '<option value="" disabled>Pilih Kategori...</option>';
        categoryListContainer.innerHTML = '';

        if (snapshot.empty) {
             postCategorySelect.innerHTML = '<option value="" disabled>Belum ada kategori</option>';
             categoryListContainer.innerHTML = '<p>Belum ada kategori. Silakan tambahkan.</p>';
        } else {
            snapshot.forEach(doc => {
                const category = doc.data();
                const categoryId = doc.id;

                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                postCategorySelect.appendChild(option);

                const itemDiv = document.createElement('div');
                itemDiv.className = 'category-item';
                itemDiv.innerHTML = `
                    <span>${category.name}</span>
                    <button class="delete-cat-btn" data-id="${categoryId}" data-name="${category.name}">&times;</button>
                `;
                categoryListContainer.appendChild(itemDiv);
            });
        }

        if (postDataToSelect) {
            postCategorySelect.value = postDataToSelect;
            postDataToSelect = null;
        } else {
            postCategorySelect.selectedIndex = 0;
        }
    });
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Pengguna terautentikasi. UID:", currentUser.uid);
        loadCategories();
        if (postId) {
            fetchPostAndPopulateForm(postId);
        }
    } else {
        window.location.href = '/admin/login.html';
    }
});

const fetchPostAndPopulateForm = async (postId) => {
    try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
            const postData = postSnap.data();
            createPostForm['postTitle'].value = postData.title;
            createPostForm['postDescription'].value = postData.description || '';
            if (Array.isArray(postData.keywords)) {
                createPostForm['postKeywords'].value = postData.keywords.join(', ');
            }
            quill.root.innerHTML = postData.content;
            postDataToSelect = postData.category;
            document.querySelector('.btn-generate').innerText = 'Perbarui Postingan';
            document.title = 'Edit Postingan - ENoted';
        } else {
            window.location.href = '/admin/dashboard.html';
        }
    } catch (error) {
        console.error("Error mengambil postingan:", error);
    }
};

// --- Logika untuk menampilkan dan menyembunyikan modal ---
const showModal = (modal) => modal.classList.add('show');
const hideModal = (modal) => modal.classList.remove('show');

manageCategoriesBtn.addEventListener('click', () => showModal(categoryModal));
closeCategoryModal.addEventListener('click', () => hideModal(categoryModal));
cancelDeleteBtn.addEventListener('click', () => hideModal(confirmModal));
window.addEventListener('click', (e) => {
    if (e.target === categoryModal) hideModal(categoryModal);
    if (e.target === confirmModal) hideModal(confirmModal);
});

// --- Logika Kategori (Tambah & Hapus) ---
addCategoryBtn.addEventListener('click', async () => {
    const newCategoryName = newCategoryInput.value.trim();
    if (newCategoryName) {
        try {
            await addDoc(collection(db, "categories"), { name: newCategoryName });
            newCategoryInput.value = '';
        } catch (error) {
            console.error("Error menambah kategori:", error);
        }
    }
});
newCategoryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCategoryBtn.click(); }
});

categoryListContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-cat-btn')) {
        categoryToDelete = {
            id: e.target.dataset.id,
            name: e.target.dataset.name
        };
        confirmMessage.textContent = `Apakah Anda yakin ingin menghapus kategori "${categoryToDelete.name}"?`;
        showModal(confirmModal);
    }
});

confirmDeleteBtn.addEventListener('click', async () => {
    if (categoryToDelete) {
        try {
            await deleteDoc(doc(db, "categories", categoryToDelete.id));
            hideModal(confirmModal);
            categoryToDelete = null;
        } catch (error) {
            console.error("Error menghapus kategori:", error);
            alert("Gagal menghapus kategori.");
        }
    }
});

// --- Logika Submit Form Utama ---
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const postDetails = {
        title: createPostForm['postTitle'].value,
        category: createPostForm['postCategory'].value,
        description: createPostForm['postDescription'].value,
        keywords: createPostForm['postKeywords'].value.split(',').map(item => item.trim()).filter(item => item),
        content: quill.root.innerHTML,
        author: 'Cecep Hardiansyah'
    };

    if (!postDetails.title.trim() || !postDetails.category || quill.getLength() <= 1) {
        alert('Judul, Kategori, dan Isi Konten tidak boleh kosong.');
        return;
    }

    responseMessage.style.display = 'block';
    responseMessage.className = 'response-message';

    try {
        if (postId) {
            responseMessage.innerText = 'Memperbarui postingan...';
            const postRef = doc(db, "posts", postId);
            await setDoc(postRef, { ...postDetails, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            responseMessage.innerText = 'Menerbitkan postingan...';
            await addDoc(collection(db, "posts"), { ...postDetails, publishedAt: serverTimestamp() });
        }
        
        responseMessage.className = 'response-message success';
        responseMessage.innerText = 'Postingan berhasil disimpan!';
        
        setTimeout(() => window.location.href = '/admin/dashboard.html', 1500);
        
    } catch (error) {
        responseMessage.className = 'response-message error';
        responseMessage.innerText = 'Gagal menyimpan postingan.';
        console.error("Error menyimpan dokumen:", error);
    }
});

