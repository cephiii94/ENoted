// js/admin/create-post-logic.js

import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db, auth } from "../firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// --- PERUBAHAN 1: Inisialisasi Quill.js di sini ---
// Kita buat instance Quill agar bisa diakses di seluruh file ini.
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'Tulis konten artikel di sini...'
});

const createPostForm = document.getElementById('createPostForm');
const responseMessage = document.getElementById('responseMessage');

let currentUser = null;
const postId = new URLSearchParams(window.location.search).get('id');

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Pengguna terautentikasi. UID:", currentUser.uid);
        // Jika ada postId di URL (mode edit), ambil datanya.
        if (postId) {
            fetchPostAndPopulateForm(postId);
        }
    } else {
        // Jika tidak ada user, arahkan ke halaman login.
        currentUser = null;
        window.location.href = '/admin/login.html';
    }
});

// Fungsi untuk mengambil data postingan (saat mode edit) dan mengisinya ke form
const fetchPostAndPopulateForm = async (postId) => {
    try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const postData = postSnap.data();
            createPostForm['postTitle'].value = postData.title;
            createPostForm['postCategory'].value = postData.category;
            createPostForm['postDescription'].value = postData.description || '';
            // Jika keywords adalah array (format penyimpanan baru), gabungkan jadi string.
            if (Array.isArray(postData.keywords)) {
                createPostForm['postKeywords'].value = postData.keywords.join(', ');
            } else {
                createPostForm['postKeywords'].value = postData.keywords || '';
            }
            
            // --- PERUBAHAN 2: Isi konten ke editor Quill ---
            // Gunakan metode Quill untuk mengisi konten, bukan elemen form biasa.
            quill.root.innerHTML = postData.content;
            
            // Ubah teks tombol dan judul halaman untuk menandakan mode edit.
            document.querySelector('.btn-generate').innerText = 'Perbarui Postingan';
            document.title = 'Edit Postingan - ENoted';
        } else {
            alert("Postingan tidak ditemukan.");
            window.location.href = '/admin/dashboard.html';
        }
    } catch (error) {
        console.error("Error mengambil postingan untuk diedit:", error);
        alert("Gagal memuat postingan untuk diedit.");
    }
};

// Event listener untuk form submit (baik untuk buat baru maupun update)
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah halaman reload

    if (!currentUser) {
        responseMessage.style.display = 'block';
        responseMessage.className = 'response-message error';
        responseMessage.innerText = 'Anda harus login untuk menerbitkan postingan.';
        return;
    }

    // Ambil semua nilai dari form
    const title = createPostForm['postTitle'].value;
    const category = createPostForm['postCategory'].value;
    const description = createPostForm['postDescription'].value;
    // Ubah string keywords menjadi array agar lebih mudah dikelola di Firestore
    const keywords = createPostForm['postKeywords'].value.split(',').map(item => item.trim()).filter(item => item);

    // --- PERUBAHAN 3: Ambil konten HTML langsung dari Quill ---
    const content = quill.root.innerHTML;
    
    // Validasi sederhana agar judul dan konten tidak kosong
    if (!title.trim() || quill.getLength() <= 1) {
        alert('Judul dan Isi Konten tidak boleh kosong.');
        return;
    }

    // Penulis bisa di-hardcode atau diambil dari data user yang login
    const author = 'Cecep Hardiansyah'; 

    try {
        responseMessage.style.display = 'block';
        responseMessage.className = 'response-message';

        if (postId) {
            // Logika untuk MEMPERBARUI postingan yang sudah ada
            responseMessage.innerText = 'Memperbarui postingan...';
            const postRef = doc(db, "posts", postId);
            await setDoc(postRef, {
                title, category, description, keywords, content, author, 
                // Kita tambahkan updatedAt untuk melacak kapan terakhir diubah
                updatedAt: serverTimestamp() 
            }, { merge: true }); // 'merge: true' memastikan field lain tidak terhapus
        } else {
            // Logika untuk MEMBUAT postingan baru
            responseMessage.innerText = 'Menerbitkan postingan...';
            await addDoc(collection(db, "posts"), {
                title, category, description, keywords, content, author, 
                publishedAt: serverTimestamp()
            });
        }
        
        responseMessage.className = 'response-message success';
        responseMessage.innerText = 'Postingan berhasil disimpan!';
        
        // Setelah berhasil, tunggu sejenak lalu arahkan kembali ke dashboard
        setTimeout(() => {
            window.location.href = '/admin/dashboard.html';
        }, 1500);
        
    } catch (error) {
        responseMessage.className = 'response-message error';
        responseMessage.innerText = 'Gagal menyimpan postingan. Coba lagi.';
        console.error("Error menyimpan dokumen:", error);
    }
});
