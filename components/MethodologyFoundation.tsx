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
        <h3 className="text-2xl font-bold text-white font-heading">Methodological Foundation</h3>
      </div>
      <p className="text-base text-white/70 leading-relaxed font-body">
        The Simple Additive Weighting (SAW) method, also known as weighted linear combination or scoring methods, is a multi-attribute decision-making (MADM) technique. It is based on the concept of a weighted average. The method evaluates a set of alternatives by combining the normalized values of their attributes with predetermined weights, calculating a final composite score for each option.
      </p>
      <p className="text-base text-white/70 leading-relaxed font-body">
        In the context of AgriLens, this allows us to synthesize disparate data points—such as soil moisture, nutrient levels, and historical yield data—into a unified Advisory Index, ensuring that critical limiting factors are properly weighted in the final assessment.
      </p>
    </motion.section>
  );
}
