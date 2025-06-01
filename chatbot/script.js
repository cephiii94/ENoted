// Global Variables
let puterInitialized = false;
let currentTheme = 'light';
let isRecording = false;
let selectedFile = null;
let activeFeature = 'chat';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializePuter();
    updateWelcomeTime();
    loadTheme();
    setupAutoResize();
});

// Puter.js Integration
async function initializePuter() {
    try {
        console.log('Initializing Puter...');
        
        // Initialize Puter
        await puter.init();
        
        puterInitialized = true;
        updatePuterStatus(true);
        
        console.log('Puter initialized successfully');
        
        // Test Puter functionality
        await testPuterFeatures();
        
    } catch (error) {
        console.error('Failed to initialize Puter:', error);
        updatePuterStatus(false);
    }
}

function updatePuterStatus(connected) {
    const statusElement = document.getElementById('puterStatus');
    if (statusElement) {
        if (connected) {
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: var(--primary-color);"></i> Puter Terhubung';
            statusElement.classList.add('puter-connected');
        } else {
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #ef4444;"></i> Puter Terputus';
            statusElement.classList.remove('puter-connected');
        }
    }
}

async function testPuterFeatures() {
    if (!puterInitialized) return;
    
    try {
        // Test file system access
        const hasFileAccess = puter.fs !== undefined;
        console.log('File system access:', hasFileAccess);
        
        // Test app launching capability
        const hasAppAccess = puter.ui !== undefined;
        console.log('App access:', hasAppAccess);
        
    } catch (error) {
        console.error('Error testing Puter features:', error);
    }
}

// Puter File System Integration
async function accessPuterFiles() {
    if (!puterInitialized) {
        addMessage('Puter belum terhubung. Silakan tunggu inisialisasi selesai.', 'ai');
        return;
    }

    try {
        // Show file picker
        const file = await puter.ui.showOpenFilePicker();
        
        if (file) {
            const fileInfo = `Berhasil mengakses file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            addMessage(fileInfo, 'ai');
            
            // Process the file based on type
            await processSelectedFile(file);
        }
    } catch (error) {
        console.error('Error accessing Puter files:', error);
        addMessage('Gagal mengakses file sistem Puter: ' + error.message, 'ai');
    }
}

async function openPuterFiles() {
    if (!puterInitialized) {
        alert('Puter belum terhubung.');
        return;
    }

    try {
        // Launch file manager
        await puter.ui.launchApp('explorer');
    } catch (error) {
        console.error('Error opening file manager:', error);
        addMessage('Gagal membuka file manager: ' + error.message, 'ai');
    }
}

async function openPuterApps() {
    if (!puterInitialized) {
        alert('Puter belum terhubung.');
        return;
    }

    try {
        // Show app launcher or available apps
        await puter.ui.launchApp('app-center');
    } catch (error) {
        console.error('Error opening apps:', error);
        addMessage('Gagal membuka aplikasi center: ' + error.message, 'ai');
    }
}

async function openPuterTerminal() {
    if (!puterInitialized) {
        alert('Puter belum terhubung.');
        return;
    }

    try {
        await puter.ui.launchApp('terminal');
    } catch (error) {
        console.error('Error opening terminal:', error);
        addMessage('Gagal membuka terminal: ' + error.message, 'ai');
    }
}

// File Processing
async function processSelectedFile(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    try {
        if (['txt', 'json', 'csv'].includes(fileExtension)) {
            const content = await file.text();
            const previewContent = content.length > 1000 ? content.substring(0, 1000) + '...' : content;
            addMessage(`Isi file ${file.name}:\n\n${previewContent}`, 'ai');
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            addMessage(`Gambar ${file.name} berhasil dimuat. Saya dapat menganalisis konten gambar jika Anda bertanya tentangnya.`, 'ai');
        } else {
            addMessage(`File ${file.name} berhasil dimuat. Saya dapat membantu menganalisis atau memproses file ini.`, 'ai');
        }
    } catch (error) {
        console.error('Error processing file:', error);
        addMessage('Gagal memproses file: ' + error.message, 'ai');
    }
}

// UI Functions
function updateWelcomeTime() {
    const timeElement = document.getElementById('welcomeTime');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('show');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

function setActiveFeature(feature, element) {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    if (element) element.classList.add('active');
    
    activeFeature = feature;
    updateQuickActions(feature);
}

function updateQuickActions(feature) {
    const quickActions = document.getElementById('quickActions');
    if (!quickActions) return;
    
    const actions = {
        'chat': [
            { icon: 'hand-wave', text: 'Sapa', message: 'Halo, apa kabar?' },
            { icon: 'question-circle', text: 'Jelaskan', message: 'Jelaskan tentang...' },
            { icon: 'lightbulb', text: 'Ide', message: 'Berikan ide tentang...' },
            { icon: 'folder', text: 'Akses File', action: 'accessPuterFiles' }
        ],
        'write': [
            { icon: 'envelope', text: 'Email', message: 'Tulis email formal untuk...' },
            { icon: 'file-text', text: 'Artikel', message: 'Tulis artikel tentang...' },
            { icon: 'edit', text: 'Edit', message: 'Edit teks ini...' },
            { icon: 'list', text: 'Ringkas', message: 'Buatkan ringkasan dari...' }
        ],
        'code': [
            { icon: 'code', text: 'Coding', message: 'Buat kode untuk...' },
            { icon: 'bug', text: 'Debug', message: 'Debug kode ini...' },
            { icon: 'cog', text: 'Optimasi', message: 'Optimasi kode ini...' },
            { icon: 'terminal', text: 'Terminal', action: 'openPuterTerminal' }
        ],
        'analyze': [
            { icon: 'chart-line', text: 'Analisis', message: 'Analisis data ini...' },
            { icon: 'table', text: 'CSV', message: 'Proses data CSV...' },
            { icon: 'chart-bar', text: 'Visualisasi', message: 'Buat visualisasi untuk...' },
            { icon: 'folder', text: 'Load Data', action: 'accessPuterFiles' }
        ],
        'image': [
            { icon: 'image', text: 'Analisis', message: 'Analisis gambar ini...' },
            { icon: 'eye', text: 'Deskripsi', message: 'Deskripsikan gambar...' },
            { icon: 'search', text: 'Deteksi', message: 'Deteksi objek dalam gambar...' },
            { icon: 'upload', text: 'Upload', action: 'uploadImage' }
        ]
    };

    const currentActions = actions[feature] || actions['chat'];
    quickActions.innerHTML = currentActions.map(action => {
        const onclick = action.action ? `${action.action}()` : `sendQuickMessage('${action.message}')`;
        return `
            <button class="quick-action" onclick="${onclick}">
                <i class="fas fa-${action.icon}"></i>${action.text}
            </button>
        `;
    }).join('');
}

function uploadImage() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.accept = 'image/*';
        fileInput.click();
    }
}

// Message Functions
function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message && !selectedFile) return;
    
    // Add user message
    if (message) {
        addMessage(message, 'user');
    }
    
    if (selectedFile) {
        addMessage(`📎 File: ${selectedFile.name}`, 'user');
        removeFile();
    }
    
    input.value = '';
    autoResize(input);
    
    // Show typing indicator and generate response
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        generateAIResponse(message);
    }, 1000 + Math.random() * 2000);
}

function sendQuickMessage(message) {
    const input = document.getElementById('messageInput');
    if (input) {
        input.value = message;
        sendMessage();
    }
}

function addMessage(content, sender) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const currentTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const avatar = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-text">
                <div>${formatMessage(content)}</div>
                <div class="message-time">${currentTime}</div>
            </div>
        </div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function formatMessage(content) {
    // Convert newlines to <br> and format code blocks
    return content
        .replace(/\n/g, '<br>')
        .replace(/`([^`]+)`/g, '<code style="background: var(--bg-color); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
}

function generateAIResponse(userMessage) {
    if (!userMessage) userMessage = '';
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    // Context-aware responses based on active feature
    if (activeFeature === 'code') {
        response = generateCodeResponse(lowerMessage);
    } else if (activeFeature === 'write') {
        response = generateWriteResponse(lowerMessage);
    } else if (activeFeature === 'analyze') {
        response = generateAnalyzeResponse(lowerMessage);
    } else if (activeFeature === 'image') {
        response = generateImageResponse(lowerMessage);
    } else {
        response = generateGeneralResponse(lowerMessage);
    }

    // Add Puter integration context
    if (puterInitialized && (lowerMessage.includes('file') || lowerMessage.includes('buka') || lowerMessage.includes('akses'))) {
        response += '\n\n💡 *Tip: Saya dapat mengakses file system Puter untuk membantu Anda bekerja dengan file dan aplikasi.*';
    }

    addMessage(response, 'ai');
}

function generateCodeResponse(message) {
    if (message.includes('javascript') || message.includes('js')) {
        return 'Saya siap membantu dengan JavaScript! Apakah Anda ingin:\n\n• Membuat fungsi atau komponen\n• Debug kode yang error\n• Optimasi performa\n• Belajar konsep JS tertentu\n\nSilakan share kode Anda atau jelaskan apa yang ingin dibuat.';
    } else if (message.includes('python')) {
        return 'Python adalah bahasa yang powerful! Saya bisa membantu dengan:\n\n• Data analysis dengan pandas\n• Web development dengan Flask/Django\n• Machine learning dengan scikit-learn\n• Automation scripts\n\nApa yang ingin Anda kerjakan?';
    } else if (message.includes('html') || message.includes('css')) {
        return 'Untuk frontend development, saya bisa membantu:\n\n• Struktur HTML yang semantic\n• Styling CSS yang responsive\n• Animasi dan transitions\n• Layout dengan Flexbox/Grid\n\nBagikan design atau requirement Anda!';
    } else if (message.includes('react') || message.includes('vue')) {
        return 'Framework modern! Saya bisa membantu dengan:\n\n• Component architecture\n• State management\n• Hooks dan lifecycle\n• Performance optimization\n\nProyek apa yang sedang dikerjakan?';
    }
    return 'Saya siap membantu coding! Bahasa pemrograman apa yang ingin Anda gunakan? Atau ada kode yang perlu di-review?';
}

function generateWriteResponse(message) {
    if (message.includes('email')) {
        return 'Saya siap membantu menulis email! Untuk hasil terbaik, beri tahu saya:\n\n• Siapa penerima email\n• Tujuan/konteks email\n• Tone yang diinginkan (formal/informal)\n• Poin-poin utama yang ingin disampaikan\n\nContoh: "Email formal ke client tentang update project"';
    } else if (message.includes('artikel') || message.includes('blog')) {
        return 'Saya bisa membantu menulis artikel yang engaging! Mari tentukan:\n\n• Topik dan target audience\n• Gaya penulisan (formal, casual, teknis)\n• Panjang artikel yang diinginkan\n• Keyword atau SEO focus\n\nApakah ada outline yang sudah Anda siapkan?';
    } else if (message.includes('surat')) {
        return 'Untuk penulisan surat, saya perlu informasi:\n\n• Jenis surat (lamaran, komplain, undangan, dll)\n• Penerima surat\n• Tujuan utama\n• Formalitas yang diperlukan\n\nSaya akan buatkan draft yang sesuai!';
    } else if (message.includes('ringkasan') || message.includes('summary')) {
        return 'Saya bisa membuat ringkasan yang efektif! Silakan:\n\n• Share teks/dokumen yang ingin diringkas\n• Tentukan panjang ringkasan yang diinginkan\n• Sebutkan poin-poin penting yang harus dipertahankan\n\nAtau upload file melalui Puter untuk diproses!';
    }
    return 'Saya siap membantu menulis! Apa yang ingin Anda buat? Email, artikel, surat, atau dokumen lainnya?';
}

function generateAnalyzeResponse(message) {
    if (message.includes('data') || message.includes('csv')) {
        return 'Untuk analisis data, saya bisa membantu:\n\n• Exploratory Data Analysis (EDA)\n• Statistical summary dan insights\n• Data visualization suggestions\n• Pattern recognition\n\nUpload file CSV/Excel melalui Puter atau paste data Anda di sini!';
    } else if (message.includes('chart') || message.includes('grafik')) {
        return 'Saya bisa merekomendasikan visualisasi terbaik:\n\n• Bar chart untuk perbandingan\n• Line chart untuk trend waktu\n• Pie chart untuk proporsi\n• Scatter plot untuk korelasi\n\nShare data Anda dan saya akan suggest chart yang tepat!';
    } else if (message.includes('excel') || message.includes('spreadsheet')) {
        return 'Untuk analisis spreadsheet:\n\n• Formula dan fungsi Excel\n• Pivot tables dan summary\n• Data cleaning tips\n• Conditional formatting\n\nUpload file Excel Anda melalui Puter file manager!';
    }
    return 'Saya siap menganalisis data Anda! Upload file atau jelaskan jenis analisis yang dibutuhkan.';
}

function generateImageResponse(message) {
    if (message.includes('analisis') || message.includes('analyze')) {
        return 'Untuk analisis gambar, saya bisa:\n\n• Mendeskripsikan konten visual\n• Mengidentifikasi objek dan elemen\n• Menganalisis komposisi dan warna\n• Memberikan insight tentang context\n\nUpload gambar melalui tombol attachment atau Puter file manager!';
    } else if (message.includes('edit') || message.includes('modify')) {
        return 'Untuk editing gambar, saya bisa memberikan panduan:\n\n• Software recommendation (Photoshop, GIMP, dll)\n• Step-by-step editing process\n• Filter dan effect suggestions\n• Composition tips\n\nJelaskan hasil editing yang Anda inginkan!';
    }
    return 'Saya siap menganalisis gambar! Upload file gambar dan saya akan memberikan deskripsi detail serta insight yang berguna.';
}

function generateGeneralResponse(message) {
    const responses = {
        'halo': 'Halo! Senang bertemu dengan Anda. Saya terhubung dengan Puter dan siap membantu berbagai kebutuhan Anda!',
        'apa kabar': 'Saya baik dan siap bekerja! Sistem Puter juga berfungsi normal. Ada yang bisa saya bantu hari ini?',
        'terima kasih': 'Sama-sama! Senang bisa membantu. Jangan ragu untuk memanfaatkan integrasi Puter jika butuh akses file atau aplikasi.',
        'help': 'Saya bisa membantu dengan:\n\n🤖 **Chat & Konsultasi**\n✍️ **Penulisan & Editing**\n📊 **Analisis Data**\n💻 **Coding & Programming**\n🖼️ **Analisis Gambar**\n📁 **Akses Puter File System**\n🔧 **Akses Puter Applications**\n\nPilih fitur dari sidebar atau langsung tanya saja!',
        'puter': 'Puter.js memungkinkan saya mengakses file system dan aplikasi cloud Anda! Saya bisa:\n\n• Membuka dan membaca file\n• Meluncurkan aplikasi\n• Mengakses terminal\n• Mengelola dokumen\n\nCoba klik "Akses File" untuk melihat kemampuan saya!',
        'file': 'Saya bisa bekerja dengan berbagai jenis file melalui Puter:\n\n• Dokumen (PDF, Word, txt)\n• Spreadsheet (Excel, CSV)\n• Gambar (JPG, PNG, GIF)\n• Code files (JS, Python, HTML, dll)\n\nUpload file atau akses melalui Puter file manager!'
    };

    // Check for keywords
    for (let keyword in responses) {
        if (message.includes(keyword)) {
            return responses[keyword];
        }
    }

    // Default intelligent response
    return 'Terima kasih atas pertanyaannya! Saya adalah asisten AI yang terintegrasi dengan Puter.js. Saya bisa membantu dengan:\n\n• **Conversations** - Chat dan diskusi umum\n• **Writing** - Email, artikel, dokumen\n• **Analysis** - Data, spreadsheet, insights\n• **Coding** - Programming help & debugging\n• **Files** - Akses dan analisis file melalui Puter\n\nApa yang ingin Anda kerjakan bersama hari ini?';
}

// Voice Input Functions
function toggleVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');
    if (!voiceBtn) return;
    
    if (!isRecording) {
        startVoiceRecording();
        voiceBtn.classList.add('recording');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        isRecording = true;
    } else {
        stopVoiceRecording();
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        isRecording = false;
    }
}

function startVoiceRecording() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';
        
        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                }
            }
            const input = document.getElementById('messageInput');
            if (input) input.value = transcript;
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopVoiceRecording();
        };
        
        recognition.start();
        window.currentRecognition = recognition;
    } else {
        alert('Browser Anda tidak mendukung speech recognition');
        isRecording = false;
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) voiceBtn.classList.remove('recording');
    }
}

function stopVoiceRecording() {
    if (window.currentRecognition) {
        window.currentRecognition.stop();
        window.currentRecognition = null;
    }
}

// File Handling Functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        showFilePreview(file);
    }
}

function showFilePreview(file) {
    const preview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    if (preview) preview.style.display = 'flex';
}

function removeFile() {
    selectedFile = null;
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('filePreview');
    
    if (fileInput) fileInput.value = '';
    if (preview) preview.style.display = 'none';
}

// Input Handling
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function setupAutoResize() {
    const textarea = document.getElementById('messageInput');
    if (textarea) {
        textarea.addEventListener('input', () => autoResize(textarea));
    }
}

// Typing Indicator
function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.style.display = 'block';
        
        const container = document.getElementById('messagesContainer');
        if (container) container.scrollTop = container.scrollHeight;
    }
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.style.display = 'none';
}

// Theme Functions
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // Update theme icon
    const themeIcons = document.querySelectorAll('.fa-moon, .fa-sun');
    themeIcons.forEach(icon => {
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.body.setAttribute('data-theme', currentTheme);
    
    if (currentTheme === 'dark') {
        const themeIcons = document.querySelectorAll('.fa-moon');
        themeIcons.forEach(icon => {
            icon.className = 'fas fa-sun';
        });
    }
}

// Utility Functions
function startNewChat() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="message ai">
            <div class="message-content">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-text">
                    <div>Chat baru dimulai! Bagaimana saya bisa membantu Anda?</div>
                    <div class="message-time">${new Date().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
            </div>
        </div>
    `;
    closeMobileSidebar();
}

function clearAllChats() {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat chat?')) {
        startNewChat();
    }
}

function shareChat() {
    if (navigator.share) {
        navigator.share({
            title: 'Chat dengan Asisten AI',
            text: 'Lihat percakapan saya dengan asisten AI',
            url: window.location.href
        });
    } else {
        // Fallback copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link chat telah disalin ke clipboard!');
        });
    }
}

// Puter File System Extended Functions
async function saveChatToPuter() {
    if (!puterInitialized) {
        addMessage('Puter belum terhubung untuk menyimpan chat.', 'ai');
        return;
    }

    try {
        // Get all messages
        const messages = document.querySelectorAll('.message');
        let chatContent = 'Chat Export - ' + new Date().toLocaleDateString() + '\n\n';
        
        messages.forEach(msg => {
            const sender = msg.classList.contains('user') ? 'User' : 'AI';
            const textElement = msg.querySelector('.message-text div');
            const timeElement = msg.querySelector('.message-time');
            
            if (textElement && timeElement) {
                const text = textElement.textContent;
                const time = timeElement.textContent;
                chatContent += `[${time}] ${sender}: ${text}\n\n`;
            }
        });

        // Save to Puter file system
        const fileName = `chat_export_${Date.now()}.txt`;
        await puter.fs.writeFile(fileName, chatContent);
        
        addMessage(`Chat berhasil disimpan sebagai ${fileName} di Puter file system!`, 'ai');
    } catch (error) {
        console.error('Error saving chat:', error);
        addMessage('Gagal menyimpan chat: ' + error.message, 'ai');
    }
}

async function loadChatFromPuter() {
    if (!puterInitialized) {
        addMessage('Puter belum terhubung untuk memuat chat.', 'ai');
        return;
    }

    try {
        const file = await puter.ui.showOpenFilePicker({
            accept: '.txt,.json'
        });

        if (file) {
            const content = await file.text();
            addMessage(`Chat dari file ${file.name} berhasil dimuat:\n\n${content.substring(0, 500)}...`, 'ai');
        }
    } catch (error) {
        console.error('Error loading chat:', error);
        addMessage('Gagal memuat chat: ' + error.message, 'ai');
    }
}

// Advanced Puter Integration
async function runPuterCommand(command) {
    if (!puterInitialized) {
        addMessage('Puter belum terhubung untuk menjalankan command.', 'ai');
        return;
    }

    try {
        // Execute command through Puter terminal
        const result = await puter.terminal.exec(command);
        addMessage(`Command: ${command}\nOutput: ${result}`, 'ai');
    } catch (error) {
        console.error('Error running command:', error);
        addMessage('Gagal menjalankan command: ' + error.message, 'ai');
    }
}

// Performance Monitoring
function monitorPerformance() {
    // Monitor memory usage
    if (performance.memory) {
        const memory = performance.memory;
        console.log('Memory usage:', {
            used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
            total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
    }

    // Monitor Puter connection
    if (puterInitialized) {
        updatePuterStatus(true);
    } else {
        setTimeout(initializePuter, 5000); // Retry connection
    }
}

// Start performance monitoring
setInterval(monitorPerformance, 30000);

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}

// Enhanced DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', function() {
    // Set initial feature
    updateQuickActions('chat');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    startNewChat();
                    break;
                case 'k':
                    e.preventDefault();
                    const input = document.getElementById('messageInput');
                    if (input) input.focus();
                    break;
                case 'o':
                    e.preventDefault();
                    accessPuterFiles();
                    break;
            }
        }
    });

    // Add welcome message delay
    setTimeout(() => {
        if (puterInitialized) {
            addMessage('✅ Puter.js berhasil terhubung! Saya sekarang dapat mengakses file system dan aplikasi Anda.', 'ai');
        }
    }, 2000);
});

// Export functions for global access
window.AI_Assistant = {
    sendMessage,
    sendQuickMessage,
    toggleTheme,
    accessPuterFiles,
    saveChatToPuter,
    loadChatFromPuter,
    runPuterCommand,
    setActiveFeature
};
