"use client";

import React, { useState } from "react";
import { useSound } from "@/context/SoundContext";
import Toast from "./Toast";

interface SettingsFABProps {
  className?: string;
}

export default function SettingsFAB({ className }: SettingsFABProps) {
  const { isMuted, toggleMute, playSound } = useSound();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleToggle = () => {
    playSound("click");
    toggleMute();
    setToastMessage(!isMuted ? "Suara Dimatikan" : "Suara Diaktifkan");
    setShowToast(true);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={className || "fixed bottom-8 left-8 z-50 group flex items-center justify-center"}
        title={isMuted ? "Aktifkan Suara" : "Bisukan Suara"}
      >
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative w-12 h-12 bg-white/80 backdrop-blur-md border border-white/50 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/10 group-hover:scale-110 group-active:scale-95 transition-all duration-300">
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          )}
        </div>
      </button>

      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </>
  );
}
