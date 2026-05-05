"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSound } from "@/context/SoundContext";

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  category: string;
  slug: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { playSound } = useSound();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  // Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("E-Noter Sejati");
  const [bio, setBio] = useState("Menjelajahi dunia lewat kata-kata dan baris kode.");
  const [bgGradient, setBgGradient] = useState("from-softblue-500/10 to-transparent");
  const [bgType, setBgType] = useState<"gradient" | "image">("gradient");
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");
    if (savedProfile.name) setName(savedProfile.name);
    if (savedProfile.bio) setBio(savedProfile.bio);
    if (savedProfile.bgGradient) setBgGradient(savedProfile.bgGradient);
    if (savedProfile.bgType) setBgType(savedProfile.bgType);
    if (savedProfile.bgImage) setBgImage(savedProfile.bgImage);
    // Load history from localStorage
    const savedHistory = JSON.parse(localStorage.getItem("reading_history") || "[]");
    setHistory(savedHistory);

    // Calculate achievements based on history
    const badges = [];
    if (savedHistory.length >= 1) badges.push("Inisiator");
    if (savedHistory.length >= 5) badges.push("Kutu Buku");
    if (savedHistory.filter((h: any) => h.category === "islam").length >= 3) badges.push("Thalabul Ilmi");
    if (savedHistory.filter((h: any) => h.category === "belajar-koding" || h.category === "Tutorial").length >= 3) badges.push("Kodinger");
    
    setAchievements(badges);
  }, []);

  const badgeIcons: Record<string, React.ReactNode> = {
    "Inisiator": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
    "Kodinger": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  };

  const saveProfile = () => {
    localStorage.setItem("user_profile", JSON.stringify({ name, bio, bgGradient, bgType, bgImage }));
    setIsEditing(false);
    playSound("paper");
  };

  const gradients = [
    { label: "Soft Blue", value: "from-softblue-500/10 to-transparent", preview: "bg-softblue-500" },
    { label: "Emerald", value: "from-emerald-500/10 to-transparent", preview: "bg-emerald-500" },
    { label: "Rose", value: "from-rose-500/10 to-transparent", preview: "bg-rose-500" },
    { label: "Amber", value: "from-amber-500/10 to-transparent", preview: "bg-amber-500" },
    { label: "Indigo", value: "from-indigo-500/10 to-transparent", preview: "bg-indigo-500" },
  ];

  const images = [
    { label: "Pagi", value: "/img/pagi.png" },
    { label: "Siang", value: "/img/siang.png" },
    { label: "Sore", value: "/img/sore.png" },
    { label: "Malam", value: "/img/malam.png" },
    { label: "Abstract", value: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000" },
  ];

  // Map background for full page based on selection
  const getPageBg = () => {
    const color = bgGradient.split('-')[1]; // e.g. softblue, emerald
    return `bg-${color}-50/30`;
  };

  return (
    <div className={`min-h-screen p-6 md:p-12 transition-all duration-1000 relative overflow-hidden ${bgType === "image" ? "bg-slate-900" : "bg-slate-50"}`}>
      {/* Dynamic Page Background Glow / Image */}
      {bgType === "image" && bgImage ? (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-fixed pointer-events-none transition-all duration-1000 scale-100" 
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      ) : (
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${bgGradient} opacity-50 pointer-events-none transition-all duration-1000`} />
      )}
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Profil */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => { playSound("close"); router.push("/"); }}
            className="p-3 bg-white shadow-xl rounded-2xl text-slate-400 hover:text-emerald-600 transition-all hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-[0.3em]">Profil Pembaca</h1>
          <div className="w-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel Kiri: Bio */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="glass rounded-[3rem] p-10 text-center border border-white shadow-2xl relative overflow-hidden group">
              {/* Profile Background Preview */}
              {bgType === "image" && bgImage ? (
                <div 
                  className="absolute top-0 left-0 w-full h-40 bg-cover bg-center opacity-60 transition-all duration-700" 
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
              ) : (
                <div className={`absolute top-0 left-0 w-full h-40 bg-gradient-to-b ${bgGradient} transition-all duration-700`} />
              )}
              
              {/* Edit Button */}
              <button 
                onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
                className="absolute top-6 right-6 z-20 p-2.5 bg-white/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm border border-white transition-all active:scale-90"
              >
                {isEditing ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                )}
              </button>

              <div className="relative z-10 pt-4">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center shadow-2xl border-4 border-white transform group-hover:rotate-3 transition-all duration-500 overflow-hidden">
                   <div className={`w-full h-full bg-gradient-to-br ${bgGradient.replace('/10', '')} flex items-center justify-center text-white text-3xl font-black`}>
                      {name.charAt(0).toUpperCase()}
                   </div>
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-4 mb-6">
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Tuan"
                      className="w-full px-4 py-2 bg-white/50 border border-slate-100 rounded-xl text-center font-black text-slate-800 outline-none focus:border-indigo-300 transition-all"
                    />
                    <textarea 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Bio singkat..."
                      className="w-full px-4 py-2 bg-white/50 border border-slate-100 rounded-xl text-center text-xs font-medium text-slate-500 outline-none focus:border-indigo-300 transition-all resize-none h-20"
                    />
                    
                    {/* Background Selection */}
                    <div className="mt-4 pt-4 border-t border-slate-100/50">
                       <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Tipe Background</p>
                       <div className="flex justify-center gap-4 mb-4">
                          <button 
                            onClick={() => setBgType("gradient")}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${bgType === "gradient" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-100 text-slate-400"}`}
                          >
                            Warna
                          </button>
                          <button 
                            onClick={() => setBgType("image")}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${bgType === "image" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-100 text-slate-400"}`}
                          >
                            Gambar
                          </button>
                       </div>

                       {bgType === "gradient" ? (
                         <div className="flex flex-wrap justify-center gap-3">
                            {gradients.map((g) => (
                              <button
                                key={g.value}
                                onClick={() => setBgGradient(g.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${bgGradient === g.value ? "border-slate-800 scale-125 z-10" : "border-white hover:scale-110"} ${g.preview}`}
                                title={g.label}
                              />
                            ))}
                         </div>
                       ) : (
                         <div className="flex flex-wrap justify-center gap-2">
                            {images.map((img) => (
                              <button
                                key={img.value}
                                onClick={() => setBgImage(img.value)}
                                className={`w-10 h-10 rounded-xl border-2 transition-all bg-cover bg-center shadow-sm ${bgImage === img.value ? "border-indigo-600 scale-110" : "border-white"}`}
                                style={{ backgroundImage: `url(${img.value})` }}
                                title={img.label}
                              />
                            ))}
                         </div>
                       )}
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">{name}</h2>
                    <p className="text-sm text-slate-400 font-medium mb-6 italic px-4 leading-relaxed">"{bio}"</p>
                  </>
                )}
                
                <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-100/50">
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-800">{history.length}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Dibaca</p>
                  </div>
                  <div className="w-px h-6 bg-slate-100" />
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-800">{achievements.length}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Achievement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="glass rounded-[2.5rem] p-8 border border-white shadow-xl">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Pencapaian</h3>
              <div className="grid grid-cols-2 gap-4">
                {["Inisiator", "Kutu Buku", "Thalabul Ilmi", "Kodinger"].map((b) => (
                  <div 
                    key={b}
                    className={`p-4 rounded-3xl flex flex-col items-center gap-2 transition-all duration-500 ${achievements.includes(b) ? "bg-softblue-50 text-softblue-600 border border-softblue-100 shadow-lg shadow-softblue-500/5 scale-105" : "bg-slate-50 text-slate-300 opacity-50 border border-slate-100 grayscale"}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${achievements.includes(b) ? "bg-softblue-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                      {badgeIcons[b]}
                    </div>
                    <span className="text-[10px] font-black uppercase text-center tracking-tighter">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Kanan: History */}
          <div className="lg:col-span-2">
            <div className="glass rounded-[3rem] p-10 border border-white shadow-2xl h-full min-h-[600px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Riwayat Membaca</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-lg uppercase">Terbaru</span>
              </div>

              {history.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {history.map((item, i) => (
                    <Link 
                      href={`/blog/${item.slug}`} 
                      key={i}
                      className="group flex items-center justify-between p-6 bg-white/50 hover:bg-white rounded-3xl border border-slate-100 hover:border-softblue-200 hover:shadow-xl hover:shadow-softblue-500/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-softblue-50 group-hover:text-softblue-600 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-softblue-600 transition-colors mb-1">{item.title}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-softblue-400 uppercase tracking-widest">{item.category}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-300 group-hover:text-softblue-500 group-hover:translate-x-1 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center opacity-40">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                   </div>
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Belum ada riwayat membaca</p>
                   <p className="text-xs text-slate-400 mt-2">Selesaikan satu artikel untuk mulai membangun profilmu!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
