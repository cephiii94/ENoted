"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Article {
  id: string;
  title: string;
  category_label: string;
  category: string;
  date: string;
  slug: string;
}

export default function ManagePostsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkAuth();
    fetchArticles();
  }, [router]);

  async function fetchArticles() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, category, category_label, date, slug")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      setArticles(articles.filter(a => a.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Gagal menghapus artikel.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-12 flex flex-col items-center justify-start overflow-x-hidden custom-scrollbar py-12">
      <div className="max-w-5xl w-full animate-in zoom-in duration-500">
        <div className="glass rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                Kelola Postingan
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Daftar Semua Artikel ENoted</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/admin/blog/create"
                className="px-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Buat Artikel
              </Link>
              <Link 
                href="/"
                className="px-6 py-3 bg-white/50 border border-white/60 text-slate-500 text-xs font-bold rounded-2xl hover:bg-white transition-all flex items-center gap-2"
              >
                Beranda
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-slate-100/50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
                    <th className="px-6 pb-2">Judul Artikel</th>
                    <th className="px-6 pb-2 hidden md:table-cell">Kategori</th>
                    <th className="px-6 pb-2 hidden md:table-cell">Tanggal</th>
                    <th className="px-6 pb-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="group transition-all hover:translate-x-1">
                      <td className="px-6 py-5 bg-white/50 rounded-l-2xl border-y border-l border-white/60 shadow-sm first:rounded-l-2xl">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 line-clamp-1">{article.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium md:hidden mt-1">{article.category_label || article.category} • {article.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 bg-white/50 border-y border-white/60 shadow-sm hidden md:table-cell">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-indigo-100">
                          {article.category_label || article.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 bg-white/50 border-y border-white/60 shadow-sm hidden md:table-cell">
                        <span className="text-xs text-slate-400 font-medium">{article.date}</span>
                      </td>
                      <td className="px-6 py-5 bg-white/50 rounded-r-2xl border-y border-r border-white/60 shadow-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/blog/edit/${article.id}`}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          </Link>
                          <button 
                            onClick={() => setDeleteId(article.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Hapus"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">Belum ada artikel yang dipublikasikan.</p>
              <Link href="/admin/blog/create" className="text-emerald-600 text-sm font-bold hover:underline mt-2 inline-block">Mulai menulis sekarang</Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-white/60 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Hapus Artikel?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Tindakan ini tidak dapat dibatalkan. Artikel akan terhapus selamanya dari database Anda.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Hapus"}
              </button>
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
