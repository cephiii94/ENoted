"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "tutorial",
    category_label: "Tutorial",
    slug: "",
  });

  // Melacak apakah user sudah MANUAL mengubah judul (bukan saat load awal)
  const [titleChanged, setTitleChanged] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Protection & Fetch Initial Data
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            title: data.title,
            summary: data.summary,
            content: data.content,
            category: data.category,
            category_label: data.category_label,
            slug: data.slug,
          });
        }
      } catch (err: any) {
        console.error("Error fetching article:", err);
        setError("Gagal memuat artikel.");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthAndFetch();
  }, [id, router]);

  // Auto-generate slug dari title HANYA jika user secara manual mengubah judul
  // (bukan saat data awal dimuat dari database)
  useEffect(() => {
    if (!titleChanged) return; // Abaikan saat data awal dimuat
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  }, [formData.title, titleChanged]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Tandai bahwa user sudah mengubah judul secara manual
    if (name === "title") setTitleChanged(true);
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
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

  const insertMarkdown = (e: React.MouseEvent, prefix: string, suffix: string = "") => {
    e.preventDefault();
    e.stopPropagation();
    
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

    // Re-focus and set cursor position after update
    setTimeout(() => {
      textarea.focus({ preventScroll: true }); // Mencegah layar melompat
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarItems = [
    { label: "B", prefix: "**", suffix: "**", icon: <><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></>, title: "Tebal" },
    { label: "I", prefix: "*", suffix: "*", icon: <><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></>, title: "Miring" },
    { label: "H", prefix: "### ", suffix: "", icon: <><path d="M4 12h16"/><path d="M4 18V6"/><path d="M20 18V6"/></>, title: "Heading" },
    { label: "Link", prefix: "[", suffix: "](url)", icon: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>, title: "Tautan" },
    { label: "Code", prefix: "```\n", suffix: "\n```", icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>, title: "Blok Kode" },
    { label: "Quote", prefix: "> ", suffix: "", icon: <><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1 0 2.5 0 5-2 5"/><path d="M11 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-2c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1 0 2.5 0 5-2 5"/></>, title: "Kutipan" },
    { label: "List", prefix: "- ", suffix: "", icon: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>, title: "Daftar" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesi tidak aktif. Silakan login kembali.");

      // Percobaan Pertama - Gunakan .select() untuk verifikasi apakah baris benar-benar diperbarui
      let { data: updatedData, error: updateError } = await supabase
        .from("articles")
        .update({ ...formData })
        .eq("id", id)
        .select();

      // Jika Error Duplikasi (Unique Violation), coba dengan slug unik
      if (updateError && updateError.code === "23505") {
        console.warn("Slug duplikat terdeteksi saat update, mencoba auto-unique slug...");
        const uniqueSlug = `${formData.slug}-${Math.random().toString(36).substring(2, 6)}`;
        
        const retry = await supabase
          .from("articles")
          .update({ ...formData, slug: uniqueSlug })
          .eq("id", id)
          .select();
        
        updatedData = retry.data;
        updateError = retry.error;
        
        if (!updateError) {
          setError("Catatan: Judul bertabrakan dengan artikel lain, URL telah disesuaikan agar unik.");
        }
      }

      if (updateError) {
        console.error("Supabase Final Update Error:", updateError);
        if (updateError.code === "23505") {
          throw new Error("Gagal memperbarui: Judul atau Slug masih duplikat dengan artikel lain.");
        } else if (updateError.code === "42501") {
          throw new Error("Akses ditolak (RLS). Anda tidak diizinkan mengubah artikel ini.");
        } else {
          throw new Error(`${updateError.message} (Kode: ${updateError.code})`);
        }
      }

      // Cek apakah ada baris yang BENAR-BENAR diperbarui
      // Jika updatedData kosong tapi tidak ada error = RLS memblok update secara diam-diam
      if (!updatedData || updatedData.length === 0) {
        console.error("Update diam-diam gagal: 0 baris diperbarui. Kemungkinan kebijakan RLS memblok update.");
        throw new Error(
          "Artikel tidak berhasil disimpan. " +
          "Pastikan kebijakan RLS di Supabase sudah mengizinkan UPDATE pada tabel 'articles' untuk pengguna yang login."
        );
      }

      console.log("Update berhasil:", updatedData[0]);

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/blog/manage");
      }, 1500);
    } catch (err: any) {
      console.error("Update process failure:", err);
      setError(err.message || "Terjadi kesalahan saat memperbarui artikel.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-12 flex flex-col items-center justify-start overflow-x-hidden custom-scrollbar py-12">
      <div className="max-w-4xl w-full animate-in zoom-in duration-500">
        <div className="glass rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Artikel
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Suntik Perubahan Baru</p>
            </div>
            <Link 
              href="/admin/blog/manage"
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
                  className="w-full px-6 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all appearance-none cursor-pointer text-slate-600"
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

            {/* Markdown Toolbar */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Format Markdown</label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-100/50 rounded-2xl border border-white/60">
                {toolbarItems.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => insertMarkdown(e, item.prefix, item.suffix)}
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
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Isi Konten (Markdown)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  ref={contentRef}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={12}
                  placeholder="Tulis isi artikel menggunakan format Markdown..."
                  className="w-full px-6 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 custom-scrollbar"
                />
                <div className="hidden md:block w-full h-[312px] px-6 py-4 bg-slate-50/50 border border-white/60 rounded-2xl overflow-y-auto custom-scrollbar">
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
                Perubahan berhasil disimpan! Mengalihkan...
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className={`flex-1 py-4 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${isUpdating ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isUpdating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Simpan Perubahan
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/blog/manage")}
                className="px-8 py-4 bg-white/50 border border-white/60 text-slate-500 font-bold rounded-2xl hover:bg-white transition-all active:scale-95"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
