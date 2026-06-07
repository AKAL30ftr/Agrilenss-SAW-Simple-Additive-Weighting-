'use client';

import Link from 'next/link';
import { Sprout, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="px-6 flex flex-row justify-between items-center h-20 relative z-10">
        <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
          <Sprout className="text-emerald-400 w-8 h-8 shrink-0" />
          <span className="text-xl md:text-2xl font-black text-emerald-400 tracking-tight font-heading uppercase">Agri-SAW</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 xl:gap-12 font-heading font-medium tracking-wide">
          <Link href="/" className="text-white/70 hover:text-emerald-400 transition-colors uppercase text-sm font-bold tracking-widest whitespace-nowrap">
            Beranda
          </Link>
          <Link href="/analyze" className="text-white hover:text-emerald-400 transition-colors uppercase text-sm font-bold tracking-widest whitespace-nowrap">
            Konsultasi
          </Link>
          <Link href="/methodology" className="text-white/70 hover:text-emerald-400 transition-colors uppercase text-sm font-bold tracking-widest whitespace-nowrap">
            Metode SAW
          </Link>
          <Link href="/faq" className="text-white/70 hover:text-emerald-400 transition-colors uppercase text-sm font-bold tracking-widest whitespace-nowrap">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <Link href="/analyze" className="hidden sm:inline-flex px-5 py-2.5 bg-emerald-400 text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-emerald-300 transition-all">
            Mulai
          </Link>
          <button 
            className="lg:hidden text-white/70 hover:text-white transition-colors p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile nav dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl z-40 transform origin-top animate-in slide-in-from-top-2 duration-200">
           <nav className="flex flex-col px-6 py-6 gap-6 font-heading">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-emerald-400 transition-colors text-sm font-bold tracking-widest uppercase">
              Beranda
            </Link>
            <Link href="/analyze" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-emerald-400 transition-colors text-sm font-bold tracking-widest uppercase">
              Konsultasi
            </Link>
            <Link href="/methodology" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-emerald-400 transition-colors text-sm font-bold tracking-widest uppercase">
              Metode SAW
            </Link>
            <Link href="/faq" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-emerald-400 transition-colors text-sm font-bold tracking-widest uppercase">
              FAQ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
