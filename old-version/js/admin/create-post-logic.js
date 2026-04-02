// js/admin/create-post-logic.js

import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, onSnapshot, query, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db, auth } from "../firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Inisialisasi Quill.js
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'Tulis konten artikel di sini...'
});

// === Elemen Halaman ===
const createPostForm = document.getElementById('createPostForm');
const responseMessage = document.getElementById('responseMessage');
const postCategorySelect = document.getElementById('postCategory');
const pageTitle = document.getElementById('pageTitle');
const backButton = document.getElementById('backButton');
const postStatusSelect = document.getElementById('postStatus');

// === Elemen Modal Kategori ===
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoryModal = document.getElementById('categoryModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const categoryListContainer = document.getElementById('categoryListContainer');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');

// === Elemen Modal Kustom Alert/Confirm ===
const generalAlertModal = document.getElementById('generalAlertModal');
const generalAlertTitle = document.getElementById('generalAlertTitle');
const generalAlertMessage = document.getElementById('generalAlertMessage');
const generalAlertYesBtn = document.getElementById('generalAlertYesBtn');
const generalAlertNoBtn = document.getElementById('generalAlertNoBtn');
const generalAlertSaveBtn = document.getElementById('generalAlertSaveBtn');

// === Variabel State ===
let currentUser = null;
const postId = new URLSearchParams(window.location.search).get('id');
let isFormDirty = false;
// [PEMBARUAN] State untuk sinkronisasi data
let categoriesLoaded = false;
let postDataForEditing = null;

// === Fungsi Helper Modal (tidak ada perubahan) ===
const showModal = (modal) => modal.classList.add('show');
const hideModal = (modal) => modal.classList.remove('show');

const showAlert = (message, title = 'Informasi') => {
    generalAlertTitle.textContent = title;
    generalAlertMessage.textContent = message;
    generalAlertYesBtn.textContent = 'OK';
    generalAlertNoBtn.style.display = 'none';
    generalAlertSaveBtn.style.display = 'none';
    generalAlertYesBtn.classList.remove('danger');
    showModal(generalAlertModal);
    const closeListener = () => {
        hideModal(generalAlertModal);
        generalAlertYesBtn.removeEventListener('click', closeListener);
    };
    generalAlertYesBtn.addEventListener('click', closeListener);
};

const showConfirm = (message, title = 'Konfirmasi', isDanger = false) => {
    return new Promise((resolve) => {
        generalAlertTitle.textContent = title;
        generalAlertMessage.textContent = message;
        generalAlertYesBtn.textContent = 'Ya';
        generalAlertNoBtn.style.display = 'inline-block';
        generalAlertSaveBtn.style.display = 'none';
        if (isDanger) generalAlertYesBtn.classList.add('danger');
        else generalAlertYesBtn.classList.remove('danger');
        showModal(generalAlertModal);
        const cleanup = (result) => {
            generalAlertYesBtn.removeEventListener('click', yesListener);
            generalAlertNoBtn.removeEventListener('click', noListener);
            hideModal(generalAlertModal);
            resolve(result);
        };
        const yesListener = () => cleanup(true);
        const noListener = () => cleanup(false);
        generalAlertYesBtn.addEventListener('click', yesListener);
        generalAlertNoBtn.addEventListener('click', noListener);
    });
};

const showUnsavedChangesConfirm = () => {
    return new Promise((resolve) => {
        generalAlertTitle.textContent = 'Perubahan Belum Disimpan';
        generalAlertMessage.textContent = 'Apa yang ingin Anda lakukan dengan perubahan yang ada?';
        generalAlertNoBtn.textContent = 'Batal';
        generalAlertSaveBtn.textContent = 'Simpan & Kembali';
        generalAlertYesBtn.textContent = 'Kembali Tanpa Simpan';
        generalAlertNoBtn.style.display = 'inline-block';
        generalAlertSaveBtn.style.display = 'inline-block';
        generalAlertYesBtn.style.display = 'inline-block';
        generalAlertYesBtn.classList.add('danger');
        showModal(generalAlertModal);
        const cleanup = (result) => {
            generalAlertNoBtn.removeEventListener('click', cancelListener);
            generalAlertSaveBtn.removeEventListener('click', saveListener);
            generalAlertYesBtn.removeEventListener('click', proceedListener);
            hideModal(generalAlertModal);
            resolve(result);
        };
        const cancelListener = () => cleanup('cancel');
        const saveListener = () => cleanup('save');
        const proceedListener = () => cleanup('proceed');
        generalAlertNoBtn.addEventListener('click', cancelListener);
        generalAlertSaveBtn.addEventListener('click', saveListener);
        generalAlertYesBtn.addEventListener('click', proceedListener);
    });
};

// --- Logika Pelacakan Perubahan Form (tidak ada perubahan) ---
const markFormAsDirty = () => { isFormDirty = true; };
createPostForm.addEventListener('input', markFormAsDirty);
quill.on('text-change', markFormAsDirty);

window.addEventListener('beforeunload', (e) => {
    if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});

backButton.addEventListener('click', async () => {
    if (isFormDirty) {
        const choice = await showUnsavedChangesConfirm();
        switch (choice) {
            case 'save':
                createPostForm.requestSubmit();
                break;
            case 'proceed':
                isFormDirty = false;
                window.location.href = '/admin/dashboard.html';
                break;
            case 'cancel':
                // Do nothing
                break;
        }
    } else {
        window.location.href = '/admin/dashboard.html';
    }
});


// --- [PEMBARUAN] Logika Pemuatan Data dan Kategori ---

// 1. Cek status login pengguna
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        // Langsung muat kategori (cukup sekali)
        loadCategories();
        // Jika ini halaman edit, ambil data postingan
        if (postId) {
            fetchPostDataForEditing(postId);
        }
    } else {
        window.location.href = '/admin/login.html';
    }
});

// 2. Fungsi untuk memuat dan menampilkan kategori secara real-time
const loadCategories = () => {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, orderBy("name", "asc"));

    onSnapshot(q, (snapshot) => {
        const currentCategoryValue = postCategorySelect.value;
        postCategorySelect.innerHTML = '<option value="" disabled>Pilih Kategori...</option>';
        categoryListContainer.innerHTML = '';

        if (snapshot.empty) {
            postCategorySelect.innerHTML = '<option value="" disabled>Belum ada kategori</option>';
            categoryListContainer.innerHTML = '<p>Belum ada kategori. Silakan tambahkan.</p>';
        } else {
            snapshot.forEach(doc => {
                const category = doc.data();
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                postCategorySelect.appendChild(option);

                const itemDiv = document.createElement('div');
                itemDiv.className = 'category-item';
                itemDiv.innerHTML = `<span>${category.name}</span><button class="delete-cat-btn" data-id="${doc.id}" data-name="${category.name}">&times;</button>`;
                categoryListContainer.appendChild(itemDiv);
            });
        }
        
        // Tandai bahwa kategori sudah dimuat
        categoriesLoaded = true;
        // Jika data postingan sudah ada, coba isi form sekarang
        if (postDataForEditing) {
            populateFormFields();
        }
        // Jika tidak dalam mode edit, pulihkan pilihan terakhir (jika ada)
        else if (currentCategoryValue) {
             postCategorySelect.value = currentCategoryValue;
        }
    });
};

// 3. Fungsi untuk mengambil data postingan yang akan diedit
const fetchPostDataForEditing = async (id) => {
    try {
        const postRef = doc(db, "posts", id);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
            // Simpan data postingan ke state
            postDataForEditing = postSnap.data();
            // Jika kategori sudah dimuat, coba isi form sekarang
            if (categoriesLoaded) {
                populateFormFields();
            }
        } else {
            showAlert("Postingan tidak ditemukan. Anda akan diarahkan ke Dashboard.", "Error");
            setTimeout(() => window.location.href = '/admin/dashboard.html', 2000);
        }
    } catch (error) {
        console.error("Error fetching post:", error);
        showAlert(`Terjadi kesalahan saat memuat data: ${error.message}`, "Error");
    }
};

// 4. Fungsi untuk mengisi semua field di form (dipanggil saat data & kategori siap)
const populateFormFields = () => {
    // Pastikan kedua data sudah siap sebelum mengisi form
    if (!postDataForEditing || !categoriesLoaded) return;

    pageTitle.textContent = 'ENoted - Edit Post';
    document.querySelector('.btn-generate').innerText = 'Perbarui Postingan';
    document.title = 'Edit Postingan - ENoted';

    // Isi semua field
    createPostForm['postTitle'].value = postDataForEditing.title;
    createPostForm['postDescription'].value = postDataForEditing.description || '';
    if (Array.isArray(postDataForEditing.keywords)) {
        createPostForm['postKeywords'].value = postDataForEditing.keywords.join(', ');
    }
    quill.root.innerHTML = postDataForEditing.content;
    
    // Pilih kategori dan status yang benar
    postCategorySelect.value = postDataForEditing.category;
    postStatusSelect.value = postDataForEditing.status || 'Draft';
    
    // Hentikan "loading" dan reset state agar tidak terisi ulang
    postDataForEditing = null; 
    setTimeout(() => { isFormDirty = false; }, 100);
};


// --- Logika Modal Kategori (tidak ada perubahan) ---
manageCategoriesBtn.addEventListener('click', () => showModal(categoryModal));
closeCategoryModal.addEventListener('click', () => hideModal(categoryModal));
window.addEventListener('click', (e) => {
    if (e.target === categoryModal) hideModal(categoryModal);
});

addCategoryBtn.addEventListener('click', async () => {
    const newCategoryName = newCategoryInput.value.trim();
    if (newCategoryName) {
        try {
            await addDoc(collection(db, "categories"), { name: newCategoryName });
            newCategoryInput.value = '';
        } catch (error) { console.error("Error adding category:", error); }
    }
});
newCategoryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCategoryBtn.click(); }
});

categoryListContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-cat-btn')) {
        const categoryId = e.target.dataset.id;
        const categoryName = e.target.dataset.name;
        const confirmation = await showConfirm(`Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`, 'Konfirmasi Hapus Kategori', true);
        if (confirmation) {
            try {
                await deleteDoc(doc(db, "categories", categoryId));
            } catch (error) {
                console.error("Error deleting category:", error);
                showAlert("Gagal menghapus kategori.", "Error");
            }
        }
    }
});

// --- Logika Submit Form Utama (tidak ada perubahan signifikan) ---
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const postDetails = {
        title: createPostForm['postTitle'].value,
        category: createPostForm['postCategory'].value,
        description: createPostForm['postDescription'].value,
        keywords: createPostForm['postKeywords'].value.split(',').map(item => item.trim()).filter(item => item),
        content: quill.root.innerHTML,
        status: postStatusSelect.value, // <-- Nilai status sudah diambil dengan benar
        author: 'Cecep Hardiansyah'
    };

    if (!postDetails.title.trim() || !postDetails.category || quill.getLength() <= 1) {
        showAlert('Judul, Kategori, dan Isi Konten tidak boleh kosong.', 'Validasi Gagal');
        return;
    }

    isFormDirty = false;
    const initialMessage = postId ? 'Memperbarui postingan...' : 'Menerbitkan postingan...';
    responseMessage.innerText = initialMessage;
    responseMessage.className = 'response-message show';

    try {
        if (postId) {
            const postRef = doc(db, "posts", postId);
            await setDoc(postRef, { ...postDetails, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            await addDoc(collection(db, "posts"), { ...postDetails, publishedAt: serverTimestamp() });
        }
        
        responseMessage.innerText = 'Postingan berhasil disimpan!';
        responseMessage.className = 'response-message show success';
        
        setTimeout(() => {
            window.location.href = '/admin/dashboard.html';
        }, 1500);
        
    } catch (error) {
        responseMessage.innerText = 'Gagal menyimpan postingan.';
        responseMessage.className = 'response-message show error';
        console.error("Error saving document:", error);
        isFormDirty = true;
        setTimeout(() => {
            responseMessage.classList.remove('show');
        }, 4000);
    }
});

