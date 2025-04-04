function generateHTML() {
    // Mengambil input pengguna
    let judul = document.getElementById("judul").value;
    let isi = document.getElementById("isi").value;
    let kategori = document.getElementById("kategori").value;
    let deskripsi = document.getElementById("deskripsi").value;
    let keywords = document.getElementById("keywords").value;
    
    // Sanitasi input
    judul = sanitizeInput(judul);
    kategori = sanitizeInput(kategori);
    deskripsi = sanitizeInput(deskripsi);
    keywords = sanitizeInput(keywords);
    
    // Isi konten dikonversi menggunakan Markdown-like syntax
    let kontenHTML = convertToStructuredHTML(isi);
    
    // Membuat slug untuk URL
    let slug = createSlug(judul);
    let kategoriSlug = createSlug(kategori);
    
    // Tanggal dan waktu
    let currentDate = new Date();
    let isoDate = currentDate.toISOString();
    let formattedDate = formatDate(currentDate);
    
    // Template HTML
    let htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Meta SEO -->
    <meta name="description" content="${deskripsi}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="ENoted">
    <meta name="robots" content="index, follow">

    <!-- Meta tag kategori untuk filter konten -->
    <meta name="${kategori}" content="${kategori}">

    
    <link rel="canonical" href="https://www.enoted.netifly.app/kategori/${kategori}/${slug}.html">
    
    <!-- Open Graph tags -->
    <meta property="og:title" content="${judul}">
    <meta property="og:description" content="${deskripsi}">
    <meta property="og:image" content="https://www.enoted.netifly.app/img/default-thumbnail.jpg">
    <meta property="og:url" content="https://www.enoted.netifly.app/kategori/${kategori}/${slug}.html">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="ENoted">
    
    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${judul}">
    <meta name="twitter:description" content="${deskripsi}">
    <meta name="twitter:image" content="https://www.enoted.netifly.app/img/default-thumbnail.jpg">
 
    <link rel="icon" type="image/png" href="/img/favicon.ico">
    <title>ENoted - ${judul}</title>
    <link rel="stylesheet" href="/css/style.css">
    <style>
        blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #555; margin: 15px 0; }
        code { background: #eee; padding: 2px 4px; border-radius: 4px; }
        pre code { display: block; padding: 10px; background: #222; color: #fff; overflow-x: auto; }
    </style>
</head>

<body class="post-page">
    <div class="content">
        <!-- Breadcrumb navigation -->
        <nav aria-label="breadcrumb" class="breadcrumb">
            <ol>
                <li><a href="/index.html">Beranda</a></li>
                <li><a href="/kategori/${kategori}/01.index.html">${kategori}</a></li>
                <li aria-current="page">${judul}</li>
            </ol>
        </nav>

        <h1>${judul}</h1>

        <div class="post-meta">
            <time datetime="${isoDate}" class="post-date">${formattedDate}</time>
        </div>
        
        <button class="share-btn" id="shareButton">Bagikan</button>
        
        <div class="share-menu" id="shareMenu">
            <a href="#" onclick="shareViaWhatsApp()">WhatsApp</a>
            <a href="#" onclick="shareViaFacebook()">Facebook</a>
            <a href="#" onclick="shareViaTelegram()">Telegram</a>
            <a href="#" onclick="copyLink()">Salin Link</a>
        </div>
        
        <div class="post-content">
            ${kontenHTML}
        </div>
        
        <button class="back-btn" id="backButton" onclick="goBack()">Kembali</button>
    </div>

    <script>
    // Fungsi berbagi dan navigasi
    function shareViaWhatsApp() {
        let postUrl = window.location.href;
        window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent('${judul} - ' + postUrl), '_blank');
    }
    
    function shareViaFacebook() {
        let postUrl = window.location.href;
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(postUrl), '_blank');
    }
    
    function shareViaTelegram() {
        let postUrl = window.location.href;
        window.open('https://t.me/share/url?url=' + encodeURIComponent(postUrl) + '&text=' + encodeURIComponent('${judul}'), '_blank');
    }
    
    function copyLink() {
        let postUrl = window.location.href;
        navigator.clipboard.writeText(postUrl).then(() => {
            alert('Link berhasil disalin!');
        }).catch(err => {
            console.error('Gagal menyalin link: ', err);
        });
    }
    
    function goBack() {
        window.history.back();
    }
    
    document.getElementById('shareButton').addEventListener('click', function() {
        document.getElementById('shareMenu').classList.toggle('active');
    });
    </script>

    <!-- Script Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Beranda",
                "item": "https://www.enoted.netifly.app/index.html"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "${kategori}",
                "item": "https://www.enoted.netifly.app/kategori/${kategoriSlug}/01.index.html"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "${judul}",
                "item": "https://www.enoted.netifly.app/kategori/${kategorislug}/${slug}.html"
            }
        ]
    }
    </script>
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${judul}",
        "datePublished": "${isoDate}",
        "dateModified": "${isoDate}",
        "author": {
            "@type": "Person",
            "name": "ENoted"
        },
        "publisher": {
            "@type": "Organization",
            "name": "ENoted",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.enoted.netifly.app/img/logo.png"
            }
        },
        "description": "${deskripsi}"
    }
    </script>
</body>
</html>
`;

    // Menampilkan preview
    let preview = document.getElementById("preview");
    preview.innerHTML = "";
    preview.innerHTML = htmlContent;

    // Opsi download
    let blob = new Blob([htmlContent], { type: "text/html" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slug}.html`;
    link.className = "download-btn";
    link.innerText = "Download Postingan HTML";
    preview.appendChild(link);
}

// Fungsi untuk konversi teks menjadi HTML terstruktur (dari konvert.html)
function convertToStructuredHTML(text) {
    let lines = text.split("\n");
    let htmlOutput = "";
    let inUl = false, inOl = false, inCodeBlock = false;

    lines.forEach((line, index) => {
        line = line.trim();

        // Code Block (``` di awal dan akhir)
        if (line.startsWith("```")) {
            if (inCodeBlock) {
                htmlOutput += "</code></pre>\n";
            } else {
                htmlOutput += "<pre><code>\n";
            }
            inCodeBlock = !inCodeBlock;
            return;
        }

        if (inCodeBlock) {
            htmlOutput += sanitizeInput(line) + "\n";
            return;
        }

        // Judul utama (baris pertama atau # di awal)
        if (line.startsWith("#") && !line.startsWith("##")) {
            htmlOutput += `<h1>${sanitizeInput(line.replace(/^#\s*/, ''))}</h1>\n`;
        } 
        // Subjudul (## di awal)
        else if (line.startsWith("##")) {
            htmlOutput += `<h2>${sanitizeInput(line.replace(/^##\s*/, ''))}</h2>\n`;
        } 
        // Blockquote (> di awal)
        else if (line.startsWith(">")) {
            htmlOutput += `<blockquote>${sanitizeInput(line.replace(/^>\s*/, ''))}</blockquote>\n`;
        } 
        // Ordered List (1. di awal)
        else if (/^\d+\.\s/.test(line)) {
            if (!inOl) {
                htmlOutput += "<ol>\n"; // Mulai Ordered List
                inOl = true;
            }
            htmlOutput += `<li>${sanitizeInput(line.replace(/^\d+\.\s*/, ''))}</li>\n`;
        }
        // Unordered List (- di awal)
        else if (line.startsWith("- ")) {
            if (!inUl) {
                htmlOutput += "<ul>\n"; // Mulai Unordered List
                inUl = true;
            }
            htmlOutput += `<li>${sanitizeInput(line.replace(/^- /, ''))}</li>\n`;
        } 
        // Baris kosong (untuk memisahkan paragraf)
        else if (line === "") {
            if (inUl) {
                htmlOutput += "</ul>\n"; // Tutup Unordered List
                inUl = false;
            }
            if (inOl) {
                htmlOutput += "</ol>\n"; // Tutup Ordered List
                inOl = false;
            }
            htmlOutput += "\n";
        }
        // Paragraf biasa
        else {
            if (inUl) {
                htmlOutput += "</ul>\n"; // Tutup Unordered List
                inUl = false;
            }
            if (inOl) {
                htmlOutput += "</ol>\n"; // Tutup Ordered List
                inOl = false;
            }
            htmlOutput += `<p>${sanitizeInput(line)}</p>\n`;
        }
    });

    // Pastikan daftar ditutup jika akhir teks masih dalam <ul> atau <ol>
    if (inUl) htmlOutput += "</ul>\n";
    if (inOl) htmlOutput += "</ol>\n";

    // Ganti format teks inline
    htmlOutput = htmlOutput
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")  // Bold
        .replace(/\*(.*?)\*/g, "<em>$1</em>")  // Italic
        .replace(/__(.*?)__/g, "<u>$1</u>")  // Underline
        .replace(/~~(.*?)~~/g, "<s>$1</s>")  // Strikethrough
        .replace(/`([^`]+)`/g, "<code>$1</code>")  // Inline Code
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')  // Link
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;">'); // Gambar

    return htmlOutput;
}

// Fungsi bantuan
function createSlug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function formatDate(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
