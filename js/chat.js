// js/chat.js
import { db, auth } from './firestore.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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

    // --- Variabel State Aplikasi ---
    let genAI;
    let generativeModel;
    let currentUser = null;
    let userApiKeys = [];
    let activeApiKey = null;
    
    // =================================================================================
    // SOLUSI: Fungsi-fungsi ini didefinisikan di atas agar "siap" sebelum dipanggil.
    // =================================================================================

    /**
     * Menambahkan pesan baru ke antarmuka chat.
     * @param {string} content - Isi pesan.
     * @param {string} sender - Pengirim pesan ('user' atau 'ai').
     */
    function addMessage(content, sender) {
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const avatar = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        let formattedContent = content
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">${avatar}</div>
                <div class="message-text">
                    <div>${formattedContent}</div>
                    <div class="message-time">${currentTime}</div>
                </div>
            </div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Mengatur status koneksi AI di UI.
     * @param {('offline'|'online'|'error')} status - Status koneksi.
     * @param {string} text - Pesan status.
     */
    function setAiStatus(status, text) {
        if (!statusDot || !statusText) return;
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = text;
    }
    
    // --- Logika Utama Aplikasi ---

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log("Pengguna terdeteksi:", user.email);
            setAiStatus('offline', 'Memuat Kunci...');
            await loadApiKeysFromFirestore();
        } else {
            currentUser = null;
            userApiKeys = [];
            activeApiKey = null;
            generativeModel = null;
            updateKeySelector(); // Mengosongkan selector
            setAiStatus('offline', 'Silakan Login');
            addMessage("Silakan login untuk memulai atau melanjutkan percakapan.", "ai");
            toggleInputs(true); // Nonaktifkan input
        }
    });

    // ... sisa dari kode chat.js ... (tidak perlu diubah)

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
            console.log("Gemini AI Initialized.");
        } catch (error) {
            console.error("Error initializing Gemini:", error);
            setAiStatus('error', 'Inisialisasi Gagal');
            generativeModel = null;
        }
    };

    const loadApiKeysFromFirestore = async () => {
        if (!currentUser) return;
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().apiKeys) {
                userApiKeys = docSnap.data().apiKeys;
                activeApiKey = docSnap.data().activeApiKey || (userApiKeys.length > 0 ? userApiKeys[0].key : null);
            } else {
                userApiKeys = [];
                activeApiKey = null;
            }
            updateKeySelector();
            if(activeApiKey) {
                initializeGemini(activeApiKey);
                toggleInputs(false);
            } else {
                setAiStatus('error', 'Atur Kunci API');
                toggleInputs(true);
            }
        } catch (error) {
            console.error("Error loading API keys:", error);
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
                if (item.key === activeApiKey) {
                    option.selected = true;
                }
                apiKeySelector.add(option);
            });
        }
        renderApiKeyList();
    };
    
    apiKeySelector.addEventListener('change', async (e) => {
        const selectedKey = e.target.value;
        if (selectedKey && currentUser) {
            activeApiKey = selectedKey;
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, { activeApiKey: selectedKey }, { merge: true });
            initializeGemini(selectedKey);
        }
    });

    const renderApiKeyList = () => {
        if (!apiKeyListContainer) return;
        apiKeyListContainer.innerHTML = '';
        if (userApiKeys.length > 0) {
            userApiKeys.forEach(item => {
                const keyItem = document.createElement('div');
                keyItem.className = 'key-item';
                keyItem.innerHTML = `
                    <span class="key-name">${item.name}</span>
                    <button class="delete-key-btn" data-key="${item.key}"><i class="fas fa-trash"></i></button>
                `;
                apiKeyListContainer.appendChild(keyItem);
            });
        }
    };

    apiKeyListContainer.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-key-btn')) {
            const keyToDelete = e.target.closest('.delete-key-btn').dataset.key;
            const keyNameToDelete = userApiKeys.find(k => k.key === keyToDelete).name;

            if (!confirm(`Yakin ingin menghapus kunci "${keyNameToDelete}"?`)) return;

            const userDocRef = doc(db, 'users', currentUser.uid);
            const keyObjectToDelete = { name: keyNameToDelete, key: keyToDelete };
            
            await updateDoc(userDocRef, {
                apiKeys: arrayRemove(keyObjectToDelete)
            });

            if (activeApiKey === keyToDelete) {
                const newActiveKey = userApiKeys.length > 1 ? userApiKeys.find(k => k.key !== keyToDelete).key : null;
                await setDoc(userDocRef, { activeApiKey: newActiveKey }, { merge: true });
            }
            await loadApiKeysFromFirestore();
        }
    });

    addKeyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const keyName = document.getElementById('keyNameInput').value.trim();
        const keyValue = document.getElementById('keyValueInput').value.trim();

        if (keyName && keyValue && currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const newKey = { name: keyName, key: keyValue };
            
            await updateDoc(userDocRef, {
                apiKeys: arrayUnion(newKey)
            }).catch(async (err) => {
                if (err.code === 'not-found') {
                    await setDoc(userDocRef, { apiKeys: [newKey] });
                }
            });

            if (!activeApiKey) {
                await setDoc(userDocRef, { activeApiKey: keyValue }, { merge: true });
            }

            addKeyForm.reset();
            await loadApiKeysFromFirestore();
        }
    });

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
            console.error("Error from Gemini:", error);
            addMessage(`Maaf, terjadi kesalahan: ${error.message}. Pastikan API Key Anda valid dan memiliki penagihan aktif.`, 'ai');
        } finally {
            toggleInputs(false);
            messageInput.focus();
        }
    };

    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    manageKeysBtn.addEventListener('click', () => apiKeyModal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => apiKeyModal.style.display = 'none');
    
    // Inisialisasi awal
    toggleInputs(true);
});

