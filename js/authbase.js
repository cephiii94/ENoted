// auth.js

// === LOGIN ===
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username] && users[username] === password) {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("currentUser", username);
      alert("Login berhasil!");
      window.location.href = "/generator/index.html";
    } else {
      alert("Username atau password salah!");
    }
  });
}

// === REGISTER ===
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const regUsername = document.getElementById("regUsername").value;
    const regPassword = document.getElementById("regPassword").value;

    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[regUsername]) {
      alert("Username sudah terdaftar.");
    } else {
      users[regUsername] = regPassword;
      localStorage.setItem("users", JSON.stringify(users));
      alert("Akun berhasil dibuat!");
      window.location.href = "/generator/index.html";
    }
  });
}


// Fungsi logout
function logout() {
    localStorage.removeItem("loggedIn");
    alert("Anda telah logout.");
    window.location.href = "index.html";
  }