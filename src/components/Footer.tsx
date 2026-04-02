import React from "react";

export default function Footer() {
  const links = [
    { name: "Game", url: "https://my1game.netlify.app" },
    { name: "Vidtapz", url: "https://vidtapz.netlify.app" },
    { name: "Chatbot", url: "/chatbot" },
  ];

  return (
    <footer className="w-full py-12 px-6 flex flex-col items-center gap-8 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md rounded-t-[3rem] mt-24 border-t border-white/20">
      <div className="flex flex-wrap justify-center gap-6 md:gap-12">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-500 hover:text-softblue-500 transition-colors duration-300"
          >
            {link.name}
          </a>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} ENoted. All rights reserved.
        </p>
        <div className="h-px w-8 bg-softblue-200" />
      </div>
    </footer>
  );
}
