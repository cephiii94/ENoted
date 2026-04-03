"use client";

import React from "react";
import Link from "next/link";

interface AdminFABProps {
  className?: string;
}

export default function AdminFAB({ className }: AdminFABProps) {
  return (
    <Link
      href="/admin/blog/create"
      className={className || "fixed bottom-8 left-8 z-50 group flex items-center justify-center"}
    >
      <div className="absolute inset-0 bg-emerald-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative w-12 h-12 bg-white/80 backdrop-blur-md border border-white/50 rounded-xl flex items-center justify-center shadow-xl shadow-emerald-500/10 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95 transition-all duration-300">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-emerald-600"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
    </Link>
  );
}
