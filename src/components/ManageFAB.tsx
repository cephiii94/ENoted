"use client";

import React from "react";
import Link from "next/link";

interface ManageFABProps {
  className?: string;
}

export default function ManageFAB({ className }: ManageFABProps) {
  return (
    <Link
      href="/admin/blog/manage"
      className={className || "fixed bottom-8 left-8 z-50 group flex items-center justify-center"}
      title="Kelola Artikel"
    >
      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative w-14 h-14 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/10 group-hover:scale-110 group-hover:-rotate-6 group-active:scale-95 transition-all duration-300">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-indigo-600"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </div>
    </Link>
  );
}
