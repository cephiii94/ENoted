"use client";

import React from "react";
import Link from "next/link";

interface NavbarProps {
  currentCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const categories = [
  { id: "semua", name: "Semua" },
  { id: "belajar-koding", name: "Koding" },
  { id: "tutorial", name: "Tutorial" },
  { id: "islam", name: "Islam" },
];

export default function Navbar({ currentCategory = "semua", onCategoryChange }: NavbarProps) {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      <div className="glass px-6 py-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 border-white/40 shadow-2xl shadow-softblue-500/10 transition-all duration-300">
        <div className="flex flex-col">
          <Link href="/" className="group flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-softblue-700 to-softblue-500 bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform">
              ENoted
            </h1>
            <p className="text-[10px] text-softblue-500 font-semibold uppercase tracking-widest opacity-80">
              Portal Inspirasi
            </p>
          </Link>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-1 p-1 bg-softblue-100/50 dark:bg-slate-800/50 rounded-2xl border border-white/30">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange?.(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                currentCategory === cat.id
                  ? "bg-softblue-500 text-white shadow-lg shadow-softblue-500/30 scale-105"
                  : "text-softblue-700 dark:text-softblue-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/admin/login" 
            className="text-xs font-medium text-slate-500 hover:text-softblue-600 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
