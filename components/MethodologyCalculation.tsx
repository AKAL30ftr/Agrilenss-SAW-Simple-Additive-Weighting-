"use client";
import { PieChart, Sliders, Sigma } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';

export default function MethodologyCalculation() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.section 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, margin: "-50px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <div className="col-span-1 md:col-span-3">
        <h3 className="text-2xl font-bold text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] font-heading">Calculation Protocol</h3>
      </div>

      {/* Step 1 */}
      <motion.div variants={itemVariant} className="glass-plate rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden group hover:bg-white/5 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <PieChart className="w-20 h-20 text-emerald-400" />
        </div>
        <div className="bg-emerald-400/10 border border-emerald-400/30 w-10 h-10 rounded-full flex items-center justify-center font-bold text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)] font-heading">1</div>
        <h4 className="font-bold text-white uppercase tracking-widest text-sm">Normalization</h4>
        <p className="text-sm text-white/60 flex-grow leading-relaxed font-body">
          Converting all varied agricultural metrics into a comparable, dimensionless scale (0 to 1). We utilize linear scale transformation to ensure proportionally accurate relative performance matrices.
        </p>
      </motion.div>

      {/* Step 2 */}
      <motion.div variants={itemVariant} className="glass-plate rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden group hover:bg-white/5 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sliders className="w-20 h-20 text-emerald-400" />
        </div>
        <div className="bg-emerald-400/10 border border-emerald-400/30 w-10 h-10 rounded-full flex items-center justify-center font-bold text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)] font-heading">2</div>
        <h4 className="font-bold text-white uppercase tracking-widest text-sm">Weight Assignment</h4>
        <p className="text-sm text-white/60 flex-grow leading-relaxed font-body">
          Applying contextual importance to each normalized metric. Weights are derived from expert agronomist consensus and regional historical data modeling, prioritizing yield-critical factors.
        </p>
      </motion.div>

      {/* Step 3 */}
      <motion.div variants={itemVariant} className="glass-plate rounded-xl p-8 flex flex-col gap-4 relative overflow-hidden group hover:bg-white/5 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sigma className="w-20 h-20 text-emerald-400" />
        </div>
        <div className="bg-emerald-400/10 border border-emerald-400/30 w-10 h-10 rounded-full flex items-center justify-center font-bold text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)] font-heading">3</div>
        <h4 className="font-bold text-white uppercase tracking-widest text-sm">Aggregation</h4>
        <p className="text-sm text-white/60 flex-grow leading-relaxed font-body">
          Computing the final utility value by summing the products of normalized values and their respective weights. The resulting continuous index drives the final advisory thresholds.
        </p>
      </motion.div>
    </motion.section>
  );
}
