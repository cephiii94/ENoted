function aturBackgroundGambar() {
    const jam = new Date().getHours();
    const body = document.body;
    const pesan = document.getElementById("pesanWaktu"); // opsional, jika ada elemen ini
  
    let gambar = '';
    let teks = '';
  
    if (jam >= 5 && jam < 12) {
      // Pagi
      gambar = '/img/pagi.jpg';
      teks = 'Selamat Pagi 🌅';
    } else if (jam >= 12 && jam < 16) {
      // Siang
      gambar = '/img/siang.jpg';
      teks = 'Selamat Siang ☀️';
    } else if (jam >= 16 && jam < 18) {
      // Sore
      gambar = '/img/sore.jpg';
      teks = 'Selamat Sore 🌇';
    } else {
      // Malam
      gambar = '/img/malam.jpg';
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
  