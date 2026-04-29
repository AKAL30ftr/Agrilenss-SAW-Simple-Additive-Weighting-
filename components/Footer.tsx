import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 mt-auto bg-black/60 backdrop-blur-md relative z-10">
      <div className="max-w-[1200px] mx-auto py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="font-black text-emerald-400 text-xl font-heading tracking-tight uppercase hover:opacity-80 transition-opacity">
            AgriLens
          </Link>
          <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center md:text-left">
            © 2024 Agri-SAW Pro Intelligence. Precision decision support.
          </p>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-8">
          <Link href="/methodology" className="font-heading text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-400 transition-colors">
            Methodology
          </Link>
          <Link href="/faq" className="font-heading text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-400 transition-colors">
            FAQ
          </Link>
          <Link href="https://github.com/AgriLens" target="_blank" className="font-heading text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-400 transition-colors">
            GitHub
          </Link>
          <Link href="/privacy" className="font-heading text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-400 transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
