# Panduan Mencegah Supabase Auto-Pause

Dokumentasi ini menjelaskan cara kerja dan langkah-langkah untuk mencegah database Supabase (paket *Free Tier*) agar tidak otomatis berhenti (*auto-pause*) karena tidak ada aktivitas selama 1 minggu.

## Konsep Dasar

Supabase Free Tier akan menghentikan database sementara (pause) jika tidak ada interaksi ke database selama 7 hari berturut-turut. Untuk menyiasatinya, project ini sudah dilengkapi dengan script "Keep Alive".

Script ini terletak di:
`src/app/api/keep-alive/route.ts`

**Cara kerja script:**
Script akan melakukan *query* sangat ringan ke database (mengambil 1 ID dari tabel `articles`). Aktivitas sekecil ini sudah cukup untuk memberitahu Supabase bahwa project sedang aktif digunakan.

## Prasyarat Environment Variables

Agar script dapat berjalan dengan baik di production (misalnya Netlify), pastikan Environment Variables berikut sudah dikonfigurasi:

- `NEXT_PUBLIC_SUPABASE_URL` : URL project Supabase Anda.
- `SUPABASE_SERVICE_ROLE_KEY` : Service key dari Supabase (digunakan agar script bisa melakukan bypass RLS dan dieksekusi secara aman di server-side).

## Langkah-langkah Otomatisasi (Menggunakan UptimeRobot)

Agar script berjalan otomatis, kita membutuhkan layanan pihak ketiga yang akan "memanggil" endpoint `/api/keep-alive` secara berkala. Berikut adalah panduan menggunakan layanan gratis **UptimeRobot**:

1. **Buat Akun:** Kunjungi [uptimerobot.com](https://uptimerobot.com/) dan daftar secara gratis.
2. **Tambah Monitor Baru:** Setelah masuk ke Dashboard, klik tombol **"+ Add New Monitor"**.
3. **Konfigurasi Monitor:**
   - **Monitor Type:** Pilih `HTTP(s)`.
   - **Friendly Name:** Masukkan nama yang mudah diingat, contoh: `Supabase Keep Alive ENoted`.
   - **URL (or IP):** Masukkan URL production website Anda yang diakhiri dengan `/api/keep-alive`.
     - *Contoh:* `https://enoted.netlify.app/api/keep-alive`
   - **Monitoring Interval:** Karena tujuan kita hanya agar database tidak *pause* dalam 1 minggu, Anda dapat mengaturnya menjadi setiap **24 jam** (versi gratis mengizinkan hingga setiap 5 menit).
   - **Alert Contacts:** Centang email Anda jika Anda ingin mendapat notifikasi saat website atau endpoint tersebut tidak bisa diakses (opsional).
4. **Simpan:** Klik tombol **"Create Monitor"** (biasanya akan muncul 2 kali, klik keduanya).

Dengan konfigurasi di atas, UptimeRobot secara konsisten akan mengirimkan permintaan ke URL website Anda. Hal ini akan memicu eksekusi script *keep-alive*, memberikan sinyal aktivitas ke database Supabase Anda, dan dengan aman mencegahnya dari status *paused*.
