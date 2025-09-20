// Impor semua fungsi dari modul riwayat chat
import * as history from './chat-history.js';

// Impor dari file konfigurasi Firebase Anda
// Path telah diperbaiki sesuai permintaan
import { db, auth } from '/js/firestore.js';

// Impor fungsi-fungsi Firebase yang diperlukan
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Impor Google Generative AI SDK
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
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistoryContainer = document.getElementById('chatHistoryContainer');
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const loginFormSidebar = document.getElementById('loginFormSidebar');
    const logoutButtonSidebar = document.getElementById('logoutButtonSidebar');

    // --- Variabel State Aplikasi ---
    let genAI;
    let generativeModel;
    let currentUser = null;
    let userApiKeys = [];
    let activeApiKey = null;
    let isSidebarLocked = localStorage.getItem('isSidebarLocked') === 'true';
    let currentChat = null;

    /**
     * Memuat seluruh sesi percakapan ke dalam area chat.
     * @param {Object} chat - Objek chat dari modul riwayat.
     */
    function loadChatIntoView(chat) {
        if (!chat) return;
        currentChat = chat;
        messagesContainer.innerHTML = '';
        chat.messages.forEach(msg => {
            addMessage(msg.content, msg.sender, false);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Menambahkan satu pesan ke UI.
     */
    function addMessage(content, sender, shouldScroll = true) {
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        const avatar = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        let formattedContent = content.replace(/\n/g, '<br>');

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-text"><div>${formattedContent}</div></div>`;
        messagesContainer.appendChild(messageDiv);
        if (shouldScroll) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    /**
     * Mengirim pesan, mendapatkan balasan dari AI, dan menyimpan ke riwayat.
     */
    const sendMessage = async () => {
        if (!messageInput || !generativeModel) return;
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        history.saveMessageToHistory('user', message);
        
        const originalTitle = currentChat.title;
        messageInput.value = '';
        messageInput.style.height = 'auto';
        toggleInputs(true);

        try {
            const result = await generativeModel.generateContent(message);
            const response = await result.response;
            const responseText = response.text();

            addMessage(responseText, 'ai');
            history.saveMessageToHistory('ai', responseText);
        } catch (error) {
            const errorMessage = `Maaf, terjadi kesalahan: ${error.message}.`;
            addMessage(errorMessage, 'ai');
        } finally {
            toggleInputs(false);
            messageInput.focus();
            if(currentChat.title !== originalTitle) {
                history.renderHistoryList(chatHistoryContainer, loadChatIntoView);
            }
        }
    };

    /**
     * Memperbarui UI otentikasi berdasarkan status login pengguna.
     */
    function updateAuthUI(user) {
        const loginView = document.getElementById('login-view');
        const profileView = document.getElementById('profile-view');
        const userInfoSidebar = document.getElementById('userInfoSidebar');
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

    const setAiStatus = (status, text) => {
        if (!statusDot || !statusText) return;
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = text;
    };
    
    const toggleInputs = (disabled) => {
        if(messageInput) messageInput.disabled = disabled;
        if(sendMessageBtn) sendMessageBtn.disabled = disabled;
    };
    
    const updateSidebarState = () => {
        const hamburgerIcon = hamburgerBtn.querySelector('i');
        if (!sidebar || !hamburgerIcon) return;
        if (isSidebarLocked) {
            sidebar.classList.add('sidebar-locked');
            hamburgerIcon.classList.replace('fa-bars', 'fa-times');
        } else {
            sidebar.classList.remove('sidebar-locked');
            hamburgerIcon.classList.replace('fa-times', 'fa-bars');
        }
    };

    const initializeGemini = (key) => {
        if (!key) {
            setAiStatus('error', 'Kunci API tidak valid');
            generativeModel = null;
            toggleInputs(true);
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

    const updateKeySelector = () => {
        if (!apiKeySelector) return;
        apiKeySelector.innerHTML = '';
        if (userApiKeys.length === 0) {
            apiKeySelector.add(new Option('Belum ada Kunci API', '', true, true));
        } else {
            userApiKeys.forEach(item => {
                const option = new Option(item.name, item.key);
                option.selected = item.key === activeApiKey;
                apiKeySelector.add(option);
            });
        }
        renderApiKeyList();
    };

    // --- Event Listeners ---
    onAuthStateChanged(auth, async (user) => {
        updateAuthUI(user);
        currentUser = user;
        history.setUserId(user ? user.uid : null);

        if (user) {
            await loadApiKeysFromFirestore();
        } else {
            userApiKeys = [];
            activeApiKey = null;
            generativeModel = null;
            updateKeySelector();
            setAiStatus('offline', 'Silakan Login');
            toggleInputs(true);
        }
        
        const initialChat = history.initializeHistory(() => history.renderHistoryList(chatHistoryContainer, loadChatIntoView));
        loadChatIntoView(initialChat);
    });

    if (loginFormSidebar) {
        loginFormSidebar.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmailSidebar').value;
            const password = document.getElementById('loginPasswordSidebar').value;
            const loginErrorSidebar = document.getElementById('loginErrorSidebar');
            if (loginErrorSidebar) loginErrorSidebar.textContent = '';
            signInWithEmailAndPassword(auth, email, password)
                .catch(err => { if (loginErrorSidebar) loginErrorSidebar.textContent = "Email atau password salah."; });
        });
    }

    if (logoutButtonSidebar) {
        logoutButtonSidebar.addEventListener('click', () => signOut(auth));
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            const newChat = history.createNewChat();
            loadChatIntoView(newChat);
            history.renderHistoryList(chatHistoryContainer, loadChatIntoView);
        });
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            isSidebarLocked = !isSidebarLocked;
            localStorage.setItem('isSidebarLocked', isSidebarLocked);
            updateSidebarState();
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
            const deleteButton = e.target.closest('.delete-key-btn');
            if (deleteButton && currentUser) {
                const keyToDelete = deleteButton.dataset.key;
                const keyObject = userApiKeys.find(k => k.key === keyToDelete);
                if (keyObject && confirm(`Yakin menghapus kunci "${keyObject.name}"?`)) {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    await updateDoc(userDocRef, { apiKeys: arrayRemove(keyObject) });
                    if (activeApiKey === keyToDelete) {
                        const newActiveKey = (userApiKeys.filter(k => k.key !== keyToDelete)[0] || {}).key || null;
                        await setDoc(userDocRef, { activeApiKey: newActiveKey }, { merge: true });
                    }
                    await loadApiKeysFromFirestore();
                }
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
                await setDoc(userDocRef, { apiKeys: arrayUnion(newKey) }, { merge: true });
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
    
    updateSidebarState();
});

