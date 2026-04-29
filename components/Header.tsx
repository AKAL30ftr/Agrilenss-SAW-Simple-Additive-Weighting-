'use client';

import Link from 'next/link';
import { Sprout, Bell, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import NotificationList from './NotificationList';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNotifOpen]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="px-6 flex flex-row justify-between items-center h-20 relative z-10">
        <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
          <Sprout className="text-emerald-400 w-8 h-8 shrink-0" />
          <span className="text-xl md:text-2xl font-black text-emerald-400 tracking-tight font-heading uppercase">AgriLens</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 xl:gap-12 font-heading font-medium tracking-wide">
          <Link href="/" className="text-white hover:text-emerald-400 transition-colors uppercase text-sm font-bold tracking-widest whitespace-nowrap">
            Home
          </Link>
          <Link href="/analyze" className="text-white/70 hover:text-emerald-400 transition-colors uppercase text-sm font-bold tracking-widest whitespace-nowrap">
            Analyze
          </Link>
          <Link href="/methodology" className="text-white/70 hover:text-emerald-400 transition-colors uppercase text-sm font-bold tracking-widest whitespace-nowrap">
            Methodology
          </Link>
          <Link href="/faq" className="text-white/70 hover:text-emerald-400 transition-colors uppercase text-sm font-bold tracking-widest whitespace-nowrap">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          {/* Notifications Container */}
          <div className="relative flex items-center" ref={notifRef}>
            {/* Mobile: Simple Link */}
            <Link href="/notifications" className="md:hidden relative text-white/70 hover:text-emerald-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
            </Link>

            {/* Desktop: Toggle Dropdown */}
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)} 
              className="hidden md:block relative text-white/70 hover:text-emerald-400 transition-colors focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
            </button>

            {/* Desktop: Notification Dropdown */}
            {isNotifOpen && (
              <div className="hidden md:block absolute top-[130%] -right-4 w-[380px] glass-plate rounded-xl z-50 overflow-hidden transform animate-in fade-in slide-in-from-top-2 duration-200">
                 <NotificationList isPopup={true} onClose={() => setIsNotifOpen(false)} />
              </div>
            )}
          </div>

          <Link href="/profile" className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-emerald-400/50 flex items-center justify-center font-bold text-emerald-400 text-sm hover:bg-emerald-400/10 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all">
            JD
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
              Home
            </Link>
            <Link href="/analyze" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-emerald-400 transition-colors text-sm font-bold tracking-widest uppercase">
              Analyze
            </Link>
            <Link href="/methodology" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-emerald-400 transition-colors text-sm font-bold tracking-widest uppercase">
              Methodology
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
