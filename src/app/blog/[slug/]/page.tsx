"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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

export default function ArticleDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 gradient-bg">
        <div className="glass rounded-[2.5rem] p-12 max-w-2xl w-full animate-pulse flex flex-col gap-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-64 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mt-4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 gradient-bg">
        <h1 className="text-2xl font-bold mb-4">Artikel tidak ditemukan.</h1>
        <Link href="/" className="px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all font-bold">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 md:p-12 gradient-bg overflow-y-auto">
      <div className="glass rounded-[2.5rem] max-w-4xl w-full shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in duration-700">
        
        {/* Header / Nav */}
        <div className="flex items-center justify-between px-8 py-6 bg-white/60 border-b border-slate-100/50 backdrop-blur-xl sticky top-0 z-10">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Beranda
          </button>
          
          <div className="flex items-center gap-2">
             <span className="hidden md:block text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/50">
               {article.date}
             </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-20 bg-white/30 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <div className="max-w-3xl mx-auto flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-8">
               <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] border border-emerald-500/10">
                  {article.category_label || article.category}
               </span>
               <span className="md:hidden text-[10px] text-slate-400 font-bold">{article.date}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-10 leading-[1.1] md:leading-[1.15]">
              {article.title}
            </h1>

            <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-[1.8] prose-p:text-slate-700">
              <p className="text-xl md:text-2xl text-slate-500 italic mb-12 font-medium border-l-4 border-emerald-500/30 pl-6 py-2">
                {article.summary}
              </p>
              
              <div className="h-0.5 w-32 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full mb-16 opacity-30" />
              
              <MarkdownRenderer 
                content={article.content} 
                className="prose-lg md:prose-xl" 
              />
            </div>

            {/* Footer Page */}
            <div className="mt-24 pt-12 border-t border-slate-200/50 w-full flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
               <p className="text-sm font-medium text-slate-400">© 2024 ENoted. Hak Cipta Dilindungi.</p>
               <div className="flex gap-4">
                  <Link href="/" className="text-sm font-bold text-emerald-600 hover:underline">Suka artikel ini? Kembali berbagi</Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
