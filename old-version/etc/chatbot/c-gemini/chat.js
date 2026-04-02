import * as history from './chat-history.js';
import { db, auth } from '/js/firestore.js';
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
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistoryContainer = document.getElementById('chatHistoryContainer');
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const loginFormSidebar = document.getElementById('loginFormSidebar');
    const logoutButtonSidebar = document.getElementById('logoutButtonSidebar');
    const personalizeBtn = document.getElementById('personalizeBtn');
    const personalizeModal = document.getElementById('personalizeModal');
    const closePersonalizeModalBtn = document.getElementById('closePersonalizeModalBtn');
    const customInstructionInput = document.getElementById('customInstructionInput');
    const saveInstructionBtn = document.getElementById('saveInstructionBtn');

    // --- Variabel State Aplikasi ---
    let genAI;
    let generativeModel;
    let currentUser = null;
    let userApiKeys = [];
    let activeApiKey = null;
    let isSidebarLocked = localStorage.getItem('isSidebarLocked') === 'true';
    let currentChat = null;
    let userCustomInstruction = '';

    function loadChatIntoView(chat) {
        if (!chat) return;
        currentChat = chat;
        messagesContainer.innerHTML = '';
        chat.messages.forEach(msg => {
            addMessage(msg.content, msg.sender, false);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

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

    function addMessageWithTypingEffect(content, sender) {
        return new Promise(resolve => {
            if (!messagesContainer) {
                resolve();
                return;
            }
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            const avatar = '<i class="fas fa-robot"></i>';
            messageDiv.innerHTML = `<div class="message-avatar">${avatar}</div><div class="message-text"><div></div></div>`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            const textContainer = messageDiv.querySelector('.message-text div');
            let i = 0;
            const typingSpeed = 20;
            function type() {
                if (i < content.length) {
                    const char = content.charAt(i);
                    textContainer.innerHTML += char === '\n' ? '<br>' : char;
                    i++;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    setTimeout(type, typingSpeed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    const sendMessage = async () => {
        if (!messageInput || !generativeModel) {
            addMessage("Model AI belum siap. Pastikan kunci API valid.", 'ai');
            return;
        }
        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        history.saveMessageToHistory('user', message);
        
        const currentFullHistory = history.getActiveChat().messages;
        const formattedHistoryForAPI = currentFullHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
        
        const originalTitle = currentChat.title;
        messageInput.value = '';
        messageInput.style.height = 'auto';
        toggleInputs(true);

        try {
            const chat = generativeModel.startChat({ history: formattedHistoryForAPI.slice(0, -1) });
            const result = await chat.sendMessage(message);
            const response = await result.response;
            const responseText = response.text();

            await addMessageWithTypingEffect(responseText, 'ai');
            history.saveMessageToHistory('ai', responseText);
        } catch (error) {
            console.error("API Error:", error);
            addMessage(`Maaf, terjadi kesalahan: ${error.message}.`, 'ai');
        } finally {
            toggleInputs(false);
            messageInput.focus();
            if(currentChat.title !== originalTitle) {
                history.renderHistoryList(chatHistoryContainer, loadChatIntoView);
            }
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
            const modelConfig = { model: "gemini-1.5-flash-latest" };
            if (userCustomInstruction && userCustomInstruction.trim() !== '') {
                modelConfig.systemInstruction = {
                    role: "user",
                    parts: [{ text: userCustomInstruction }]
                };
            }
            generativeModel = genAI.getGenerativeModel(modelConfig);
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
            if (docSnap.exists()) {
                const data = docSnap.data();
                userApiKeys = data.apiKeys || [];
                activeApiKey = data.activeApiKey || (userApiKeys.length > 0 ? userApiKeys[0].key : null);
                userCustomInstruction = data.customInstruction || '';
                if(customInstructionInput) customInstructionInput.value = userCustomInstruction;
            } else {
                userApiKeys = []; activeApiKey = null; userCustomInstruction = '';
            }
            updateKeySelector();
            initializeGemini(activeApiKey);
        } catch (error) {
            setAiStatus('error', 'Gagal Memuat Kunci');
        }
    };

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

    onAuthStateChanged(auth, async (user) => {
        updateAuthUI(user);
        currentUser = user;
        history.setUserId(user ? user.uid : null);
        if (user) {
            await loadApiKeysFromFirestore();
        } else {
            userApiKeys = []; activeApiKey = null; generativeModel = null;
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
    if (logoutButtonSidebar) logoutButtonSidebar.addEventListener('click', () => signOut(auth));
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
    if(personalizeBtn) personalizeBtn.addEventListener('click', () => personalizeModal.style.display = 'flex');
    if(closePersonalizeModalBtn) closePersonalizeModalBtn.addEventListener('click', () => personalizeModal.style.display = 'none');
    if(saveInstructionBtn) {
        saveInstructionBtn.addEventListener('click', async () => {
            if (!currentUser) { alert("Anda harus login untuk menyimpan instruksi."); return; }
            const newInstruction = customInstructionInput.value;
            const userDocRef = doc(db, 'users', currentUser.uid);
            try {
                await setDoc(userDocRef, { customInstruction: newInstruction }, { merge: true });
                userCustomInstruction = newInstruction;
                alert("Instruksi berhasil disimpan!");
                personalizeModal.style.display = 'none';
                initializeGemini(activeApiKey);
            } catch (error) {
                alert("Gagal menyimpan instruksi: " + error.message);
            }
        });
    }
    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
    if (messageInput) messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
    if (manageKeysBtn) manageKeysBtn.addEventListener('click', () => apiKeyModal.style.display = 'flex');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => apiKeyModal.style.display = 'none');
    updateSidebarState();
});