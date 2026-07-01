import React from "react";

export default function Footer() {
  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md py-2.5 px-6 rounded-full border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] flex items-center justify-center transition-all duration-300">
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
            Brich Digital (brichdigital.zone.id)
          </a>
        </span>
      </div>
    </footer>
  );
}
