document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");

    if (menuToggle && navMenu) {
        menuToggle.onclick = function () {
            navMenu.classList.toggle("active");
        };
    }

    // Dropdown Menu
    const dropdown = document.querySelector(".dropdown");
    if (dropdown) {
        dropdown.onclick = function () {
            this.classList.toggle("active");
        };
    }
});
