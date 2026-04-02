import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ENoted - Portal Inspirasi & Tutorial",
  description: "Kumpulan artikel bermanfaat tentang berbagi, tutorial, dan konten inspirasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable} antialiased`}>
      <body className="font-outfit min-h-screen gradient-bg selection:bg-softblue-200 selection:text-softblue-900 flex flex-col">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--color-softblue-100),_transparent_50%)] opacity-50 pointer-events-none" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--color-softblue-50),_transparent_50%)] opacity-50 pointer-events-none" />
        
        {/* Navbar akan diatur per halaman agar bisa menghandle filter State jika diperlukan, 
            namun Footer diletakkan di global layout */}
        
        <main className="relative flex-grow flex flex-col items-center pt-32 md:pt-40">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
