// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: "#0a0b10",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ARMovie | Plataforma Premium de Streaming",
  description: "Disfruta de las mejores películas, series y animes en alta calidad.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={cn(
        "min-h-screen font-inter antialiased selection:bg-blue-500/30",
        inter.variable,
        outfit.variable
      )}>
        <Navbar />
        <div className="max-w-[1920px] mx-auto min-h-[calc(100vh-200px)]">
          {children}
        </div>
        <footer className="py-12 border-t border-white/5 bg-black/20 text-center text-zinc-500 text-sm">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/dmca" className="hover:text-zinc-300 transition-colors">DMCA</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacidad</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} ARMOVIE. Todos los derechos reservados.</p>
          <p className="mt-2 text-zinc-600 flex items-center justify-center gap-1.5">
            Powered by <span className="text-zinc-400 font-bold">TMDB</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
