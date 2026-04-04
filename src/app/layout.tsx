import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { SoundProvider } from "@/context/SoundContext";

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
      <body className="font-outfit min-h-screen selection:bg-softblue-200 selection:text-softblue-900 relative">
        <SoundProvider>
          <DynamicBackground />
          
          {/* Soft Blue Overlays for Premium Look */}
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--color-softblue-100),_transparent_60%)] opacity-40 pointer-events-none" />
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--color-softblue-50),_transparent_60%)] opacity-40 pointer-events-none" />
          
          <main className="relative z-10 w-full h-full">
            {children}
          </main>
        </SoundProvider>
      </body>
    </html>
  );
}
