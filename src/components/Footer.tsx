"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isBlogPage = pathname?.startsWith("/blog/");
  const [isVisible, setIsVisible] = useState(!isBlogPage);

  useEffect(() => {
    if (!isBlogPage) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (totalHeight <= 0) {
        setIsVisible(true);
        return;
      }
      
      const progress = (window.scrollY / totalHeight) * 100;
      if (progress >= 98) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, isBlogPage]);

  return (
    <footer 
      className={`fixed bottom-4 left-1/2 z-40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md py-2.5 px-6 rounded-full border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transform: isVisible 
          ? "translate(-50%, 0)" 
          : "translate(-50%, 40px)",
      }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-[11px] font-medium text-slate-800 dark:text-slate-200 text-center">
        <span>&copy; {new Date().getFullYear()} ENoted. All rights reserved.</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span>
          Powered by{" "}
          <a
            href="https://brichdigital.zone.id"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-softblue-600 hover:text-softblue-700 transition-colors duration-300"
          >
            Brich Digital
          </a>
        </span>
      </div>
    </footer>
  );
}
