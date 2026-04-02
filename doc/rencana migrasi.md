# Rencana Migrasi ENoted (Versi Baru)

Berdasarkan analisis proyek **ENoted** versi lama (HTML/JS statis), berikut adalah rencana migrasi ke arsitektur modern.

## 1. Rekomendasi Teknologi
- **Framework**: [Next.js](https://nextjs.org/) (App Router) + TypeScript.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan tema **Softblue Glassmorphism**.
- **Backend**: Firebase Cloud Firestore & Auth (tetap digunakan namun dengan SDK modern).
- **Hosting**: Vercel (sangat direkomendasikan untuk Next.js).

## 2. Struktur Proyek Baru (`new-version/`)
```text
new-version/
├── app/                  # Route & Page (Next.js App Router)
│   ├── (admin)/          # Group route untuk dashboard admin
│   ├── blog/             # Detail postingan [slug]
│   └── layout.tsx        # Global layout dengan tema softblue
├── components/           # UI Komponen (Navbar, Card, Footer)
├── lib/                  # Firebase config & utility functions
├── public/               # Asset (img, icons)
├── styles/               # Tailwind global CSS
└── tailwind.config.ts    # Custom theme "softblue"
```

## 3. Tahapan Implementasi

### Tahap 1: Persiapan Project
- Inisialisasi Next.js dengan Tailwind CSS.
- Konfigurasi warna `softblue` dan `glassmorphism` di `tailwind.config.ts`.
- Setup environment variables untuk Firebase.

### Tahap 2: Komponen & Layout Dasar
- Membuat `Navbar` dan `Footer` dengan efek Glassmorphism.
- Implementasi background gradasi softblue yang elegan.
- Membuat skeleton loading untuk artikel.

### Tahap 3: Migrasi Data & Logika
- Migrasi fungsi Firestore dari `old-version/js/firestore.js` ke `lib/firebase.ts`.
- Implementasi fetching data di Server Component untuk SEO optimal.
- Migrasi sistem autentikasi admin.

### Tahap 4: Halaman Utama & Detail
- Menampilkan daftar artikel dengan kategori filter (Koding, Tutorial, Islam).
- Membuat template artikel yang bersih, responsif, dan mudah dibaca.

### Tahap 5: Dashboard Admin
- Re-build dashboard admin untuk manajemen konten (tambah/edit/hapus post).
- Integrasi editor Markdown atau Rich Text yang lebih modern.

## 4. Keunggulan Versi Baru
- **SEO Ready**: Pengaturan metadata dinamis untuk setiap artikel.
- **Performance**: Load time lebih cepat karena optimasi gambar dan script bawaan Next.js.
- **Maintainability**: Kode lebih terstruktur dengan komponen React dan tipe data TypeScript.
- **Visual Premium**: Menggunakan standar desain modern (Softblue + Glassmorphism).
