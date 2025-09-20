let chats = [];
let activeChatId = null;
let currentUserId = null; // Menyimpan ID pengguna yang sedang aktif

/**
 * Menetapkan ID pengguna untuk sesi saat ini, agar riwayat chat menjadi spesifik per pengguna.
 * @param {string | null} userId - ID unik pengguna dari Firebase, atau null untuk tamu.
 */
export function setUserId(userId) {
    currentUserId = userId;
}

/**
 * Menghasilkan kunci unik untuk localStorage berdasarkan ID pengguna.
 * @returns {string} Kunci localStorage yang spesifik untuk pengguna.
 */
function getChatHistoryKey() {
    return currentUserId ? `ai_chat_history_${currentUserId}` : 'ai_chat_history_guest';
}

/**
 * Mengambil semua data chat dari localStorage untuk pengguna saat ini.
 * @returns {Array} Array berisi objek chat.
 */
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

/**
 * Menyimpan array chat saat ini ke localStorage untuk pengguna saat ini.
 */
function saveChats() {
    const CHAT_HISTORY_KEY = getChatHistoryKey();
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
}

/**
 * Menginisialisasi riwayat chat saat aplikasi dimuat.
 * @param {Function} renderCallback - Fungsi untuk me-render ulang daftar riwayat di UI.
 * @returns {Object} Sesi chat aktif pertama.
 */
export function initializeHistory(renderCallback) {
    chats = getChats();
    if (chats.length === 0) {
        // Jika tidak ada riwayat, buat chat baru
        createNewChat();
    } else {
        // Jika ada, set chat teratas (terbaru) sebagai yang aktif
        activeChatId = chats[0].id;
    }
    renderCallback();
    return getActiveChat();
}

/**
 * Membuat sesi chat baru dan menyimpannya.
 * @returns {Object} Objek chat baru yang telah dibuat.
 */
export function createNewChat() {
    const newChat = {
        id: Date.now().toString(),
        title: 'Chat Baru',
        messages: []
    };
    chats.unshift(newChat); // Tambahkan ke awal array agar muncul paling atas
    activeChatId = newChat.id;
    saveChats();
    return newChat;
}

/**
 * Mendapatkan objek chat yang sedang aktif.
 * @returns {Object|null} Objek chat aktif atau null jika tidak ditemukan.
 */
export function getActiveChat() {
    return chats.find(chat => chat.id === activeChatId) || null;
}

/**
 * Menyimpan pesan baru ke dalam sesi chat yang aktif.
 * @param {string} sender - Pengirim pesan ('user' atau 'ai').
 * @param {string} content - Isi pesan.
 */
export function saveMessageToHistory(sender, content) {
    const activeChat = getActiveChat();
    if (!activeChat) return;

    activeChat.messages.push({ sender, content });

    // Perbarui judul chat jika ini adalah pesan pertama dari pengguna
    if (activeChat.messages.length === 1 && sender === 'user') {
        activeChat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    saveChats();
}

/**
 * Mengatur chat yang aktif berdasarkan ID.
 * @param {string} chatId - ID dari chat yang ingin diaktifkan.
 * @returns {Object} Objek chat yang dipilih.
 */
export function loadChat(chatId) {
    activeChatId = chatId;
    return getActiveChat();
}

/**
 * Menghapus chat berdasarkan ID.
 * @param {string} chatId - ID dari chat yang akan dihapus.
 * @param {Function} renderCallback - Fungsi untuk me-render ulang daftar riwayat.
 * @returns {Object} Sesi chat aktif yang baru setelah penghapusan.
 */
export function deleteChat(chatId, renderCallback) {
    chats = chats.filter(chat => chat.id !== chatId);

    // Jika yang dihapus adalah chat aktif, pindah ke chat lain atau buat baru
    if (activeChatId === chatId) {
        if (chats.length > 0) {
            activeChatId = chats[0].id; // Pindah ke chat teratas
        } else {
            createNewChat(); // Buat baru jika semua sudah dihapus
        }
    }
    
    saveChats();
    renderCallback();
    return getActiveChat();
}

/**
 * Menampilkan dialog konfirmasi kustom untuk penghapusan.
 * @param {string} title - Judul chat yang akan dihapus.
 * @param {Function} onConfirm - Callback yang akan dieksekusi jika pengguna menekan 'Ya'.
 */
function showDeleteConfirmation(title, onConfirm) {
    const modal = document.getElementById('deleteConfirmModal');
    const confirmText = document.getElementById('deleteConfirmText');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');

    if (!modal || !confirmText || !confirmBtn || !cancelBtn) return;

    confirmText.innerHTML = `Yakin ingin menghapus chat <br><strong>"${title}"</strong>?`;
    modal.style.display = 'flex';

    // Penting: Hapus listener lama sebelum menambahkan yang baru untuk menghindari panggilan ganda
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


/**
 * Me-render daftar riwayat chat ke elemen kontainer di UI.
 * @param {HTMLElement} container - Elemen div untuk menampung daftar riwayat.
 * @param {Function} loadChatCallback - Fungsi yang dipanggil saat item riwayat diklik.
 */
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
            e.stopPropagation(); // Mencegah event klik item terpanggil
            
            // Menggunakan modal konfirmasi kustom
            showDeleteConfirmation(chat.title, () => {
                const newActiveChat = deleteChat(chat.id, () => renderHistoryList(container, loadChatCallback));
                loadChatCallback(newActiveChat);
            });
        };
        item.appendChild(deleteBtn);

        item.onclick = () => {
             const selectedChat = loadChat(chat.id);
             loadChatCallback(selectedChat);
             renderHistoryList(container, loadChatCallback); // Render ulang untuk update status 'active'
        };
        
        container.appendChild(item);
    });
}

