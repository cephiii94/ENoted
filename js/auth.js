// auth.js - Script untuk manajemen autentikasi
document.addEventListener('DOMContentLoaded', function() {
    // Cek halaman mana yang sedang aktif
    const isLoginPage = document.getElementById('loginForm') !== null;
    const isRegisterPage = document.getElementById('registerForm') !== null;
    
    // Handler untuk form login
    if (isLoginPage) {
      const loginForm = document.getElementById('loginForm');
      
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember') ? document.getElementById('remember').checked : false;
        
        // Validasi data
        if (username === '') {
          showNotification('Nama pengguna tidak boleh kosong', 'error');
          return;
        }
        
        if (password === '') {
          showNotification('Kata sandi tidak boleh kosong', 'error');
          return;
        }
        
        // Simulasi pengiriman data ke server
        simulateLogin(username, password, rememberMe);
      });
    }
    
    // Handler untuk form registrasi
    if (isRegisterPage) {
      const registerForm = document.getElementById('registerForm');
      
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail') ? document.getElementById('regEmail').value.trim() : '';
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const termsAgreed = document.getElementById('terms') ? document.getElementById('terms').checked : true;
        
        // Validasi data
        if (username === '') {
          showNotification('Nama pengguna tidak boleh kosong', 'error');
          return;
        }
        
        if (document.getElementById('regEmail')) {
          if (email === '') {
            showNotification('Email tidak boleh kosong', 'error');
            return;
          }
          
          // Validasi format email sederhana
          if (!validateEmail(email)) {
            showNotification('Format email tidak valid', 'error');
            return;
          }
        }
        
        if (password === '') {
          showNotification('Kata sandi tidak boleh kosong', 'error');
          return;
        }
        
        if (password !== confirmPassword) {
          showNotification('Konfirmasi kata sandi tidak cocok', 'error');
          return;
        }
        
        if (document.getElementById('terms') && !termsAgreed) {
          showNotification('Anda harus menyetujui syarat dan ketentuan', 'error');
          return;
        }
        
        // Simulasi pengiriman data ke server
        simulateRegistration(username, email, password);
      });
    }
    
    // Fungsi-fungsi bantuan
    
    // Validasi format email
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
    
    // Simulasi login
    function simulateLogin(username, password, rememberMe) {
      // Tampilkan loading state
      showLoadingState(true);
      
      // Simulasi penundaan request ke server
      setTimeout(function() {
        // Di sini Anda akan mengirim request ke server
        // Untuk demo, kita anggap login berhasil
        
        // Simpan data user ke localStorage
        const userData = {
          username: username,
          displayName: capitalizeFirstLetter(username),
          // Mendapatkan inisial dari username
          initials: getInitials(username),
          lastLogin: new Date().toISOString(),
          isLoggedIn: true
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Simpan data ke localStorage jika remember me dicentang
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
        
        // Tampilkan notifikasi sukses
        showNotification('Login berhasil! Mengalihkan...', 'success');
        
        // Alihkan ke halaman beranda setelah login berhasil
        setTimeout(function() {
          // Redirect ke halaman beranda
          window.location.href = '/generator/index.html';
        }, 1500);
        
      }, 2000);
    }
    
    // Fungsi untuk mendapatkan inisial dari nama
    function getInitials(name) {
      if (!name) return '';
      
      // Pisahkan nama berdasarkan spasi
      const nameParts = name.split(' ');
      
      // Jika hanya satu kata, ambil 2 huruf pertama (atau 1 jika hanya ada 1 huruf)
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, Math.min(2, nameParts[0].length)).toUpperCase();
      }
      
      // Jika lebih dari satu kata, ambil huruf pertama dari kata pertama dan kedua
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    
    // Fungsi untuk mengubah huruf pertama menjadi kapital
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Simulasi registrasi
    function simulateRegistration(username, email, password) {
      // Tampilkan loading state
      showLoadingState(true);
      
      // Simulasi penundaan request ke server
      setTimeout(function() {
        // Di sini Anda akan mengirim request ke server
        // Untuk demo, kita anggap registrasi berhasil
        
        // Buat data user baru
        const userData = {
          username: username,
          displayName: capitalizeFirstLetter(username),
          initials: getInitials(username),
          email: email,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        // Simpan data user baru ke localStorage 
        // Ini hanya untuk demo, di produksi gunakan database server
        localStorage.setItem('registeredUser', JSON.stringify(userData));
        
        // Tampilkan notifikasi sukses
        showNotification('Registrasi berhasil! Mengalihkan ke halaman login...', 'success');
        
        // Alihkan ke halaman login setelah registrasi berhasil
        setTimeout(function() {
          // Redirect ke halaman login
          window.location.href = '/weblogin/formlogin.html';
        }, 2000);
        
      }, 2000);
    }
    
    // Menampilkan notifikasi
    function showNotification(message, type) {
      // Cek apakah notifikasi sudah ada
      let notification = document.querySelector('.notification');
      
      // Jika belum ada, buat elemen notifikasi
      if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '8px';
        notification.style.fontWeight = '500';
        notification.style.transition = 'all 0.3s ease';
        notification.style.zIndex = '9999';
        notification.style.transform = 'translateY(-100px)';
        document.body.appendChild(notification);
      }
      
      // Atur warna berdasarkan jenis notifikasi
      if (type === 'error') {
        notification.style.backgroundColor = '#e63946';
        notification.style.color = 'white';
      } else if (type === 'success') {
        notification.style.backgroundColor = '#2a9d8f';
        notification.style.color = 'white';
      } else {
        notification.style.backgroundColor = '#4895ef';
        notification.style.color = 'white';
      }
      
      // Atur pesan
      notification.textContent = message;
      
      // Tampilkan notifikasi
      setTimeout(() => {
        notification.style.transform = 'translateY(0)';
      }, 10);
      
      // Sembunyikan notifikasi setelah beberapa detik
      setTimeout(() => {
        notification.style.transform = 'translateY(-100px)';
        
        // Hapus notifikasi dari DOM setelah animasi selesai
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }
    
    // Menampilkan loading state
    function showLoadingState(isLoading) {
      const submitButton = isLoginPage 
        ? document.querySelector('#loginForm button[type="submit"]')
        : document.querySelector('#registerForm button[type="submit"]');
      
      if (!submitButton) return;
      
      if (isLoading) {
        const originalText = submitButton.textContent;
        submitButton.setAttribute('data-original-text', originalText);
        submitButton.textContent = 'Memproses...';
        submitButton.disabled = true;
        submitButton.style.cursor = 'not-allowed';
        submitButton.style.opacity = '0.7';
      } else {
        const originalText = submitButton.getAttribute('data-original-text');
        if (originalText) {
          submitButton.textContent = originalText;
        }
        submitButton.disabled = false;
        submitButton.style.cursor = 'pointer';
        submitButton.style.opacity = '1';
      }
    }
    
    // Cek apakah ada username yang tersimpan (untuk fitur remember me)
    if (isLoginPage && localStorage.getItem('rememberedUsername')) {
      document.getElementById('username').value = localStorage.getItem('rememberedUsername');
      if (document.getElementById('remember')) {
        document.getElementById('remember').checked = true;
      }
    }
  });