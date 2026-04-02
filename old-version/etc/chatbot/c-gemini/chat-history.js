let chats = [];
let activeChatId = null;
let currentUserId = null;

export function setUserId(userId) {
    currentUserId = userId;
}

function getChatHistoryKey() {
    return currentUserId ? `ai_chat_history_${currentUserId}` : 'ai_chat_history_guest';
}

function getChats() {
    const CHAT_HISTORY_KEY = getChatHistoryKey();
    const storedChats = localStorage.getItem(CHAT_HISTORY_KEY);
    try {
        return storedChats ? JSON.parse(storedChats) : [];
    } catch (e) {
        console.error("Gagal mem-parsing riwayat chat:", e);
        return [];
    }
}

function saveChats() {
    const CHAT_HISTORY_KEY = getChatHistoryKey();
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
}

export function initializeHistory(renderCallback) {
    chats = getChats();
    if (chats.length === 0) {
        createNewChat();
    } else {
        activeChatId = chats[0].id;
    }
    renderCallback();
    return getActiveChat();
}

export function createNewChat() {
    const newChat = {
        id: Date.now().toString(),
        title: 'Chat Baru',
        messages: []
    };
    chats.unshift(newChat);
    activeChatId = newChat.id;
    saveChats();
    return newChat;
}

export function getActiveChat() {
    return chats.find(chat => chat.id === activeChatId) || null;
}

export function saveMessageToHistory(sender, content) {
    const activeChat = getActiveChat();
    if (!activeChat) return;

    activeChat.messages.push({ sender, content });

    if (activeChat.messages.length === 1 && sender === 'user') {
        activeChat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    saveChats();
}

export function loadChat(chatId) {
    activeChatId = chatId;
    return getActiveChat();
}

export function deleteChat(chatId, renderCallback) {
    chats = chats.filter(chat => chat.id !== chatId);

    if (activeChatId === chatId) {
        if (chats.length > 0) {
            activeChatId = chats[0].id;
        } else {
            createNewChat();
        }
    }
    
    saveChats();
    renderCallback();
    return getActiveChat();
}

function showDeleteConfirmation(title, onConfirm) {
    const modal = document.getElementById('deleteConfirmModal');
    const confirmText = document.getElementById('deleteConfirmText');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');

    if (!modal || !confirmText || !confirmBtn || !cancelBtn) return;

    confirmText.innerHTML = `Yakin ingin menghapus chat <br><strong>"${title}"</strong>?`;
    modal.style.display = 'flex';

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newConfirmBtn.onclick = () => {
        onConfirm();
        modal.style.display = 'none';
    };

    newCancelBtn.onclick = () => {
        modal.style.display = 'none';
    };
}

export function renderHistoryList(container, loadChatCallback) {
    if (!container) return;
    container.innerHTML = '';
    
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.dataset.id = chat.id;
        if (chat.id === activeChatId) {
            item.classList.add('active');
        }

        const titleSpan = document.createElement('span');
        titleSpan.textContent = chat.title;
        item.appendChild(titleSpan);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            showDeleteConfirmation(chat.title, () => {
                const newActiveChat = deleteChat(chat.id, () => renderHistoryList(container, loadChatCallback));
                loadChatCallback(newActiveChat);
            });
        };
        item.appendChild(deleteBtn);

        item.onclick = () => {
             const selectedChat = loadChat(chat.id);
             loadChatCallback(selectedChat);
             renderHistoryList(container, loadChatCallback);
        };
        
        container.appendChild(item);
    });
}