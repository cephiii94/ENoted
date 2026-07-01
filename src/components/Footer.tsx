import React from "react";

export default function Footer() {
  const links = [
    { name: "Game", url: "https://my1game.netlify.app" },
    { name: "Vidtapz", url: "https://vidtapz.netlify.app" },
    { name: "Chatbot", url: "/chatbot" },
  ];

  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md md:max-w-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md py-3 px-6 rounded-full border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 transition-all duration-300">
      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-800 dark:text-slate-200">
        <span>&copy; {new Date().getFullYear()} ENoted.</span>
        <span className="opacity-40">•</span>
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

      <div className="flex items-center gap-4 text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-softblue-600 dark:hover:text-softblue-400 transition-colors duration-300"
          >
            {link.name}
          </a>
        ))}
      </div>
    </footer>
  );
}
