"use client";

import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthFABProps {
  className?: string;
  isLoggedIn: boolean;
}

export default function AuthFAB({ className, isLoggedIn }: AuthFABProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (isLoggedIn) {
    return (
      <button
        onClick={handleLogout}
        className={className || "fixed bottom-8 left-8 z-50 group flex items-center justify-center"}
        title="Logout"
      >
        <div className="absolute inset-0 bg-rose-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative w-12 h-12 bg-white/80 backdrop-blur-md border border-white/50 rounded-xl flex items-center justify-center shadow-xl shadow-rose-500/10 group-hover:scale-110 group-hover:-rotate-6 group-active:scale-95 transition-all duration-300">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-rose-500"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className={className || "fixed bottom-8 left-8 z-50 group flex items-center justify-center"}
      title="Login Admin"
    >
      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative w-12 h-12 bg-white/80 backdrop-blur-md border border-white/50 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/10 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95 transition-all duration-300">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-indigo-600"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
    </Link>
  );
}
