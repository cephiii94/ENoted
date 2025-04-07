        // Menyimpan URL postingan saat ini
        let currentPostUrl = '';

        /**
 * Membuka posting dalam iframe atau navigasi langsung di perangkat mobile
 * @param {string} url - URL posting yang akan dibuka
 */
function openPost(url) {
    // Validasi URL untuk mencegah masalah keamanan
    if (!url || typeof url !== 'string' || !url.match(/^[a-zA-Z0-9\/\-_.]+\.html$/)) {
        console.error('URL tidak valid:', url);
        return;
    }

    currentPostUrl = url; // Simpan URL untuk digunakan oleh tombol Full View


    // Cek ukuran layar untuk menentukan metode tampilan
    if (window.innerWidth > 600) {
        try {
            var iframe = document.getElementById('postFrame');
            if (!iframe) {
                console.error('Element iframe tidak ditemukan');
                return;
            }

            iframe.src = url;
            var detailContainer = document.getElementById('detailContainer');
            if (detailContainer) {
                detailContainer.style.display = 'block';

                // Tambahkan event listener untuk saat iframe dimuat
                iframe.onload = function () {
                    try {
                        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                        // Sembunyikan tombol dalam iframe dengan CSS untuk efisiensi
                        var style = iframeDoc.createElement('style');
                        style.textContent = '.back-btn, .share-btn, #backButton, #shareButton { display: none !important; }';
                        iframeDoc.head.appendChild(style);
                    } catch (e) {
                        console.warn("Tidak dapat memodifikasi iframe karena pembatasan cross-origin:", e.message);
                    }
                };

                // Tampilkan dengan animasi
                setTimeout(() => {
                    detailContainer.classList.add('show');
                }, 10);
            }
        } catch (error) {
            console.error('Error saat membuka post:', error);
            // Fallback ke navigasi langsung jika terjadi error
            window.location.href = url;
        }
    } else {
        // Redirect langsung untuk perangkat mobile
        window.location.href = url;
    }
}
       
       /**
        * Menutup iframe posting
        */
       function closePost() {
           try {
               let container = document.getElementById('detailContainer');
               if (!container) return;
               
               container.classList.add('hide');
               container.classList.remove('show');
               
               setTimeout(() => {
                   container.classList.remove('hide');
                   container.style.display = 'none';
                   
                   var iframe = document.getElementById('postFrame');
                   if (iframe) iframe.src = "";
                   
                   currentPostUrl = '';
               }, 300);
           } catch (error) {
               console.error('Error saat menutup post:', error);
           }
       }
       
       /**
        * Membuka posting dalam tab baru (full view)
        */
       function openFullView() {
           if (currentPostUrl) {
               window.open(currentPostUrl, '_blank');
           } else {
               console.warn('Tidak ada URL posting yang tersimpan');
           }
       }
       
       /**
        * Navigasi kembali ke halaman utama
        */
       function goBack() {
           window.location.href = window.location.origin + "/index.html";
       }
       
       /**
        * Deteksi apakah halaman berada dalam iframe
        * @returns {boolean} - true jika berada dalam iframe
        */
       function checkIfIframe() {
           try {
               return window.self !== window.top;
           } catch (e) {
               return true;
           }
       }
       
       /**
        * Deteksi perangkat mobile
        * @returns {boolean} - true jika menggunakan perangkat mobile
        */
       function isMobileDevice() {
           return (typeof window.orientation !== "undefined") || 
                  (navigator.userAgent.indexOf('IEMobile') !== -1) ||
                  (window.innerWidth <= 600);
       }
       
       /**
        * Fungsi berbagi via WhatsApp
        */
       function shareViaWhatsApp() {
           var url = encodeURIComponent(window.location.href);
           var text = encodeURIComponent(document.title || "Manfaat Sedekah: Keajaiban Berbagi dalam Kehidupan");
           window.open('https://api.whatsapp.com/send?text=' + text + ' ' + url, '_blank');
       }
       
       /**
        * Fungsi berbagi via Facebook
        */
       function shareViaFacebook() {
           var url = encodeURIComponent(window.location.href);
           window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank');
       }
       
       /**
        * Fungsi berbagi via Telegram
        */
       function shareViaTelegram() {
           var url = encodeURIComponent(window.location.href);
           var text = encodeURIComponent(document.title || "Manfaat Sedekah: Keajaiban Berbagi dalam Kehidupan");
           window.open('https://t.me/share/url?url=' + url + '&text=' + text, '_blank');
       }
       
       /**
        * Fungsi untuk menyalin link artikel
        */
       function copyLink() {
           try {
               var dummy = document.createElement("textarea");
               document.body.appendChild(dummy);
               dummy.value = window.location.href;
               dummy.select();
               document.execCommand("copy");
               document.body.removeChild(dummy);
               alert("Link telah disalin!");
           } catch (error) {
               console.error('Error saat menyalin link:', error);
               alert("Gagal menyalin link. Silakan coba lagi.");
           }
       }
       
       // Event listeners
       document.addEventListener('DOMContentLoaded', function() {
           // Event untuk tombol share
           var shareButton = document.getElementById('shareButton');
           if (shareButton) {
               shareButton.addEventListener('click', function(event) {
                   event.preventDefault();
                   var shareMenu = document.getElementById('shareMenu');
                   if (shareMenu) {
                       if (shareMenu.style.display === 'block') {
                           shareMenu.style.display = 'none';
                       } else {
                           shareMenu.style.display = 'block';
                       }
                   }
               });
           }
           
           // Sembunyikan menu share saat klik di luar menu
           document.addEventListener('click', function(event) {
               var shareMenu = document.getElementById('shareMenu');
               var shareButton = document.getElementById('shareButton');
               
               if (shareMenu && shareButton && 
                   !shareButton.contains(event.target) && 
                   !shareMenu.contains(event.target)) {
                   shareMenu.style.display = 'none';
               }
           });
           
           // Cek visibilitas tombol back dan share
           var backButton = document.getElementById('backButton');
           var shareButton = document.getElementById('shareButton');
           
           if (backButton && shareButton) {
               // Jika dalam iframe DAN bukan perangkat mobile, sembunyikan tombol
               if (checkIfIframe() && !isMobileDevice()) {
                   backButton.style.display = "none";
                   shareButton.style.display = "none";
               } else {
                   backButton.style.display = "block";
                   shareButton.style.display = "block";
               }
           }
       });


