// js/admin/create-post-logic.js

import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db, auth } from "../firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const createPostForm = document.getElementById('createPostForm');
const responseMessage = document.getElementById('responseMessage');

let currentUser = null;
const postId = new URLSearchParams(window.location.search).get('id');

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Pengguna terautentikasi. UID:", currentUser.uid);
        if (postId) {
            fetchPostAndPopulateForm(postId);
        }
    } else {
        currentUser = null;
        window.location.href = '/admin/login.html';
    }
});

// Fungsi untuk mengambil postingan dan mengisi form
const fetchPostAndPopulateForm = async (postId) => {
    try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const postData = postSnap.data();
            createPostForm['postTitle'].value = postData.title;
            createPostForm['postCategory'].value = postData.category;
            createPostForm['postDescription'].value = postData.description || '';
            createPostForm['postKeywords'].value = postData.keywords || '';
            
            // Mengubah konten HTML menjadi teks mentah untuk diedit
            createPostForm['postContent'].value = convertHTMLToMarkdown(postData.content);
            
            // Mengubah teks tombol menjadi 'Perbarui Postingan'
            document.querySelector('.btn-generate').innerText = 'Perbarui Postingan';
            document.title = 'Edit Postingan - ENoted';
        } else {
            alert("Postingan tidak ditemukan.");
            window.location.href = '/admin/dashboard.html';
        }
    } catch (error) {
        console.error("Error mengambil postingan untuk diedit:", error);
        alert("Gagal memuat postingan untuk diedit.");
    }
};

// Fungsi bantuan untuk mengonversi HTML kembali ke teks Markdown sederhana
function convertHTMLToMarkdown(html) {
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Konversi tag HTML kembali ke format teks
    let markdown = tempDiv.innerHTML
        .replace(/<h1>(.*?)<\/h1>/g, "# $1\n")
        .replace(/<h2>(.*?)<\/h2>/g, "## $1\n")
        .replace(/<p>(.*?)<\/p>/g, "$1\n")
        .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
        .replace(/<em>(.*?)<\/em>/g, "*$1*")
        .replace(/<u>(.*?)<\/u>/g, "__$1__")
        .replace(/<code>(.*?)<\/code>/g, "`$1`")
        .replace(/<blockquote>(.*?)<\/blockquote>/g, "> $1\n")
        .replace(/<li>(.*?)<\/li>/g, "- $1\n")
        .replace(/<ol>(.*?)<\/ol>/gs, "$1")
        .replace(/<ul>(.*?)<\/ul>/gs, "$1")
        .replace(/<a href="(.*?)" target="_blank">(.*?)<\/a>/g, "[$2]($1)")
        .replace(/<img src="(.*?)" alt="(.*?)">/g, "![$2]($1)");

    return markdown.trim();
}


// Fungsi untuk mengonversi teks menjadi HTML terstruktur
function convertToStructuredHTML(text) {
    // ... (Fungsi ini sama seperti kode sebelumnya)
    let lines = text.split("\n");
    let htmlOutput = "";
    let inUl = false, inOl = false, inCodeBlock = false;

    lines.forEach((line, index) => {
        line = line.trim();
        if (line.startsWith("```")) {
            if (inCodeBlock) { htmlOutput += "</code></pre>\n"; } 
            else { htmlOutput += "<pre><code>\n"; }
            inCodeBlock = !inCodeBlock;
            return;
        }
        if (inCodeBlock) {
            htmlOutput += sanitizeInput(line) + "\n";
            return;
        }
        if (line.startsWith("#") && !line.startsWith("##")) {
            htmlOutput += `<h1>${sanitizeInput(line.replace(/^#\s*/, ''))}</h1>\n`;
        } else if (line.startsWith("##")) {
            htmlOutput += `<h2>${sanitizeInput(line.replace(/^##\s*/, ''))}</h2>\n`;
        } else if (line.startsWith(">")) {
            htmlOutput += `<blockquote>${sanitizeInput(line.replace(/^>\s*/, ''))}</blockquote>\n`;
        } else if (/^\d+\.\s/.test(line)) {
            if (!inOl) { htmlOutput += "<ol>\n"; inOl = true; }
            htmlOutput += `<li>${sanitizeInput(line.replace(/^\d+\.\s*/, ''))}</li>\n`;
        } else if (line.startsWith("- ")) {
            if (!inUl) { htmlOutput += "<ul>\n"; inUl = true; }
            htmlOutput += `<li>${sanitizeInput(line.replace(/^- /, ''))}</li>\n`;
        } else if (line === "") {
            if (inUl) { htmlOutput += "</ul>\n"; inUl = false; }
            if (inOl) { htmlOutput += "</ol>\n"; inOl = false; }
            htmlOutput += "\n";
        } else {
            if (inUl) { htmlOutput += "</ul>\n"; inUl = false; }
            if (inOl) { htmlOutput += "</ol>\n"; inOl = false; }
            htmlOutput += `<p>${sanitizeInput(line)}</p>\n`;
        }
    });
    if (inUl) htmlOutput += "</ul>\n";
    if (inOl) htmlOutput += "</ol>\n";
    htmlOutput = htmlOutput
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/__(.*?)__/g, "<u>$1</u>")
        .replace(/~~(.*?)~~/g, "<s>$1</s>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;">');
    return htmlOutput;
}

function sanitizeInput(input) {
    if (!input) return "";
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        responseMessage.style.display = 'block';
        responseMessage.className = 'response-message error';
        responseMessage.innerText = 'Anda harus login untuk menerbitkan postingan.';
        return;
    }

    const title = createPostForm['postTitle'].value;
    const category = createPostForm['postCategory'].value;
    const description = createPostForm['postDescription'].value;
    const keywords = createPostForm['postKeywords'].value;
    const rawContent = createPostForm['postContent'].value;
    const convertedContent = convertToStructuredHTML(rawContent);

    const author = 'Cecep Hardiansyah';

    try {
        responseMessage.style.display = 'block';
        responseMessage.className = 'response-message';

        if (postId) {
            // Logika untuk memperbarui postingan
            responseMessage.innerText = 'Memperbarui postingan...';
            const postRef = doc(db, "posts", postId);
            await setDoc(postRef, {
                title, category, description, keywords, content: convertedContent, author
            }, { merge: true }); // 'merge: true' memastikan field lain tidak terhapus
        } else {
            // Logika untuk membuat postingan baru
            responseMessage.innerText = 'Menerbitkan postingan...';
            await addDoc(collection(db, "posts"), {
                title, category, description, keywords, content: convertedContent, author, publishedAt: serverTimestamp()
            });
        }
        
        responseMessage.className = 'response-message success';
        responseMessage.innerText = 'Postingan berhasil disimpan!';
        // Setelah berhasil, arahkan kembali ke dashboard
        setTimeout(() => {
            window.location.href = '/admin/dashboard.html';
        }, 1500);
        

    } catch (error) {
        responseMessage.className = 'response-message error';
        responseMessage.innerText = 'Gagal menyimpan postingan. Coba lagi.';
        console.error("Error menyimpan dokumen:", error);
    }
});