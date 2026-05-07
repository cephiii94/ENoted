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
      className={`group relative shrink-0 overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl active:scale-[0.98] ${
        isSelected ? "ring-2 ring-softblue-500 shadow-lg" : ""
      }`}
    >
      {/* Post Indicator Strip (Emerald) */}
      <div className={`absolute left-0 top-0 w-1.5 h-full transition-transform duration-500 origin-top z-10 ${
        isSelected ? "scale-y-100 bg-softblue-500" : "scale-y-0 group-hover:scale-y-100 bg-softblue-400"
      }`} />
      
      <div className="flex flex-col gap-4 text-left">
        {/* Meta Info Top */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-softblue-600 uppercase tracking-[0.2em] opacity-80">
            {category}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">{date}</span>
        </div>

        <div className="flex gap-4 items-center justify-between">
          <h3 className={`flex-1 text-base md:text-lg font-bold leading-tight transition-colors duration-300 ${
            isSelected ? "text-softblue-800" : "text-slate-900 group-hover:text-softblue-600"
          }`}>
            {title}
          </h3>

          {image_url && (
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100 group-hover:shadow-md transition-all duration-500">
              <img 
                src={image_url} 
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
