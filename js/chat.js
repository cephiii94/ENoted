// js/chat.js
import { db, auth } from './firestore.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const apiKeySelect = document.getElementById('apiKeySelect');
    const manageApiKeysBtn = document.getElementById('manageApiKeysBtn');
    const apiKeyManagerModal = document.getElementById('apiKeyManagerModal');
    const modalOverlay = document.getElementById('mobileOverlay');
    const closeApiManagerModal = document.getElementById('closeApiManagerModal');
    const addApiKeyBtn = document.getElementById('addApiKeyBtn');
    const apiKeyListContainer = document.getElementById('apiKeyListContainer');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    // --- State Variables ---
    let genAI, generativeModel, currentUser;
    let savedApiKeys = [];
    let activeApiKey = null;

    // --- Inisialisasi Aplikasi ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            loadApiKeysFromFirestore();
            messageInput.disabled = false;
            sendMessageBtn.disabled = false;
            addMessage("Silakan pilih API Key untuk memulai percakapan.", "ai");
        } else {
            currentUser = null;
            resetChatState();
        }
    });

    // --- Logika API Key ---
    const loadApiKeysFromFirestore = async () => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            savedApiKeys = docSnap.data().apiKeys || [];
            activeApiKey = docSnap.data().activeApiKey || null;
        } else {
            // Buat dokumen baru jika belum ada
            await setDoc(userDocRef, { apiKeys: [], activeApiKey: null });
            savedApiKeys = [];
            activeApiKey = null;
        }
        updateApiKeyUI();
        initializeGemini();
    };
    
    const updateApiKeyUI = () => {
        // Perbarui dropdown
        apiKeySelect.innerHTML = '<option value="">Pilih API Key...</option>';
        savedApiKeys.forEach(key => {
            const option = new Option(key.name, key.value);
            apiKeySelect.add(option);
        });
        apiKeySelect.value = activeApiKey;

        // Perbarui daftar di modal
        apiKeyListContainer.innerHTML = '';
        if (savedApiKeys.length === 0) {
            apiKeyListContainer.innerHTML = '<div class="key-item">Belum ada API Key tersimpan.</div>';
        } else {
            savedApiKeys.forEach(key => {
                const item = document.createElement('div');
                item.className = 'key-item';
                item.innerHTML = `
                    <span class="key-name">${key.name}</span>
                    <button class="delete-key-btn" data-name="${key.name}"><i class="fas fa-trash"></i></button>
                `;
                apiKeyListContainer.appendChild(item);
            });
        }
    };
    
    const initializeGemini = () => {
        if (!activeApiKey) {
            updateStatus('offline', 'Pilih API Key');
            generativeModel = null;
            return;
        }
        try {
            genAI = new GoogleGenerativeAI(activeApiKey);
            generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            updateStatus('online', 'Online');
        } catch (error) {
            console.error("Error initializing Gemini:", error);
            updateStatus('error', 'Key Tidak Valid');
            generativeModel = null;
        }
    };
    
    const setActiveApiKey = async (keyValue) => {
        activeApiKey = keyValue;
        apiKeySelect.value = activeApiKey;
        if (currentUser) {
            await updateDoc(doc(db, 'users', currentUser.uid), { activeApiKey: keyValue });
        }
        initializeGemini();
    };

    const addApiKey = async () => {
        const nameInput = document.getElementById('newApiKeyName');
        const valueInput = document.getElementById('newApiKeyValue');
        const errorDiv = document.getElementById('apiKeyError');
        const name = nameInput.value.trim();
        const value = valueInput.value.trim();

        errorDiv.textContent = '';
        if (!name || !value) {
            errorDiv.textContent = 'Nama dan Nilai Key tidak boleh kosong.';
            return;
        }
        if (savedApiKeys.some(key => key.name === name)) {
            errorDiv.textContent = 'Nama Key tersebut sudah ada.';
            return;
        }

        savedApiKeys.push({ name, value });
        await updateDoc(doc(db, 'users', currentUser.uid), { apiKeys: savedApiKeys });
        nameInput.value = '';
        valueInput.value = '';
        updateApiKeyUI();
        if (!activeApiKey) { // Jika ini key pertama, langsung aktifkan
             setActiveApiKey(value);
        }
    };

    const deleteApiKey = async (name) => {
        savedApiKeys = savedApiKeys.filter(key => key.name !== name);
        let newActiveKey = activeApiKey;
        if (activeApiKey === savedApiKeys.find(key => key.name === name)?.value) {
            // Jika key yg aktif dihapus, pilih yg pertama atau kosongkan
            newActiveKey = savedApiKeys.length > 0 ? savedApiKeys[0].value : null;
        }
        await updateDoc(doc(db, 'users', currentUser.uid), { 
            apiKeys: savedApiKeys,
            activeApiKey: newActiveKey
        });
        activeApiKey = newActiveKey;
        updateApiKeyUI();
        initializeGemini();
    };

    // --- Logika Chat ---
    const sendMessage = async () => {
        // ... (Fungsi ini sama persis seperti jawaban saya sebelumnya, salin dari sana)
    };

    // --- UI & Utility ---
    const updateStatus = (status, text) => {
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = text;
    };
    
    const resetChatState = () => {
        currentUser = null;
        savedApiKeys = [];
        activeApiKey = null;
        generativeModel = null;
        updateApiKeyUI();
        updateStatus('offline', 'Offline');
        document.getElementById('messagesContainer').innerHTML = '<div class="message ai"><div class="message-content"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-text"><div>Silakan login untuk memulai.</div></div></div></div>';
        messageInput.disabled = true;
        sendMessageBtn.disabled = true;
    };
    
    // ... (Fungsi addMessage, handleKeyDown, dll. dari sebelumnya)

    // --- Event Listeners ---
    apiKeySelect.addEventListener('change', (e) => setActiveApiKey(e.target.value));
    manageApiKeysBtn.addEventListener('click', () => apiKeyManagerModal.style.display = 'flex');
    closeApiManagerModal.addEventListener('click', () => apiKeyManagerModal.style.display = 'none');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) apiKeyManagerModal.style.display = 'none';
    });
    addApiKeyBtn.addEventListener('click', addApiKey);
    apiKeyListContainer.addEventListener('click', (e) => {
        if (e.target.closest('.delete-key-btn')) {
            const keyName = e.target.closest('.delete-key-btn').dataset.name;
            if (confirm(`Yakin ingin menghapus key "${keyName}"?`)) {
                deleteApiKey(keyName);
            }
        }
    });

    // ... (Event listener untuk sendMessageBtn, messageInput, dll.)
});

// Sisipkan fungsi addMessage dan fungsi UI lainnya di sini

