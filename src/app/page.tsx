"use client";

import React, { useState, useMemo, useEffect } from "react";
import ArticleCard from "@/components/ArticleCard";
import AdminFAB from "@/components/AdminFAB";
import AuthFAB from "@/components/AuthFAB";
import ManageFAB from "@/components/ManageFAB";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { supabase } from "@/lib/supabase";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  category_label: string;
  date: string;
  slug: string;
  created_at?: string;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    if (category === "semua") return articles;
    return articles.filter((art) => art.category === category);
  }, [category, articles]);

  const selectedArticle = useMemo(() => {
    return articles.find(a => a.id === selectedId) || null;
  }, [selectedId, articles]);

  const handleArticleClick = (id: string) => {
    setSelectedId(id);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedArticle) {
      const url = `${window.location.origin}/blog/${selectedArticle.slug}`;
      navigator.clipboard.writeText(url).then(() => {
        alert("Link artikel berhasil disalin ke clipboard!");
      });
    }
  };

  // Tutup panel jika tombol ESC ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden gradient-bg p-4 md:p-6 md:px-20">
      
      {/* Click Outside Overlay Layer (Desktop) */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-10 bg-slate-400/5 backdrop-blur-[2px] transition-all duration-500 hidden md:block"
          onClick={closePreview}
        />
      )}

      {/* Main Layout Container */}
      <div className={`flex flex-col md:flex-row items-center justify-center gap-8 px-6 transition-all duration-700 ease-in-out z-20 w-full ${isPreviewOpen ? "max-w-7xl" : "max-w-[420px]"}`}>
        
        {/* Panel Kiri: List Artikel */}
        <div className={`w-full md:w-[400px] flex flex-col gap-6 transition-all duration-700 relative`}>
          <div className="glass rounded-[2.5rem] p-8 flex flex-col h-[85vh] md:h-[80vh] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 relative z-30">
            {/* Header didalam container */}
            <div className="mb-6">
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                ENoted
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Portal Inspirasi & Tutorial</p>
            </div>

            {/* Filter Navigation */}
            <div className="flex bg-slate-200/40 dark:bg-slate-800/40 p-1.5 rounded-2xl gap-1 mb-8">
              {["semua", "belajar-koding", "tutorial", "islam"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-3 px-1 rounded-xl text-[10px] font-bold capitalize transition-all duration-300 relative ${
                    category === cat
                      ? "bg-white text-emerald-600 shadow-lg shadow-emerald-500/10 translate-y-[-1px]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/20"
                  }`}
                >
                  {cat === "belajar-koding" ? "Koding" : cat}
                </button>
              ))}
            </div>

            {/* List Scrollable / Skeleton */}
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              {isLoading ? (
                // Loading Skeleton
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-100/50 dark:bg-slate-800/50 animate-pulse rounded-2xl p-6 h-32 flex flex-col gap-3">
                    <div className="flex justify-between items-center h-4 w-full">
                       <div className="w-16 h-full bg-slate-200 dark:bg-slate-700 rounded-md" />
                       <div className="w-24 h-full bg-slate-200 dark:bg-slate-700 rounded-md" />
                    </div>
                    <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-700 rounded-md" />
                    <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  </div>
                ))
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((art) => (
                  <ArticleCard
                    key={art.id}
                    id={art.id}
                    title={art.title}
                    summary={art.summary}
                    category={art.category_label || art.category}
                    date={art.date}
                    isSelected={selectedId === art.id}
                    onClick={() => handleArticleClick(art.id)}
                  />
                ))
              ) : (
                <div className="text-center py-10 opacity-50">
                  <p className="text-sm">Belum ada konten.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* FAB Admin Control Panel */}
          {user && (
            <>
              <AdminFAB className="absolute bottom-40 -left-14 z-50 group flex items-center justify-center invisible md:visible" />
              <ManageFAB className="absolute bottom-26 -left-14 z-50 group flex items-center justify-center invisible md:visible" />
            </>
          )}
          <AuthFAB 
            isLoggedIn={!!user} 
            className="absolute bottom-12 -left-14 z-50 group flex items-center justify-center invisible md:visible" 
          />
          
          {/* Mobile version */}
          <div className="md:hidden flex flex-col gap-3 absolute -bottom-[12rem] left-0 z-50">
            {user && (
              <>
                <AdminFAB className="relative" />
                <ManageFAB className="relative" />
              </>
            )}
            <AuthFAB isLoggedIn={!!user} className="relative" />
          </div>
        </div>

        {/* Panel Kanan: Detail Pratinjau (Desktop) */}
        <div className={`hidden md:flex flex-col flex-1 transition-all duration-700 h-[80vh] ${isPreviewOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 translate-x-12 w-0 overflow-hidden pointer-events-none"}`}>
          {selectedArticle && (
            <div className="glass rounded-[2.5rem] w-full h-full overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative z-40 border border-white/60" onClick={(e) => e.stopPropagation()}>
              {/* Header Kontrol Panel */}
              <div className="flex items-center justify-between px-8 py-5 bg-white/60 border-b border-slate-100/50 backdrop-blur-xl">
                 <div className="flex gap-2">
                   <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-sm border border-rose-500/10" />
                   <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm border border-amber-500/10" />
                   <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-sm border border-emerald-500/10" />
                 </div>
                 <div className="flex items-center gap-1">
                   {/* Share */}
                   <button onClick={handleShare} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="Bagikan">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                   </button>
                   {/* Full View */}
                   <Link href={`/blog/${selectedArticle.slug}`} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all" title="Tampilan Penuh">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                   </Link>
                   {/* Close */}
                   <button onClick={closePreview} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all" title="Tutup">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                   </button>
                 </div>
              </div>
              
              <div className="flex-grow overflow-y-auto p-12 bg-white/30 custom-scrollbar">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-xl uppercase tracking-widest border border-emerald-500/10">
                      {selectedArticle.category_label || selectedArticle.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{selectedArticle.date}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 leading-[1.2] animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {selectedArticle.title}
                  </h2>
                  <div className="prose prose-slate max-w-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <p className="text-lg text-slate-500 leading-relaxed mb-6 italic font-medium text-left">
                      {selectedArticle.summary}
                    </p>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full mb-8" />
                    <MarkdownRenderer 
                      content={selectedArticle.content} 
                      className="prose-sm md:prose-base !text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel Pratinjau Mobile (Fullscreen Modal) */}
        <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isPreviewOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-[10%]"}`}>
          {selectedArticle && (
            <div className="w-full h-full bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0 bg-white z-10">
                 <button onClick={closePreview} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                 </button>
                 <div className="flex items-center gap-3">
                    <button onClick={handleShare} className="p-2 text-slate-500 active:text-indigo-500"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></button>
                    <Link href={`/blog/${selectedArticle.slug}`} className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Baca Penuh</Link>
                 </div>
              </div>
              <div className="flex-grow overflow-y-auto p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em]">{selectedArticle.category_label || selectedArticle.category}</span>
                  <span className="text-[10px] text-slate-400 font-medium opacity-60">• {selectedArticle.date}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-5 leading-tight">{selectedArticle.title}</h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-6 italic text-base text-left">{selectedArticle.summary}</p>
                <div className="h-px bg-slate-100 mb-6" />
                <MarkdownRenderer 
                  content={selectedArticle.content} 
                  className="prose-sm !text-slate-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
