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

      // Header Visibility (Hide on scroll down, show on scroll up)
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
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
          className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-softblue-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Back Button & Header */}
      <header className={`fixed top-4 left-0 w-full px-6 md:px-12 z-[90] transition-all duration-500 ${isHeaderVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => {
              playSound("close");
              router.push("/");
            }}
            className="group flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl text-slate-600 hover:text-emerald-600 font-bold transition-all hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span className="text-sm">Beranda</span>
          </button>

          <div className="hidden md:flex items-center gap-4">
             <span className="px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] rounded-2xl">
                {article.date}
             </span>
          </div>
        </div>
      </header>

      {/* Hero Section (Title Area) */}
      <section className="pt-32 pb-16 px-6 md:px-12 text-center max-w-4xl mx-auto">
         <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
           <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-xl border border-emerald-500/10 uppercase tracking-[0.3em] mb-8 inline-block">
              {article.category_label || article.category}
           </span>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] md:leading-[1.15] mb-8 tracking-tight">
              {article.title}
           </h1>
           <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed italic opacity-80">
              {article.summary}
           </p>
         </div>
      </section>

      {/* Main Content Area */}
      <main className="px-4 md:px-6 pb-32">
        <div className="max-w-4xl mx-auto">
           <div className="glass rounded-[3rem] p-8 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white/60 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             
             {/* Article Separator */}
             <div className="flex items-center gap-4 mb-16 opacity-30">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-indigo-500" />
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-500 to-transparent" />
             </div>

             <article className="prose prose-slate max-w-none prose-p:text-lg md:prose-p:text-xl prose-p:leading-[1.9] prose-p:text-slate-700 prose-headings:font-black prose-headings:tracking-tight prose-a:text-emerald-600 prose-img:rounded-3xl prose-img:shadow-2xl">
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
    </div>
  );
}
