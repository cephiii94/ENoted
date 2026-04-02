// js/post-page.js

// Import modul yang dibutuhkan
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from "./firestore.js";

// Ambil ID postingan dari URL
const getPostIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
};

const displayPost = async () => {
    const postId = getPostIdFromUrl();

    if (!postId) {
        // Jika tidak ada ID, tampilkan pesan error atau arahkan ke halaman lain
        console.error("ID Postingan tidak ditemukan di URL.");
        document.getElementById('postTitle').innerText = "Postingan Tidak Ditemukan";
        document.getElementById('postContent').innerHTML = "<p>Maaf, postingan yang Anda cari tidak tersedia.</p>";
        return;
    }

    try {
        const docRef = doc(db, "posts", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const postData = docSnap.data();

            // Mengisi elemen HTML
            document.getElementById('pageTitle').innerText = `ENoted - ${postData.title}`;
            document.getElementById('postTitle').innerText = postData.title;
            document.getElementById('postContent').innerHTML = postData.content;
            document.getElementById('postDate').innerText = new Date(postData.publishedAt.toDate()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('postDate').setAttribute('datetime', postData.publishedAt.toDate().toISOString());
            
            // Mengisi Breadcrumb
            document.getElementById('breadcrumbCategory').innerText = postData.category;
            document.getElementById('breadcrumbTitle').innerText = postData.title;
            
            // Mengisi Meta Tags SEO
            document.getElementById('metaDescription').setAttribute('content', postData.description || '...'); // Ganti dengan deskripsi dari postData jika ada
            document.getElementById('metaKeywords').setAttribute('content', postData.keywords || '...'); // Ganti dengan keywords dari postData jika ada
            document.getElementById('ogTitle').setAttribute('content', postData.title);
            document.getElementById('ogDescription').setAttribute('content', postData.description || '...');
            document.getElementById('twitterTitle').setAttribute('content', postData.title);
            document.getElementById('twitterDescription').setAttribute('content', postData.description || '...');
            
            // Mengisi Canonical dan Open Graph URL
            const fullUrl = `${window.location.origin}/post-template.html?id=${postId}`;
            document.getElementById('canonicalUrl').setAttribute('href', fullUrl);
            document.getElementById('ogUrl').setAttribute('content', fullUrl);

            // Mengisi Schema.org
            const breadcrumbSchema = JSON.parse(document.getElementById('breadcrumbSchema').textContent);
            breadcrumbSchema.itemListElement.push(
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Beranda",
                    "item": `${window.location.origin}/index.html`
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": postData.category,
                    "item": `${window.location.origin}/post-template.html?category=${postData.category}`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": postData.title,
                    "item": fullUrl
                }
            );
            document.getElementById('breadcrumbSchema').textContent = JSON.stringify(breadcrumbSchema);

            const articleSchema = JSON.parse(document.getElementById('articleSchema').textContent);
            articleSchema.headline = postData.title;
            articleSchema.datePublished = postData.publishedAt.toDate().toISOString();
            articleSchema.dateModified = postData.publishedAt.toDate().toISOString();
            articleSchema.description = postData.description || '...';
            document.getElementById('articleSchema').textContent = JSON.stringify(articleSchema);

        } else {
            // Jika dokumen tidak ada
            document.getElementById('postTitle').innerText = "Postingan Tidak Ditemukan";
            document.getElementById('postContent').innerHTML = "<p>Maaf, postingan yang Anda cari tidak tersedia.</p>";
        }
    } catch (error) {
        console.error("Error mengambil postingan:", error);
        document.getElementById('postTitle').innerText = "Terjadi Kesalahan";
        document.getElementById('postContent').innerHTML = "<p>Maaf, terjadi kesalahan saat memuat konten.</p>";
    }
};

// Jalankan fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", displayPost);