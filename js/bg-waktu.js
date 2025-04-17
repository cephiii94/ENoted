function aturBackgroundGambar() {
    const jam = new Date().getHours();
    const body = document.body;
    const pesan = document.getElementById("pesanWaktu"); // opsional, jika ada elemen ini
  
    let gambar = '';
    let teks = '';
  
    if (jam >= 5 && jam < 12) {
      // Pagi
      gambar = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=80';
      teks = 'Selamat Pagi 🌅';
    } else if (jam >= 12 && jam < 16) {
      // Siang
      gambar = 'https://images.unsplash.com/photo-1588587573470-430092b9ef8d?auto=format&fit=crop&w=1400&q=80';
      teks = 'Selamat Siang ☀️';
    } else if (jam >= 16 && jam < 18) {
      // Sore
      gambar = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1400&q=80';
      teks = 'Selamat Sore 🌇';
    } else {
      // Malam
      gambar = 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?auto=format&fit=crop&w=1400&q=80';
      teks = 'Selamat Malam 🌃';
    }
  
    body.style.backgroundImage = `url('${gambar}')`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.transition = 'background 1s ease';
  
    // Tampilkan pesan jika elemen dengan id="pesanWaktu" tersedia
    if (pesan) {
      pesan.textContent = teks;
      pesan.style.color = 'white';
      pesan.style.textShadow = '2px 2px 5px rgba(0,0,0,0.7)';
    }
  }
  
  // Jalankan saat halaman selesai dimuat
  document.addEventListener('DOMContentLoaded', aturBackgroundGambar);
  