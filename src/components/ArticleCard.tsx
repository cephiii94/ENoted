import React from "react";
import Link from "next/link";

interface ArticleCardProps {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  imageUrl?: string;
  slug: string;
}

export default function ArticleCard({
  title,
  summary,
  category,
  date,
  imageUrl,
  slug,
}: ArticleCardProps) {
  // Helper to get category color
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "koding":
        return "bg-blue-100/50 text-blue-600 border-blue-200/50";
      case "tutorial":
        return "bg-amber-100/50 text-amber-600 border-amber-200/50";
      case "islam":
        return "bg-emerald-100/50 text-emerald-600 border-emerald-200/50";
      default:
        return "bg-slate-100/50 text-slate-600 border-slate-200/50";
    }
  };

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block relative overflow-hidden glass rounded-[2rem] border-white/30 hover:border-softblue-300/40 hover:bg-white/30 transition-all duration-500 shadow-xl shadow-softblue-500/5 group-hover:shadow-2xl group-hover:shadow-softblue-500/10 group-hover:-translate-y-2"
    >
      {/* Decorative top-right circle */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-softblue-200/20 rounded-full blur-2xl group-hover:bg-softblue-300/30 transition-all duration-500" />
      
      <div className="p-8 h-full flex flex-col items-start justify-between">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${getCategoryColor(category)}`}>
              {category}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{date}</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 leading-tight group-hover:text-softblue-700 dark:group-hover:text-softblue-400 transition-colors duration-300">
            {title}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">
            {summary}
          </p>
        </div>

        <div className="w-full pt-6 border-t border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between">
          <span className="text-xs font-bold text-softblue-600 dark:text-softblue-400 group-hover:mr-2 transition-all duration-300">
            Baca Selengkapnya
          </span>
          <div className="w-8 h-8 rounded-full bg-softblue-500/10 flex items-center justify-center group-hover:bg-softblue-500 transition-colors duration-300">
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               className="h-4 w-4 text-softblue-600 dark:text-softblue-400 group-hover:text-white transition-colors duration-300" 
               fill="none" 
               viewBox="0 0 24 24" 
               stroke="currentColor"
             >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
