"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useSound } from "@/context/SoundContext";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  category_label: string;
  date: string;
  slug: string;
}

export default function ArticleFullView() {
  const { slug } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showFloatingTitle, setShowFloatingTitle] = useState(false);
  const [hasRewarded, setHasRewarded] = useState(false);
  const lastScrollY = useRef(0);
  const { playSound } = useSound();

  // Play expand sound on mount if technically already in full view
  useEffect(() => {
    playSound("paper");
  }, [playSound]);

  // Fetch article data
  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  // Handle Scroll Progress & Header Visibility
  useEffect(() => {
    const handleScroll = () => {
      // Progress Bar
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      // Floating Title Visibility
      if (window.scrollY > 400) {
        setShowFloatingTitle(true);
      } else {
        setShowFloatingTitle(false);
      }

      // Header Visibility (Hide on scroll down, show on scroll up)
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      // Reward Trigger
      if (progress > 98 && !hasRewarded && article) {
        setHasRewarded(true);
        playSound("paper");

        // Simpan ke Riwayat (LocalStorage)
        const history = JSON.parse(localStorage.getItem("reading_history") || "[]");
        const isAlreadyRead = history.find((h: any) => h.id === article.id);
        
        if (!isAlreadyRead) {
          const newHistory = [
            { 
              id: article.id, 
              title: article.title, 
              date: article.date, 
              category: article.category_label || article.category,
              slug: article.slug 
            },
            ...history
          ].slice(0, 20); // Simpan 20 terakhir
          localStorage.setItem("reading_history", JSON.stringify(newHistory));
        }
      }

      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-3xl w-full flex flex-col gap-8 animate-pulse">
           <div className="h-4 w-24 bg-softblue-200/50 rounded-full" />
           <div className="h-16 w-full bg-softblue-200/50 rounded-2xl" />
           <div className="h-4 w-full bg-softblue-200/50 rounded-lg" />
           <div className="h-4 w-3/4 bg-softblue-200/50 rounded-lg" />
           <div className="h-96 w-full bg-softblue-200/40 rounded-[2.5rem] mt-4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
        <div className="glass p-10 rounded-[2.5rem] shadow-2xl max-w-sm">
           <h1 className="text-2xl font-black text-slate-800 mb-4">Artikel Tidak Ditemukan</h1>
           <p className="text-slate-500 text-sm mb-8">Maaf, artikel yang Anda cari mungkin telah dipindahkan atau dihapus.</p>
           <button 
             onClick={() => router.push("/")}
             className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
           >
             Kembali ke Beranda
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      
      {/* Reading Progress Bar (Fixed Top) */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-white/10 backdrop-blur-sm">
        <div 
          className={`h-full transition-all duration-300 relative ${hasRewarded ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.5)]" : "bg-gradient-to-r from-emerald-500 via-indigo-500 to-softblue-500"}`}
          style={{ width: `${scrollProgress}%` }}
        >
          {hasRewarded && (
            <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
          )}
        </div>
      </div>

      {/* Floating Back Button & Header */}
      <header className={`fixed top-4 left-0 w-full px-4 md:px-12 z-[90] transition-all duration-500 ${isHeaderVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => {
              playSound("close");
              router.push("/");
            }}
            className="group flex items-center gap-3 px-4 py-2.5 md:px-5 md:py-3 bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl text-slate-600 hover:text-softblue-600 font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span className="text-sm hidden sm:inline">Beranda</span>
          </button>

          {/* Floating Title */}
          <div className={`flex-1 flex justify-center transition-all duration-500 ${showFloatingTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg px-6 py-2.5 rounded-2xl max-w-md w-full md:w-auto">
              <h2 className="text-sm font-black text-slate-800 truncate text-center tracking-tight">
                {article.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
             <span className="hidden md:block px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] rounded-2xl">
                {article.date}
             </span>
          </div>
        </div>
      </header>

      {/* Hero Section (Title Area) */}
      <section className="pt-32 pb-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="glass rounded-[3rem] p-8 md:p-16 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-white/60 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center relative z-10">
            <span className="px-4 py-2 bg-softblue-500/10 text-softblue-600 text-[10px] font-black rounded-xl border border-softblue-500/10 uppercase tracking-[0.3em] mb-8 inline-block">
               {article.category_label || article.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] md:leading-[1.15] mb-8 tracking-tight">
               {article.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80">
               {article.summary}
            </p>
          </div>

          {/* Chain Connectors */}
          <div className="absolute -bottom-12 left-12 md:left-24 flex flex-col items-center gap-1 z-0">
             <div className="w-3 h-8 rounded-full border-[3px] border-softblue-200/50 bg-white/20 shadow-sm" />
             <div className="w-3 h-8 rounded-full border-[3px] border-softblue-200/50 bg-white/20 shadow-sm -mt-3" />
          </div>
          <div className="absolute -bottom-12 right-12 md:right-24 flex flex-col items-center gap-1 z-0">
             <div className="w-3 h-8 rounded-full border-[3px] border-softblue-200/50 bg-white/20 shadow-sm" />
             <div className="w-3 h-8 rounded-full border-[3px] border-softblue-200/50 bg-white/20 shadow-sm -mt-3" />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="px-4 md:px-6 pb-32 relative">
        <div className="max-w-4xl mx-auto">
           <div className="glass rounded-[3rem] p-8 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white/60 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             
             {/* Article Separator */}
             <div className="flex items-center gap-4 mb-16 opacity-30">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-softblue-500" />
                <div className="w-2 h-2 rounded-full bg-softblue-500" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-softblue-500 to-transparent" />
             </div>

             <article className="prose prose-slate max-w-none prose-p:text-lg md:prose-p:text-xl prose-p:leading-[1.9] prose-p:text-slate-700 prose-headings:font-black prose-headings:tracking-tight prose-a:text-softblue-600 prose-img:rounded-3xl prose-img:shadow-2xl">
                <MarkdownRenderer content={article.content} />
             </article>

             {/* Footer article inside glass */}
             <div className="mt-24 pt-12 border-t border-slate-100/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                   <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Terima kasih telah membaca!</h4>
                      <p className="text-xs text-slate-400 font-medium">Semoga artikel ini bermanfaat untuk Anda dalam perjalanan inspirasi & koding.</p>
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Link berhasil disalin!");
                        }}
                        className="p-4 bg-softblue-50 text-softblue-600 hover:bg-softblue-100 rounded-2xl transition-all"
                        title="Bagikan Tautan"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                      </button>
                      <Link 
                        href="/"
                        onClick={() => playSound("close")}
                        className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all text-sm"
                      >
                         Kembali berbagi
                      </Link>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </main>

      {/* Bottom decorative section */}
      <footer className="py-20 text-center opacity-40">
         <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">© 2024 ENoted • Portal Inspirasi & Tutorial</p>
      </footer>

      {/* Reward Achievement Card */}
      <div className={`fixed bottom-8 left-8 z-[100] transition-all duration-700 transform ${hasRewarded ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}>
        <div className="glass p-6 rounded-[2rem] shadow-2xl border border-white/60 flex items-center gap-5 max-w-sm group">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:rotate-12 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Reward Diperoleh!</h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Inspirasi terkunci! +1 Pengetahuan untuk perjalanan Kamu hari ini.
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
