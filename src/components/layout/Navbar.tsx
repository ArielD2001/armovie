"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Películas', href: '/explore?type=movies' },
    { name: 'Series', href: '/explore?type=series' },
    { name: 'Anime', href: '/explore?type=animes' },
    { name: 'Mi Lista', href: '/watchlist' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-[100] transition-all duration-500 py-4",
      isScrolled ? "glass py-3" : "bg-transparent"
    )}>
      <div className="max-w-[1440px] mx-auto px-8 md:px-24 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-1 group">
          <span className="text-white">AR</span>
          <span className="text-blue-500 group-hover:text-blue-400 transition-colors">MOVIE</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden lg:flex items-center bg-white/10 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-blue-500/50 transition-all">
            <Search className="w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                }
              }}
              className="bg-transparent border-none outline-none text-sm ml-2 w-32 focus:w-48 transition-all"
            />
          </div>

          <button 
            className="lg:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => {
              setIsMobileSearchOpen(!isMobileSearchOpen);
              if (isMobileMenuOpen) setIsMobileMenuOpen(false);
            }}
          >
            <Search className="w-5 h-5" />
          </button>

          <button 
            className="lg:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              if (isMobileSearchOpen) setIsMobileSearchOpen(false);
            }}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Overlay */}
      {isMobileSearchOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-white/10 p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-blue-500/50 transition-all">
            <Search className="w-5 h-5 text-zinc-500" />
            <input 
              type="search" 
              placeholder="¿Qué quieres ver hoy?" 
              value={searchQuery}
              autoFocus
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                  setIsMobileSearchOpen(false);
                }
              }}
              className="bg-transparent border-none outline-none text-base ml-3 w-full"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-white/10 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-6">
            {/* Mobile Search */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-blue-500/50 transition-all">
              <Search className="w-5 h-5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Buscar películas, series..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery("");
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="bg-transparent border-none outline-none text-base ml-3 w-full"
              />
            </div>
            
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-lg font-medium text-zinc-400 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="lg:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-white/10 animate-in slide-in-from-top duration-300 pointer-events-none opacity-0"></div>
    </nav>
  );
};
