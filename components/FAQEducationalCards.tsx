"use client";
import { Leaf, Scale, ArrowRight } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function FAQEducationalCards() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div className="glass-plate rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-400/40 transition-all duration-300">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Leaf className="w-32 h-32 text-emerald-400" />
        </div>
        <h4 className="text-2xl font-bold text-white relative z-10 font-heading">Sumber Data</h4>
        <p className="text-slate-300 relative z-10 flex-grow font-body">Data komoditas diperoleh dari Badan Pusat Statistik (BPS), Kementerian Pertanian, dan referensi akademis yang relevan dengan kondisi pertanian di Indonesia.</p>
        <span className="text-emerald-400 font-bold flex items-center gap-2 w-fit relative z-10 opacity-60">
          Lihat Dokumentasi <ArrowRight className="w-4 h-4" />
        </span>
      </div>
      
      <div className="glass-plate rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-400/40 transition-all duration-300">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Scale className="w-32 h-32 text-emerald-400" />
        </div>
        <h4 className="text-2xl font-bold text-white relative z-10 font-heading">Strategi Pembobotan</h4>
        <p className="text-slate-300 relative z-10 flex-grow font-body">Bobot ditentukan berdasarkan studi literatur dan data statistik. Dalam sistem ini, pengguna dapat memilih preferensi (biaya/risiko/pasar) untuk menyesuaikan bobot secara dinamis.</p>
        <span className="text-emerald-400 font-bold flex items-center gap-2 w-fit relative z-10 opacity-60">
          Lihat Strategi <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </motion.div>
  );
}
