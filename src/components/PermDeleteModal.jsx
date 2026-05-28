import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Trash2 } from 'lucide-react';

const PermDeleteModal = ({ isOpen, onClose, onConfirm, itemName, loading }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        {/* Backdrop - Pura dark rakha hai danger zone ke liye */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-red-950/20 backdrop-blur-md" />
        
        {/* Modal Card */}
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-[280px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(220,38,38,0.15)] p-6 text-center border-2 border-red-50"
        >
          <div className="h-14 w-14 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
            <ShieldAlert size={28} />
          </div>
          
          <h3 className="text-[13px] font-black uppercase text-red-600 mb-1 leading-tight tracking-tight">Final Warning</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Permanent Removal</p>
          
          <p className="text-[10px] font-bold text-slate-700 bg-red-50/50 p-3 rounded-xl border border-red-100/50 mb-6 italic leading-relaxed">
            Are you sure you want to delete <span className="text-red-600">"{itemName}"</span> from the Cloud forever?
          </p>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-gray-50 text-[10px] font-black uppercase text-gray-400">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3.5 rounded-xl bg-red-600 text-[10px] font-black uppercase text-white shadow-xl shadow-red-200 flex items-center justify-center gap-2">
              <Trash2 size={12} />Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PermDeleteModal;