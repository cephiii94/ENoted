"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function CreateBlogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "tutorial",
    category_label: "Tutorial",
    slug: "",
    image_url: "",
  });

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  // Protection: Redirect if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from title
  useEffect(() => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  }, [formData.title]);

  // Sistem History (Undo/Redo)
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = (e?: React.MouseEvent | KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      if ('stopPropagation' in e) e.stopPropagation();
    }
    if (historyIndex > 0) {
      const prevContent = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setFormData((prev) => ({ ...prev, content: prevContent }));
    }
  };

  const redo = (e?: React.MouseEvent | KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      if ('stopPropagation' in e) e.stopPropagation();
    }
    if (historyIndex < history.length - 1) {
      const nextContent = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setFormData((prev) => ({ ...prev, content: nextContent }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === "content") {
      saveToHistory(value);
    }
    
    // Update category_label if category changes
    if (name === "category") {
      const labels: Record<string, string> = {
        "belajar-koding": "Koding",
        "tutorial": "Tutorial",
        "islam": "Islam",
        "umum": "Umum"
      };
      setFormData((prev) => ({ ...prev, category_label: labels[value] || value }));
    }
  };

  const insertMarkdown = (e: React.MouseEvent | null, prefix: string, suffix: string = "") => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);

    const newContent = 
      text.substring(0, start) + 
      prefix + 
      selectedText + 
      suffix + 
      text.substring(end);

    setFormData((prev) => ({ ...prev, content: newContent }));
    saveToHistory(newContent);

    // Re-focus and set cursor position after update
    setTimeout(() => {
      textarea.focus({ preventScroll: true }); // Mencegah layar melompat
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Deteksi Ctrl atau Cmd
    const isMod = e.ctrlKey || e.metaKey;
    
    if (isMod) {
      switch (e.key.toLowerCase()) {
        case 'b': insertMarkdown(null, "**", "**"); break;
        case 'i': insertMarkdown(null, "*", "*"); break;
        case 'j': insertMarkdown(null, '<div align="justify">\n', '\n</div>'); break;
        case 'k': insertMarkdown(null, "[", "](url)"); break;
        case 'h': insertMarkdown(null, "### ", ""); break;
        case 'z': 
          if (e.shiftKey) redo(); 
          else undo(); 
          break;
        case 'y': redo(); break;
        default: return; // Biarkan tombol lain berfungsi normal
      }
      e.preventDefault();
    }
  };

  const toolbarItems = [
    { label: "Undo", prefix: "", suffix: "", icon: <><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></>, title: "Undo (Ctrl+Z)", action: (e: React.MouseEvent) => undo(e) },
    { label: "Redo", prefix: "", suffix: "", icon: <><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></>, title: "Redo (Ctrl+Y)", action: (e: React.MouseEvent) => redo(e) },
    { label: "H1", prefix: "# ", suffix: "", icon: <><path d="M4 12h8m-8 6V6m8 12V6m5 12V6m0 0l-3 2"/></>, title: "Heading 1" },
    { label: "H2", prefix: "## ", suffix: "", icon: <><path d="M4 12h8m-8 6V6m8 12V6m9 6a3 3 0 1 0-3-3"/></>, title: "Heading 2" },
    { label: "H3", prefix: "### ", suffix: "", icon: <><path d="M4 12h8m-8 6V6m8 12V6m5-3a3 3 0 0 1 3 3"/></>, title: "Heading 3" },
    { label: "B", prefix: "**", suffix: "**", icon: <><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></>, title: "Tebal (Ctrl+B)" },
    { label: "I", prefix: "*", suffix: "*", icon: <><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></>, title: "Miring (Ctrl+I)" },
    { label: "Link", prefix: "[", suffix: "](url)", icon: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>, title: "Tautan (Ctrl+K)" },
    { label: "Img", prefix: "![Alt text](", suffix: ")", icon: <><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>, title: "Gambar" },
    { label: "Table", prefix: "\n| Kolom 1 | Kolom 2 |\n| :--- | :--- |\n| Data 1 | Data 2 |\n", suffix: "", icon: <><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></>, title: "Tabel" },
    { label: "Divider", prefix: "\n---\n", suffix: "", icon: <><line x1="3" y1="12" x2="21" y2="12"/></>, title: "Garis Pembatas" },
    { label: "Code", prefix: "```\n", suffix: "\n```", icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>, title: "Blok Kode" },
    { label: "Quote", prefix: "> ", suffix: "", icon: <><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1 0 2.5 0 5-2 5"/><path d="M11 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-2c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1 0 2.5 0 5-2 5"/></>, title: "Kutipan" },
    { label: "List", prefix: "- ", suffix: "", icon: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>, title: "Daftar" },
  ];

  // --- AI Image Generator Logic ---
  const [isImageLoading, setIsImageLoading] = useState(false);

  const generateThumbnail = async () => {
    if (!formData.title) {
      alert("Tulis judul artikel terlebih dahulu sebagai dasar prompt gambar.");
      return;
    }

    setIsImageLoading(true);
    try {
      // 1. Minta AI untuk membuat prompt bahasa Inggris yang lebih deskriptif
      const aiPromptResponse = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `Judul Artikel: "${formData.title}". Buatkan prompt gambar dalam bahasa Inggris (maks 30 kata) untuk thumbnail blog yang estetik. Fokus pada objek utama dan suasana. Jangan gunakan kata "JSON" atau format lain, hanya teks prompt.`,
          command: "enhance_prompt" 
        })
      });

      const aiPromptData = await aiPromptResponse.json();
      const enhancedPrompt = aiPromptData.result || formData.title;

      // 2. Kirim prompt yang sudah ditingkatkan ke Fal.ai
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `A premium, high-quality digital art for a blog thumbnail: ${enhancedPrompt}. Professional lighting, minimalistic, vibrant colors.` 
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setFormData(prev => ({ ...prev, image_url: data.url }));
    } catch (err: any) {
      alert("Gagal membuat gambar: " + err.message);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesi tidak valid. Silakan login kembali.");

      const dateStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Percobaan Pertama
      let { data, error: insertError } = await supabase
        .from("articles")
        .insert([{ ...formData, date: dateStr }])
        .select();

      // Jika Error Duplikasi (Unique Violation), coba dengan slug unik
      if (insertError && insertError.code === "23505") {
        console.warn("Slug duplikat terdeteksi, mencoba auto-unique slug...");
        const uniqueSlug = `${formData.slug}-${Math.random().toString(36).substring(2, 6)}`;
        
        const retry = await supabase
          .from("articles")
          .insert([{ ...formData, slug: uniqueSlug, date: dateStr }])
          .select();
        
        data = retry.data;
        insertError = retry.error;
        
        if (!insertError) {
          setError("Catatan: Judul sudah ada, URL artikel telah disesuaikan agar unik.");
        }
      }

      if (insertError) {
        console.error("Supabase Final Error:", insertError);
        if (insertError.code === "42501") {
          throw new Error("Akses ditolak (RLS). Pastikan Anda memiliki izin untuk menulis ke tabel 'articles'.");
        } else if (insertError.code === "23505") {
          throw new Error("Gagal menyimpan: Judul atau Slug masih duplikat. Silakan gunakan judul yang benar-benar berbeda.");
        } else {
          throw new Error(`${insertError.message} (Kode: ${insertError.code})`);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      console.error("Save process failure:", err);
      setError(err.message || "Terjadi kesalahan saat publikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- AI Assistant Logic ---
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: 'Halo tuan! Saya asisten cerdas ENoted. Ketik `/create [topik]` untuk membuat konten otomatis.\n\nContoh: `/create fakta menarik gagak, gaya santai, konten pendek`' }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAISend = async () => {
    if (!aiInput.trim() || isAiLoading) return;

    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput("");
    setIsAiLoading(true);

    try {
      if (userMsg.startsWith("/create")) {
        const fullPrompt = userMsg.replace("/create", "").trim();
        
        // Parsing sederhana untuk feedback
        let toneFeedback = "";
        let lengthFeedback = "";
        
        if (fullPrompt.toLowerCase().includes("santai")) toneFeedback = " dengan gaya **Santai**";
        else if (fullPrompt.toLowerCase().includes("gen z")) toneFeedback = " dengan gaya **Gen Z**";
        else if (fullPrompt.toLowerCase().includes("formal")) toneFeedback = " dengan gaya **Formal**";
        
        if (fullPrompt.toLowerCase().includes("pendek")) lengthFeedback = " dalam format **Pendek**";
        else if (fullPrompt.toLowerCase().includes("sedang")) lengthFeedback = " dalam format **Sedang**";
        else if (fullPrompt.toLowerCase().includes("panjang")) lengthFeedback = " dalam format **Panjang**";

        setAiMessages(prev => [...prev, { 
          role: 'ai', 
          content: `Baik tuan, akan saya buatkan konten "${fullPrompt.split(',')[0]}"${toneFeedback}${lengthFeedback}. Mohon tunggu sebentar...` 
        }]);

        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: fullPrompt, command: "create" })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        try {
          // Ekstrak blok JSON menggunakan regex
          const jsonMatch = data.result.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("Format JSON tidak ditemukan dalam respons AI.");
          
          let rawJson = jsonMatch[0];
          
          // Penanganan darurat: Ganti baris baru mentah di dalam string JSON (yang merusak JSON.parse)
          // Ini adalah langkah berisiko tapi membantu jika AI gagal meng-escape \n
          // Kita hanya ganti \n jika berada di antara tanda kutip
          const cleanedJson = rawJson.replace(/"([^"]*)"/g, (match: string, p1: string) => {
             return '"' + p1.replace(/\n/g, "\\n") + '"';
          });

          const result = JSON.parse(cleanedJson);
          
          setFormData(prev => ({
            ...prev,
            title: result.title || prev.title,
            category: result.category || prev.category,
            summary: result.summary || prev.summary,
            content: result.content || prev.content,
          }));

          setAiMessages(prev => [...prev, { role: 'ai', content: 'Selesai tuan! Konten sudah saya masukkan ke dalam form. Silakan diperiksa kembali.' }]);
        } catch (parseError) {
          console.error("Parse Error:", parseError, data.result);
          setAiMessages(prev => [...prev, { role: 'ai', content: 'Maaf tuan, terjadi kesalahan saat memproses data. AI terkadang mengirimkan format yang kurang tepat. Silakan coba lagi dengan topik yang lebih spesifik.' }]);
        }
      } else {
        // Chat biasa (opsional)
        setAiMessages(prev => [...prev, { role: 'ai', content: 'Maaf tuan, untuk saat ini saya paling ahli menggunakan perintah `/create [topik]`. Silakan dicoba!' }]);
      }
    } catch (err: any) {
      setAiMessages(prev => [...prev, { role: 'ai', content: 'Maaf tuan, sepertinya ada gangguan pada koneksi saya: ' + err.message }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center justify-start overflow-x-hidden custom-scrollbar py-12">
      <div className="max-w-4xl w-full animate-in zoom-in duration-500">
        <div className="glass rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                Buat Artikel Baru
              </h1>
              <p className="text-xs text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">ENoted Admin Panel</p>
            </div>
            <Link 
              href="/"
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
              title="Batalkan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judul */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Judul Artikel</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan judul menarik..."
                  className="w-full px-6 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Kategori */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="tutorial">Tutorial</option>
                  <option value="belajar-koding">Koding</option>
                  <option value="islam">Islam</option>
                  <option value="umum">Umum</option>
                </select>
              </div>
            </div>

            {/* Slug (Read Only) */}
            <div className="flex flex-col gap-2 opacity-60">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">URL Slug (Otomatis)</label>
              <input
                type="text"
                value={formData.slug}
                readOnly
                className="w-full px-6 py-3 bg-slate-100/50 border border-slate-200 rounded-2xl text-sm text-slate-500 focus:outline-none"
              />
            </div>

            {/* Ringkasan */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Ringkasan Singkat (SEO)</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Deskripsi singkat yang muncul di kartu artikel..."
                className="w-full px-6 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 resize-none"
              />
            </div>

            {/* Thumbnail Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Thumbnail Artikel</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative group h-48 md:h-full bg-slate-100/50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center transition-all hover:border-softblue-400">
                  {formData.image_url ? (
                    <>
                      <img 
                        src={formData.image_url} 
                        alt="Thumbnail Preview" 
                        className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                        className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="p-4 bg-white rounded-full shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada gambar</p>
                    </div>
                  )}
                  {isImageLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                      <div className="w-10 h-10 border-4 border-softblue-200 border-t-softblue-600 rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-softblue-600 uppercase tracking-widest">Generating AI Image...</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={generateThumbnail}
                    disabled={isImageLoading}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-softblue-50 hover:text-softblue-600 hover:border-softblue-200 transition-all flex flex-col items-center justify-center gap-2 group shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <div className="p-3 bg-softblue-50 rounded-xl group-hover:bg-softblue-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-softblue-600"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest">AI Generate</span>
                  </button>
                  <input 
                    type="text"
                    placeholder="Atau tempel URL gambar..."
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-100 rounded-xl text-[10px] focus:outline-none focus:border-softblue-300 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Markdown Toolbar */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Format Markdown</label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-100/50 rounded-2xl border border-white/60">
                {toolbarItems.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      if (item.action) {
                        item.action(e);
                      } else {
                        insertMarkdown(e, item.prefix, item.suffix);
                      }
                    }}
                    title={item.title}
                    className="flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white text-slate-600 hover:text-emerald-600 rounded-xl border border-transparent hover:border-emerald-500/20 shadow-sm transition-all active:scale-95 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 transition-opacity">
                      {item.icon}
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Konten */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Isi Konten (Markdown)</label>
                  <span className="text-[9px] font-black text-softblue-600 bg-softblue-50 px-2 py-0.5 rounded-lg border border-softblue-100 animate-in fade-in slide-in-from-left-2">
                    {formData.content.length} Karakter
                  </span>
                </div>
                
                {/* Mobile Preview Toggle */}
                <div className="flex md:hidden bg-slate-100/80 p-1 rounded-xl border border-white/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'write' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Tulis
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'preview' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Pratinjau
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  ref={contentRef}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={12}
                  placeholder="Tulis isi artikel menggunakan format Markdown..."
                  onKeyDown={handleKeyDown}
                  className={`w-full px-6 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 custom-scrollbar ${activeTab === 'write' ? "block" : "hidden md:block"}`}
                />
                <div className={`w-full h-[312px] px-6 py-4 bg-slate-50/50 border border-white/60 rounded-2xl overflow-y-auto custom-scrollbar ${activeTab === 'preview' ? "block" : "hidden md:block"}`}>
                  <h4 className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-4">Preview</h4>
                  <MarkdownRenderer 
                    content={formData.content || "*Pratinjau konten akan muncul di sini...*"} 
                    className="prose-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Artikel berhasil dipublikasikan! Mengalihkan...
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-4 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Simpan & Publikasikan
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ title: "", summary: "", content: "", category: "tutorial", category_label: "Tutorial", slug: "", image_url: "" });
                  setHistory([""]);
                  setHistoryIndex(0);
                  setError(null);
                  setSuccess(false);
                }}
                className="px-8 py-4 bg-white/50 border border-white/60 text-slate-500 font-bold rounded-2xl hover:bg-white transition-all active:scale-95"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- AI Assistant UI --- */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {/* Chat Window */}
        <div className={`glass w-80 md:w-96 rounded-[2rem] shadow-2xl border border-white/60 overflow-hidden flex flex-col transition-all duration-500 origin-bottom-right ${isAIChatOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}>
          <div className="bg-softblue-600 p-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Assistant AI</h3>
                <p className="text-[10px] opacity-70 font-bold">Model: Llama-3-70b</p>
              </div>
            </div>
            <button onClick={() => setIsAIChatOpen(false)} className="hover:rotate-90 transition-transform p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-6 flex flex-col gap-4 bg-white/50 backdrop-blur-sm custom-scrollbar">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-softblue-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-softblue-400 rounded-full animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 bg-softblue-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white/80 border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISend()}
                placeholder="Contoh: /create [topik], gaya [santai/gen z], konten [pendek]..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-medium focus:ring-2 focus:ring-softblue-500 transition-all outline-none"
              />
              <button 
                onClick={handleAISend}
                disabled={isAiLoading}
                className="absolute right-2 top-1.5 p-1.5 bg-softblue-600 text-white rounded-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Button */}
        <button 
          onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.2)] border-2 border-white/60 transition-all duration-500 hover:scale-110 active:scale-90 group relative ${isAIChatOpen ? "bg-rose-500 rotate-90" : "bg-softblue-600 hover:bg-softblue-700"}`}
        >
          {isAIChatOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:rotate-12 transition-transform"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
