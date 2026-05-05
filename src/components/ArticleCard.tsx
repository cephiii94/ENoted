"use client";

import React from "react";

interface ArticleCardProps {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  image_url?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ArticleCard({
  title,
  category,
  date,
  image_url,
  isSelected,
  onClick,
}: ArticleCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl active:scale-[0.98] ${
        isSelected ? "ring-2 ring-emerald-500 shadow-lg" : ""
      }`}
    >
      {/* Post Indicator Strip (Emerald) */}
      <div className={`absolute left-0 top-0 w-1.5 h-full transition-transform duration-500 origin-top z-10 ${
        isSelected ? "scale-y-100 bg-emerald-500" : "scale-y-0 group-hover:scale-y-100 bg-emerald-400"
      }`} />
      
      <div className="flex flex-col gap-4 text-left">
        {image_url && (
          <div className="relative h-32 -mx-6 -mt-6 mb-2 overflow-hidden">
            <img 
              src={image_url} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
          </div>
        )}
        
        <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] opacity-80">
            {category}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{date}</span>
        </div>
        
        <h3 className={`text-base md:text-lg font-bold leading-tight transition-colors duration-300 ${
          isSelected ? "text-emerald-800" : "text-slate-900 group-hover:text-emerald-600"
        }`}>
          {title}
        </h3>

        {/* Small hint of summary if not selected? No, keeping it clean */}
      </div>
    </div>
  </div>
  );
}
