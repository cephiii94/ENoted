// /etc/chatbot/c-gemini/chat.js

import { db, auth } from '../../../js/firestore.js';
// [PERBAIKAN] Impor fungsi yang diperlukan untuk login dan logout
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

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

    // --- [PERBAIKAN] Ambil Elemen UI Login/Profil dengan ID yang Benar ---
    const loginView = document.getElementById('login-view');
    const profileView = document.getElementById('profile-view');
    const userInfoSidebar = document.getElementById('userInfoSidebar');
    const loginFormSidebar = document.getElementById('loginFormSidebar');
    const logoutButtonSidebar = document.getElementById('logoutButtonSidebar');
    const loginErrorSidebar = document.getElementById('loginErrorSidebar');
    
    // --- Variabel State Aplikasi ---
    let genAI;
    let generativeModel;
    let currentUser = null;
    let userApiKeys = [];
    let activeApiKey = null;

    // --- [PERBAIKAN] Fungsi untuk Mengelola Tampilan Login/Profil ---
    /**
     * Memperbarui tampilan UI di sidebar berdasarkan status login pengguna.
     * @param {object|null} user Objek pengguna dari Firebase Auth.
     */
    function updateAuthUI(user) {
        // Pastikan elemen ada sebelum dimanipulasi
        if (!loginView || !profileView || !userInfoSidebar) return;

        if (user) {
            // Jika pengguna login:
            loginView.style.display = 'none'; // Sembunyikan form login
            profileView.style.display = 'flex'; // Tampilkan bagian profil
            // Tampilkan info user (gunakan email jika display name tidak ada)
            userInfoSidebar.textContent = user.displayName || user.email; 
        } else {
            // Jika pengguna logout:
            loginView.style.display = 'flex'; // Tampilkan kembali form login
            profileView.style.display = 'none'; // Sembunyikan bagian profil
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

    onAuthStateChanged(auth, async (user) => {
        // [PERBAIKAN] Sekarang fungsi ini akan bekerja dengan benar
        updateAuthUI(user); 

        if (user) {
            currentUser = user;
            await loadApiKeysFromFirestore();
        } else {
            currentUser = null;
            userApiKeys = [];
            activeApiKey = null;
            generativeModel = null;
            updateKeySelector();
            setAiStatus('offline', 'Silakan Login');
            toggleInputs(true);
            if (messagesContainer) messagesContainer.innerHTML = ''; // Kosongkan chat saat logout
        }
    });
    
    const toggleInputs = (disabled) => {
        if(messageInput) messageInput.disabled = disabled;
        if(sendMessageBtn) sendMessageBtn.disabled = disabled;
    };

    const initializeGemini = (key) => {
        if (!key) {
            setAiStatus('error', 'Kunci API tidak valid');
            generativeModel = null;
            return;
        }
        try {
            genAI = new GoogleGenerativeAI(key);
            generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            setAiStatus('online', 'Siap Menerima Perintah');
            toggleInputs(false);
        } catch (error) {
            setAiStatus('error', 'Inisialisasi Gagal');
            generativeModel = null;
            toggleInputs(true);
        }
    };

    const loadApiKeysFromFirestore = async () => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().apiKeys) {
                userApiKeys = docSnap.data().apiKeys || [];
                activeApiKey = docSnap.data().activeApiKey || (userApiKeys.length > 0 ? userApiKeys[0].key : null);
            } else {
                userApiKeys = [];
                activeApiKey = null;
            }
            updateKeySelector();
            initializeGemini(activeApiKey);
        } catch (error) {
            setAiStatus('error', 'Gagal Memuat Kunci');
        }
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

        try {
            const result = await generativeModel.generateContent(message);
            const response = await result.response;
            addMessage(response.text(), 'ai');
        } catch (error) {
            addMessage(`Maaf, terjadi kesalahan: ${error.message}.`, 'ai');
        } finally {
            toggleInputs(false);
            messageInput.focus();
        }
    };
    
    // --- Event Listeners ---
    
    // [TAMBAHAN] Event Listener untuk Form Login
    if (loginFormSidebar) {
        loginFormSidebar.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmailSidebar').value;
            const password = document.getElementById('loginPasswordSidebar').value;
            
            if (loginErrorSidebar) loginErrorSidebar.textContent = '';

            signInWithEmailAndPassword(auth, email, password)
                .catch((error) => {
                    console.error("Login failed:", error);
                    if (loginErrorSidebar) loginErrorSidebar.textContent = "Email atau password salah.";
                });
        });
    }

    // [TAMBAHAN] Event Listener untuk Tombol Logout
    if (logoutButtonSidebar) {
        logoutButtonSidebar.addEventListener('click', () => {
            signOut(auth).catch(console.error);
        });
    }
    
    if (apiKeySelector) {
        apiKeySelector.addEventListener('change', async (e) => {
            const selectedKey = e.target.value;
            if (selectedKey && currentUser) {
                activeApiKey = selectedKey;
                const userDocRef = doc(db, 'users', currentUser.uid);
                await setDoc(userDocRef, { activeApiKey: selectedKey }, { merge: true });
                initializeGemini(selectedKey);
            }
        });
    }

    if (apiKeyListContainer) {
        apiKeyListContainer.addEventListener('click', async (e) => {
            if (e.target.closest('.delete-key-btn')) {
                const keyToDelete = e.target.closest('.delete-key-btn').dataset.key;
                const keyObject = userApiKeys.find(k => k.key === keyToDelete);
                if (!keyObject || !confirm(`Yakin ingin menghapus kunci "${keyObject.name}"?`)) return;

                const userDocRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userDocRef, { apiKeys: arrayRemove(keyObject) });
                
                if (activeApiKey === keyToDelete) {
                    const newActiveKey = (userApiKeys.filter(k => k.key !== keyToDelete)[0] || {}).key || null;
                    await setDoc(userDocRef, { activeApiKey: newActiveKey }, { merge: true });
                }
                await loadApiKeysFromFirestore();
            }
        });
    }

    if (addKeyForm) {
        addKeyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const keyName = e.target.elements.keyNameInput.value.trim();
            const keyValue = e.target.elements.keyValueInput.value.trim();

            if (keyName && keyValue && currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const newKey = { name: keyName, key: keyValue };
                
                await updateDoc(userDocRef, { apiKeys: arrayUnion(newKey) }).catch(err => {
                    if (err.code === 'not-found') setDoc(userDocRef, { apiKeys: [newKey] });
                });

                if (!activeApiKey) {
                    await setDoc(userDocRef, { activeApiKey: keyValue }, { merge: true });
                }
                addKeyForm.reset();
                await loadApiKeysFromFirestore();
            }
        });
    }

    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
    if (messageInput) messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    if (manageKeysBtn) manageKeysBtn.addEventListener('click', () => apiKeyModal.style.display = 'flex');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => apiKeyModal.style.display = 'none');
    
    toggleInputs(true);
});