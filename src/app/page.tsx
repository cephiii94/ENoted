import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full max-w-4xl px-4 py-20 flex flex-col items-center">
      {/* Header / Brand */}
      <div className="glass px-8 py-4 rounded-2xl mb-16 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-softblue-600 to-softblue-400 bg-clip-text text-transparent">
          ENoted
        </h1>
        <p className="text-softblue-500 font-medium tracking-wide">Portal Informasi & Tutorial</p>
      </div>

      {/* Hero Section */}
      <section className="glass p-10 md:p-16 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden animate-in fade-in zoom-in duration-1000">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-softblue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-softblue-300/20 rounded-full blur-3xl" />
        
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
          Selamat Datang di <span className="text-softblue-500">Versi Baru</span>
        </h2>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Kami sedang memproses migrasi konten dari versi lama ke versi modern ini. 
          Nikmati pengalaman membaca yang lebih cepat, bersih, dan menenangkan dengan ENoted.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-softblue-500 hover:bg-softblue-600 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-softblue-500/25 transition-all hover:scale-105 active:scale-95">
            Jelajahi Artikel
          </button>
          <button className="glass bg-white/20 hover:bg-white/30 border-white/40 text-softblue-700 dark:text-softblue-200 px-8 py-3 rounded-full font-medium transition-all hover:scale-105 active:scale-95">
            Tentang Kami
          </button>
        </div>
      </section>

      {/* Categories Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
        {['Koding', 'Tutorial', 'Islam'].map((cat, i) => (
          <div 
            key={cat} 
            className="glass p-6 rounded-3xl flex flex-col items-center hover:bg-white/30 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${(i + 1) * 200}ms` }}
          >
            <div className="w-12 h-12 rounded-2xl bg-softblue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-softblue-600 font-bold text-xl">{cat[0]}</span>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{cat}</h3>
          </div>
        ))}
      </div>
      
      <footer className="mt-20 text-slate-400 text-sm">
        &copy; 2026 ENoted. Project Baru Berbasis Next.js.
      </footer>
    </div>
  );
}
