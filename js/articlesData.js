// Data artikel dalam bentuk array objek
const articles = [
    {
        category: "belajar-koding",
        title: "Apa itu Framework",
        description: "Framework adalah kerangka kerja yang membantu pengembangan aplikasi menjadi lebih terstruktur dan efisien.",
        link: "/kategori/belajar-koding/apa-itu-framework.html"
    },
    {
        category: "belajar-koding",
        title: "Apa itu JavaScript Library",
        description: "JavaScript library adalah kumpulan fungsi siap pakai untuk memudahkan pengembangan aplikasi web.",
        link: "/kategori/belajar-koding/apa-itu-javascript-library.html"
    },
    {
        category: "belajar-koding",
        title: "Apa itu CSS",
        description: "CSS digunakan untuk mengatur tampilan dan tata letak halaman web agar lebih menarik.",
        link: "/kategori/belajar-koding/apa-itu-css.html"
    },
    {
        category: "islam",
        title: "Manfaat Bersedekah",
        description: "Temukan berbagai keajaiban dan manfaat berbagi dalam kehidupan sehari-hari.",
        link: "/kategori/islam/manfaat-sedekah.html"
    },
    {
        category: "islam",
        title: "Tata Cara Shalat dalam Islam",
        description: "Panduan singkat dan mudah dipahami untuk melaksanakan shalat sesuai tuntunan Islam.",
        link: "/kategori/islam/tata-cara-shalat-dalam-islam-panduan-singkat-untuk-pemula.html"
    },
    {
        category: "tutorial",
        title: "Cara Download Youtube",
        description: "Pelajari cara mudah mengunduh video Youtube tanpa aplikasi tambahan.",
        link: "/kategori/tutorial/download-yt-tanpa-app.html"
    },
    {
        category: "belajar-koding",
        title: "Apa itu HTML",
        description: "HTML adalah bahasa markup dasar untuk membuat dan menyusun halaman web di internet.",
        link: "/kategori/belajar-koding/apa-itu-html.html"
    },
    {
        category: "belajar-koding",
        title: "Apa itu Javascript",
        description: "Javascript adalah bahasa pemrograman yang digunakan untuk membuat halaman web menjadi interaktif.",
        link: "/kategori/belajar-koding/apa-itu-js.html"
    },
    {
        category: "belajar-koding",
        title: "Apa itu Node.js",
        description: "Node.js adalah platform berbasis JavaScript untuk menjalankan aplikasi di sisi server.",
        link: "/kategori/belajar-koding/apa-itu-nodejs.html"
    },
    {
        category: "belajar-koding",
        title: "Apa itu API (Application Programming Interface)",
        description: "API adalah antarmuka yang memungkinkan aplikasi saling berkomunikasi dan bertukar data.",
        link: "/kategori/belajar-koding/apa-itu-api.html"
    }
];

// Fungsi untuk menampilkan artikel ke DOM
function displayArticles(articleList) {
    const mainElement = document.querySelector('main');
    if (!mainElement) {
        console.error("Element <main> tidak ditemukan di DOM.");
        return;
    }
    mainElement.innerHTML = ''; // Kosongkan konten main sebelum menambahkan artikel

    articleList.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article');
        articleDiv.setAttribute('data-category', article.category);

        const postArticle = document.createElement('article');
        postArticle.classList.add('post');
        // Pastikan fungsi openPost tersedia secara global (dari script.js)
        postArticle.setAttribute('onclick', `openPost('${article.link}')`);

        const postTitle = document.createElement('h3');
        postTitle.classList.add('post-title');
        postTitle.textContent = article.title;

        const postDescription = document.createElement('p');
        postDescription.textContent = article.description;

        postArticle.appendChild(postTitle);
        postArticle.appendChild(postDescription);
        articleDiv.appendChild(postArticle);
        mainElement.appendChild(articleDiv);
    });
}

// Fungsi untuk memfilter artikel dan menampilkannya kembali
function filterArticles(category) {
    const filteredArticles = (category === 'semua')
        ? articles
        : articles.filter(article => article.category === category);
    displayArticles(filteredArticles);

    // Tambahkan atau sesuaikan logika untuk mengaktifkan/menonaktifkan kelas 'active' pada filter link
    const filterLinks = document.querySelectorAll('.filter-link');
    filterLinks.forEach(link => {
        if (link.dataset.category === category) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Panggil fungsi displayArticles saat DOM sudah dimuat untuk menampilkan semua artikel di awal
document.addEventListener('DOMContentLoaded', () => {
    displayArticles(articles);
    // Secara default, aktifkan link "Semua" saat halaman pertama kali dimuat
    const semuaLink = document.querySelector('.filter-link[data-category="semua"]');
    if (semuaLink) {
        semuaLink.classList.add('active');
    }
});