"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";

// Mock data for initial development (Tahap 4)
const MOCK_ARTICLES = [
  {
    id: "1",
    title: "Memulai Perjalanan Koding dengan Next.js",
    summary: "Pelajari langkah-langkah awal membangun aplikasi web modern menggunakan Next.js 14, Tailwind CSS, dan TypeScript.",
    category: "belajar-koding",
    categoryLabel: "Koding",
    date: "25 Maret 2024",
    slug: "memulai-nextjs",
  },
  {
    id: "2",
    title: "Ketenangan Hati dalam Mengingat Allah",
    summary: "Mencari kedamaian sejati melalui dzikir dan refleksi spiritual di tengah hiruk pikuk dunia modern yang serba cepat.",
    category: "islam",
    categoryLabel: "Islam",
    date: "20 Maret 2024",
    slug: "ketenangan-hati",
  },
  {
    id: "3",
    title: "10 Tips Produktivitas untuk Developer",
    summary: "Bagaimana cara menjaga fokus dan efisiensi saat bekerja remote? Simak tips praktis yang bisa langsung Anda terapkan.",
    category: "tutorial",
    categoryLabel: "Tutorial",
    date: "18 Maret 2024",
    slug: "tips-produktivitas",
  },
  {
    id: "4",
    title: "Memahami Konsep Clean Code",
    summary: "Menulis kode bukan hanya soal 'jalan', tapi soal kemudahan untuk dibaca dan dipelihara di masa depan.",
    category: "belajar-koding",
    categoryLabel: "Koding",
    date: "15 Maret 2024",
    slug: "clean-code",
  },
  {
    id: "5",
    title: "Adab Berinteraksi di Media Sosial",
    summary: "Menerapkan nilai-nilai kesantunan dan etika dalam berkomunikasi secara digital sesuai tuntunan agama.",
    category: "islam",
    categoryLabel: "Islam",
    date: "10 Maret 2024",
    slug: "adab-medsos",
  },
  {
    id: "6",
    title: "Tutorial Glassmorphism dengan Tailwind",
    summary: "Langkah demi langkah membuat efek kaca yang elegan dan modern hanya dengan utility classes dari Tailwind CSS.",
    category: "tutorial",
    categoryLabel: "Tutorial",
    date: "05 Maret 2024",
    slug: "tutorial-glassmorphism",
  },
];

export default function Home() {
  const [category, setCategory] = useState("semua");

  const filteredArticles = useMemo(() => {
    if (category === "semua") return MOCK_ARTICLES;
    return MOCK_ARTICLES.filter((art) => art.category === category);
  }, [category]);

  return (
    <>
      <Navbar currentCategory={category} onCategoryChange={setCategory} />
      
      <div className="w-full max-w-6xl px-6 pb-20">
        {/* Header Title Section */}
        <div className="flex flex-col items-center text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
          <h2 className="text-sm font-bold text-softblue-600 uppercase tracking-[0.3em] mb-4">
            Jelajahi Wawasan Baru
          </h2>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent mb-6 tracking-tight">
            Artikel Terbaru & Terpopuler
          </h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-softblue-500 to-transparent rounded-full" />
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((art, index) => (
              <div 
                key={art.id} 
                className="animate-in fade-in zoom-in duration-700 fill-mode-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ArticleCard
                  id={art.id}
                  title={art.title}
                  summary={art.summary}
                  category={art.categoryLabel}
                  date={art.date}
                  slug={art.slug}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center glass rounded-[3rem] border-dashed border-2">
              <p className="text-slate-400 font-medium">Belum ada artikel di kategori ini.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
