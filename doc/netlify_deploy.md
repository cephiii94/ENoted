# Panduan Deployment Netlify untuk ENoted

Ikuti langkah-langkah berikut untuk meng-online-kan aplikasi ENoted Anda menggunakan Netlify secara gratis.

## 1. Persiapan Repositori
Pastikan kode Anda sudah di-push ke GitHub, GitLab, atau Bitbucket. Netlify akan menarik kode dari sana secara otomatis.

## 2. Menghubungkan ke Netlify
1. Buka [Netlify Dashboard](https://app.netlify.com/).
2. Klik tombol **Add new site** > **Import an existing project**.
3. Pilih penyedia Git Anda (misal: GitHub) dan pilih repositori `ENoted`.

## 3. Pengaturan Build (Otomatis)
Netlify seharusnya mendeteksi pengaturan ini secara otomatis karena adanya file `netlify.toml`:
- **Build Command:** `npm run build`
- **Publish directory:** `.next`

## 4. Konfigurasi Environment Variables (PENTING!)
Agar aplikasi bisa terhubung ke database Supabase, Anda wajib memasukkan kunci API:
1. Di Dashboard Netlify proyek Anda, buka **Site configuration** > **Environment variables**.
2. Klik **Add a variable** > **Import from .env** (atau masukkan satu per satu).
3. Masukkan variabel berikut dari file `.env.local` Anda:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> [!CAUTION]
> Jangan pernah membagikan `SUPABASE_SERVICE_ROLE_KEY` di sini atau di tempat publik mana pun.

## 5. Deployment Akhir
1. Setelah variabel tersimpan, klik **Deploy site**.
2. Tunggu proses build selesai (sekitar 2-5 menit).
3. Anda akan mendapatkan URL publik (misal: `enoted-xyz.netlify.app`).

## Tips Tambahan
- **Domain Kustom**: Anda bisa menambahkan domain sendiri di menu **Domain management**.
- **Auto-Update**: Setiap kali Anda melakukan `git push` ke cabang utama (main/master), Netlify akan otomatis melakukan build ulang dan memperbarui situs Anda.

---
*Selamat! ENoted Anda sekarang sudah online.*
