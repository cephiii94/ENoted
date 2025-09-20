// Dummy firestore.js untuk pengembangan lokal jika diperlukan
// Pada production, file ini akan disediakan oleh environment
const db = {};
const auth = {};
// import { db, auth } from '../../../js/firestore.js';

// Impor fungsi yang diperlukan (jika menggunakan firebase)
// import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {

    // --- Ambil Elemen dari DOM ---
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const apiKeySelector = document.getElementById('apiKeySelector');
    const manageKeysBtn = document.getElementById('manageKeysBtn');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const apiKeyListContainer = document.getElementById('apiKeyListContainer');
    const addKeyForm = document.getElementById('addKeyForm');

    // --- Ambil Elemen UI Login/Profil ---
    const loginView = document.getElementById('login-view');
    const profileView = document.getElementById('profile-view');
    const userInfoSidebar = document.getElementById('userInfoSidebar');
    const loginFormSidebar = document.getElementById('loginFormSidebar');
    const logoutButtonSidebar = document.getElementById('logoutButtonSidebar');
    const loginErrorSidebar = document.getElementById('loginErrorSidebar');
    
    // --- Elemen Sidebar dan Hamburger ---
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    // --- Variabel State Aplikasi ---
    let genAI;
    let generativeModel;
    let currentUser = null;
    let userApiKeys = [];
    let activeApiKey = null;
    let isSidebarLocked = localStorage.getItem('isSidebarLocked') === 'true';

    /**
     * Memperbarui tampilan UI di sidebar berdasarkan status login pengguna.
     */
    function updateAuthUI(user) {
        if (!loginView || !profileView || !userInfoSidebar) return;

        if (user) {
            loginView.style.display = 'none';
            profileView.style.display = 'flex';
            userInfoSidebar.textContent = user.displayName || user.email; 
        } else {
            loginView.style.display = 'flex';
            profileView.style.display = 'none';
        }
    }
    
    /**
     * Menambahkan pesan baru ke antarmuka chat.
     */
    function addMessage(content, sender) {
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        const avatar = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        let formattedContent = content
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-text">
                <div>${formattedContent}</div>
            </div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Mengatur status koneksi AI di UI.
     */
    function setAiStatus(status, text) {
        if (!statusDot || !statusText) return;
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = text;
    }
    
    // --- Logika Utama Aplikasi ---

    /**
     * Memperbarui state sidebar (terbuka/tertutup) dan ikon tombol.
     */
    function updateSidebarState() {
        const hamburgerIcon = hamburgerBtn.querySelector('i');
        if (!sidebar || !hamburgerIcon) return;

        if (isSidebarLocked) {
            sidebar.classList.add('sidebar-locked');
            hamburgerIcon.classList.remove('fa-bars');
            hamburgerIcon.classList.add('fa-times');
        } else {
            sidebar.classList.remove('sidebar-locked');
            hamburgerIcon.classList.remove('fa-times');
            hamburgerIcon.classList.add('fa-bars');
        }
    }

    // Panggil saat halaman dimuat untuk set state awal
    updateSidebarState();
    
    // Contoh dummy untuk auth state change, ganti dengan onAuthStateChanged dari Firebase
    // onAuthStateChanged(auth, async (user) => {
    //     updateAuthUI(user); 
    //     // ... logika lainnya
    // });
    
    const toggleInputs = (disabled) => {
        if(messageInput) messageInput.disabled = disabled;
        if(sendMessageBtn) sendMessageBtn.disabled = disabled;
    };

    const initializeGemini = (key) => {
        // Dummy logic
        if (!key) {
            setAiStatus('error', 'Kunci API tidak valid');
            generativeModel = null;
            toggleInputs(true);
        } else {
             setAiStatus('online', 'Siap Menerima Perintah');
             toggleInputs(false);
             generativeModel = true; // Mark as initialized
        }
    };

    const loadApiKeysFromFirestore = async () => {
       // Dummy logic
       userApiKeys = [{name: 'Kunci Contoh', key: 'dummy-key-123'}];
       activeApiKey = 'dummy-key-123';
       updateKeySelector();
       initializeGemini(activeApiKey);
    };
    
    const updateKeySelector = () => {
        if (!apiKeySelector) return;
        apiKeySelector.innerHTML = '';
        if (userApiKeys.length === 0) {
            const option = new Option('Belum ada Kunci API', '');
            option.disabled = true;
            apiKeySelector.add(option);
        } else {
            userApiKeys.forEach(item => {
                const option = new Option(item.name, item.key);
                option.selected = item.key === activeApiKey;
                apiKeySelector.add(option);
            });
        }
        renderApiKeyList();
    };
    
    const renderApiKeyList = () => {
        if (!apiKeyListContainer) return;
        apiKeyListContainer.innerHTML = '';
        userApiKeys.forEach(item => {
            const keyItem = document.createElement('div');
            keyItem.className = 'key-item';
            keyItem.innerHTML = `<span class="key-name">${item.name}</span><button class="delete-key-btn" data-key="${item.key}"><i class="fas fa-trash"></i></button>`;
            apiKeyListContainer.appendChild(keyItem);
        });
    };

    const sendMessage = async () => {
        if (!messageInput || !generativeModel) return;
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        messageInput.value = '';
        messageInput.style.height = 'auto';
        toggleInputs(true);

        // Dummy AI response
        setTimeout(() => {
            addMessage(`Ini adalah balasan untuk: "${message}"`, 'ai');
            toggleInputs(false);
            messageInput.focus();
        }, 1000);
    };
    
    // --- Event Listeners ---
    
    // Event listener untuk tombol hamburger
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            isSidebarLocked = !isSidebarLocked;
            localStorage.setItem('isSidebarLocked', isSidebarLocked);
            updateSidebarState();
        });
    }
    
    if (apiKeySelector) {
        apiKeySelector.addEventListener('change', (e) => {
            initializeGemini(e.target.value);
        });
    }

    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
    if (messageInput) messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    if (manageKeysBtn) manageKeysBtn.addEventListener('click', () => apiKeyModal.style.display = 'flex');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => apiKeyModal.style.display = 'none');
    
    // Inisialisasi awal (dummy)
    setAiStatus('offline', 'Silakan Login');
    toggleInputs(true);
    loadApiKeysFromFirestore(); // Load dummy keys
});
