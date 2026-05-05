"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import ArticleCard from "@/components/ArticleCard";
import AdminFAB from "@/components/AdminFAB";
import AuthFAB from "@/components/AuthFAB";
import ManageFAB from "@/components/ManageFAB";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { supabase } from "@/lib/supabase";
import { useSound } from "@/context/SoundContext";
import SettingsFAB from "@/components/SettingsFAB";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  category_label: string;
  date: string;
  slug: string;
  image_url?: string;
  created_at?: string;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("semua");
  const { playSound } = useSound();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState("Selamat Datang");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasRewarded, setHasRewarded] = useState(false);
  const [rewardedIds, setRewardedIds] = useState<Set<string>>(new Set());
  
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateBgAndTime = () => {
      const jam = new Date().getHours();
      let img = "/img/malam.jpg";
      let text = "Selamat Malam 🌃";

      if (jam >= 5 && jam < 12) {
        img = "/img/pagi.jpg";
        text = "Selamat Pagi 🌅";
      } else if (jam >= 12 && jam < 16) {
        img = "/img/siang.jpg";
        text = "Selamat Siang ☀️";
      } else if (jam >= 16 && jam < 18) {
        img = "/img/sore.jpg";
        text = "Selamat Sore 🌇";
      }

      setGreeting(text);
    };

    updateBgAndTime();
    const interval = setInterval(updateBgAndTime, 60000); // Update setiap menit
    return () => clearInterval(interval);
  }, []);

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
      } catch (error: any) {
        console.error("Error fetching articles:", error);
        // Memberikan pesan yang lebih informatif jika tersedia
        if (error?.message) {
          console.error("Error message detail:", error.message);
        }
        if (error?.details) {
          console.error("Error details:", error.details);
        }
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
    playSound("paper");
    setSelectedId(id);
    setIsPreviewOpen(true);
    setHasRewarded(false); // Reset reward status untuk artikel baru
  };

  const closePreview = () => {
    playSound("close");
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

  // Monitor Scroll pada Preview Panel
  useEffect(() => {
    const checkScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
      const article = selectedArticle;
      
      if (progress > 98 && !hasRewarded && article) {
        setHasRewarded(true);
        setRewardedIds(prev => new Set(prev).add(article.id));
        playSound("paper");

        // Simpan ke Riwayat (LocalStorage)
        const history = JSON.parse(localStorage.getItem("reading_history") || "[]");
        const isAlreadyRead = history.find((h: any) => h.id === article.id);
        
        if (!isAlreadyRead) {
          const newHistory = [
            { 
              id: selectedId, 
              title: selectedArticle.title, 
              date: selectedArticle.date, 
              category: selectedArticle.category_label || selectedArticle.category,
              slug: selectedArticle.slug 
            },
            ...history
          ].slice(0, 20);
          localStorage.setItem("reading_history", JSON.stringify(newHistory));
        }
      }
    };

    const desktopContainer = previewScrollRef.current;
    const mobileContainer = mobileScrollRef.current;

    desktopContainer?.addEventListener("scroll", checkScroll);
    mobileContainer?.addEventListener("scroll", checkScroll);

    return () => {
      desktopContainer?.removeEventListener("scroll", checkScroll);
      mobileContainer?.removeEventListener("scroll", checkScroll);
    };
  }, [selectedId, hasRewarded, rewardedIds, playSound]);

  return (
    <div 
      className="min-h-screen relative p-4 md:p-6 md:px-20 flex items-center justify-center overflow-hidden transition-all duration-1000"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      
      {/* Click Outside Overlay Layer (Desktop) */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-10 bg-slate-400/5 backdrop-blur-[2px] transition-all duration-500 hidden md:block"
          onClick={closePreview}
        />
      )}

      {/* Main Layout Container */}
      <div className={`flex flex-col md:flex-row items-center justify-center gap-8 px-2 md:px-6 transition-all duration-700 ease-in-out z-20 w-full ${isPreviewOpen ? "max-w-7xl" : "max-w-[480px]"}`}>
        
        {/* Panel Kiri: List Artikel */}
        <div className={`w-full md:w-[400px] flex flex-col gap-6 transition-all duration-700 relative`}>
          <div className="glass rounded-[2.5rem] p-8 flex flex-col h-[85vh] md:h-[80vh] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 relative z-30">
            {/* Header didalam container */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                  ENoted
                </h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Portal Inspirasi & Tutorial</p>
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  href="/profile" 
                  onClick={() => playSound("paper")}
                  className="p-2 text-slate-400 hover:text-softblue-600 hover:bg-softblue-50 rounded-xl transition-all group relative"
                  title="Lihat Profil & Pencapaian"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-white rounded-full animate-pulse" />
                </Link>
                
                {/* Mobile Hamburger Menu */}
              <div className="md:hidden relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  }}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition-all active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {isMobileMenuOpen ? (
                      <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                    ) : (
                      <><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></>
                    )}
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 glass rounded-3xl overflow-hidden shadow-2xl border border-white/60 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col p-2">
                       {user ? (
                         <>
                           <div className="px-4 py-3 border-b border-slate-100/50 mb-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin</p>
                              <p className="text-[10px] font-black text-slate-700 truncate">{user.email}</p>
                           </div>
                           <Link href="/admin/blog/create" className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              <span className="text-xs font-bold uppercase tracking-wider">Tulis Baru</span>
                           </Link>
                           <Link href="/admin/blog/manage" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                              <span className="text-xs font-bold uppercase tracking-wider">Kelola Blog</span>
                           </Link>
                           <button 
                             onClick={() => supabase.auth.signOut()} 
                             className="flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-all text-left"
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                              <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
                           </button>
                         </>
                       ) : (
                         <Link href="/login" className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                            <span className="text-xs font-bold uppercase tracking-wider">Login Admin</span>
                         </Link>
                       )}
                    </div>
                  </div>
                )}
              </div>
              </div>
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
                    image_url={art.image_url}
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
          
          {/* FAB Control Group (Desktop ONLY) */}
          <div className="hidden md:flex absolute bottom-8 -left-14 z-50 flex-col-reverse gap-3 transition-all duration-500">
            <AuthFAB isLoggedIn={!!user} className="relative group transition-all" />
            <SettingsFAB className="relative group transition-all" />
            {user && (
              <>
                <ManageFAB className="relative group transition-all" />
                <AdminFAB className="relative group transition-all" />
              </>
            )}
          </div>
        </div>

        {/* Panel Kanan: Detail Pratinjau (Desktop) */}
        <div className={`hidden md:flex flex-col flex-1 transition-all duration-700 h-[80vh] ${isPreviewOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 translate-x-12 w-0 overflow-hidden pointer-events-none"}`}>
          {selectedArticle && (
            <div className="glass rounded-[2.5rem] w-full h-full overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative z-40 border border-white/60" onClick={(e) => e.stopPropagation()}>
              {/* Header Kontrol Panel */}
              <div className="flex items-center justify-between px-6 py-2.5 bg-white/60 border-b border-slate-100/50 backdrop-blur-xl">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                    {greeting}
                 </div>
                 <div className="flex items-center gap-1 justify-end">
                   {/* Share */}
                   <button onClick={handleShare} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Bagikan">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                   </button>
                   {/* Full View */}
                   <Link href={`/blog/${selectedArticle.slug}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Tampilan Penuh">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                   </Link>
                   {/* Close */}
                   <button onClick={closePreview} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Tutup">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                   </button>
                 </div>
              </div>
              
              <div 
                ref={previewScrollRef}
                className="flex-grow overflow-y-auto p-8 bg-white/30 custom-scrollbar"
              >
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
                  
                  {selectedArticle.image_url && (
                    <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl border border-white/60 animate-in fade-in zoom-in duration-1000">
                      <img 
                        src={selectedArticle.image_url} 
                        alt={selectedArticle.title}
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <p className="text-sm text-slate-500 leading-relaxed mb-6 italic font-medium text-left">
                      {selectedArticle.summary}
                    </p>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full mb-8" />
                    <MarkdownRenderer 
                      content={selectedArticle.content} 
                      className="prose-sm !text-slate-800"
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
              <div 
                ref={mobileScrollRef}
                className="flex-grow overflow-y-auto p-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em]">{selectedArticle.category_label || selectedArticle.category}</span>
                  <span className="text-[10px] text-slate-400 font-medium opacity-60">• {selectedArticle.date}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-5 leading-tight">{selectedArticle.title}</h2>
                
                {selectedArticle.image_url && (
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                    <img 
                      src={selectedArticle.image_url} 
                      alt={selectedArticle.title}
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}

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

      {/* Reward Achievement Card */}
      <div className={`fixed bottom-8 left-8 z-[110] transition-all duration-700 transform ${hasRewarded ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}>
        <div className="glass p-6 rounded-[2rem] shadow-2xl border border-white/60 flex items-center gap-5 max-w-sm group">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:rotate-12 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Pratinjau Selesai!</h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Kamu sangat bersemangat! +1 Inspirasi terkunci dari pratinjau ini.
            </p>
          </div>
          <button 
            onClick={() => setHasRewarded(false)}
            className="absolute -top-2 -right-2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
