// Tampilkan semua artikel saat halaman dimuat
window.onload = function() {
    filterArticles('semua');
};

// Fungsi untuk memfilter artikel
function filterArticles(category) {
    const articles = document.querySelectorAll('.article');
    
    articles.forEach(article => {
        if (category === 'semua') {
            article.style.display = 'block'; // Tampilkan semua
        } else {
            // Ambil data kategori dan pecah menjadi array (berdasarkan spasi)
            const articleCategories = article.getAttribute('data-category').split(' ');
            
            // Cek apakah array kategori artikel mengandung kategori yang dipilih
            if (articleCategories.includes(category)) {
                article.style.display = 'block'; // Tampilkan yang sesuai kategori
            } else {
                article.style.display = 'none'; // Sembunyikan yang tidak sesuai
            }
        }
    });
    
    // Tambahkan class active pada teks filter yang dipilih
    const filterLinks = document.querySelectorAll('.filter-link');
    filterLinks.forEach(link => {
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}