"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (type: 'click' | 'paper' | 'close' | 'expand') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  // Load prefix status dari localStorage
  useEffect(() => {
    const savedMute = localStorage.getItem("enoted-muted");
    if (savedMute !== null) {
      setIsMuted(savedMute === "true");
    }
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newState = !prev;
      localStorage.setItem("enoted-muted", String(newState));
      return newState;
    });
  };

  const playSound = useCallback((type: 'click' | 'paper' | 'close' | 'expand') => {
    if (isMuted) return;

    let url = "";
    switch (type) {
      case 'click':
        url = "/audio/click.wav";
        break;
      case 'paper':
        url = "/audio/paper.wav";
        break;
      case 'close':
        url = "/audio/close.wav";
        break;
      case 'expand':
        url = "/audio/expand.wav";
        break;
    }

    if (url) {
      const audio = new Audio(url);
      audio.volume = 0.4; // Atur volume agar tidak terlalu keras
      audio.play().catch(err => console.warn("Audio play blocked by browser:", err));
    }
  }, [isMuted]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};
