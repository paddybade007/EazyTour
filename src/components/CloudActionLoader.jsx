import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';

const CloudActionLoader = ({ message }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="relative">
        {/* Glow effect behind loader */}
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <Loader2 className="animate-spin text-blue-400 relative" size={48} strokeWidth={2.5} />
      </div>

      <div className="mt-8">
        <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] animate-pulse">
            Cloud Synchronizing...
        </h3>
        <p className="text-white/40 text-[9px] font-bold uppercase mt-2 tracking-widest">
            {message || "Modifying Cloud Records"}
        </p>
      </div>

      <div className="absolute bottom-10 flex items-center gap-2 opacity-30">
        <ShieldCheck className="text-white" size={12} />
        <span className="text-white text-[8px] font-black uppercase">Secure Cloud Encryption</span>
      </div>
    </motion.div>
  );
};

export default CloudActionLoader;