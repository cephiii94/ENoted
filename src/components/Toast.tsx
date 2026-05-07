"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="glass px-6 py-3 rounded-2xl shadow-2xl border border-white/60 flex items-center gap-3">
         <div className="w-2 h-2 rounded-full bg-softblue-500 animate-pulse" />
         <span className="text-sm font-bold text-slate-700">{message}</span>
      </div>
    </div>
  );
}
