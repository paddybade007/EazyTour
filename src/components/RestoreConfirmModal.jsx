import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';

const RestoreConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        
        {/* Modal Card */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-[280px] bg-white rounded-[28px] shadow-2xl p-6 text-center border border-gray-100"
        >
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RotateCcw size={24} />
          </div>
          
          <h3 className="text-xs font-black uppercase text-slate-800 mb-1 leading-tight">Restore Record?</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-6 italic">"{itemName}"</p>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-50 text-[10px] font-black uppercase text-gray-400 active:scale-95 transition-all">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-slate-900 text-[10px] font-black uppercase text-white shadow-lg active:scale-95 transition-all">Yes, Restore</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RestoreConfirmModal;