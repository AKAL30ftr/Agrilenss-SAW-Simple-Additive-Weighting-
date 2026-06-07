"use client";
import { ScrollText } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function MethodologyFoundation() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-plate rounded-xl p-8 flex flex-col gap-4"
    >
      <div className="flex items-center gap-4 mb-2">
        <ScrollText className="text-emerald-300 w-8 h-8" />
        <h3 className="text-2xl font-bold text-white font-heading">Dasar Metode</h3>
      </div>
      <p className="text-base text-white/70 leading-relaxed font-body">
        Metode Simple Additive Weighting (SAW), juga dikenal sebagai metode penjumlahan terbobot, adalah teknik pengambilan keputusan multi-atribut (MADM). Metode ini berbasis konsep rata-rata tertimbang. Sistem mengevaluasi sejumlah alternatif dengan menggabungkan nilai ternormalisasi dari setiap atributnya menggunakan bobot yang telah ditentukan, menghitung skor komposit akhir untuk setiap pilihan.
      </p>
      <p className="text-base text-white/70 leading-relaxed font-body">
        Dalam konteks SPK pemilihan komoditas pertanian, metode ini memungkinkan sistem untuk menyintesis berbagai titik data yang berbeda — seperti jenis tanah, curah hujan, biaya produksi, harga jual, produktivitas, risiko gagal panen, dan permintaan pasar — menjadi indeks rekomendasi terpadu, memastikan bahwa faktor-faktor pembatas kritis diberi bobot yang tepat dalam penilaian akhir.
      </p>
    </motion.section>
  );
}
