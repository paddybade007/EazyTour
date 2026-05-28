import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Cloud } from 'lucide-react';

const CloudSuccessToast = ({ message, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        /* --- 🛠️ FIX: Full width container for perfect centering --- */
        <div className="fixed top-6 left-0 w-full flex justify-center px-6 z-[300] pointer-events-none">
          <motion.div
            /* Centering fix: ab x handle karne ki zarurat nahi, container centre kar raha hai */
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            /* Interactivity enabled for toast specifically */
            className="pointer-events-auto w-full max-w-[320px] bg-slate-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[22px] p-4 flex items-center gap-4 overflow-hidden"
          >
            {/* Standard Check Icon */}
            <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-green-500/20">
              <CheckCircle2 size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 opacity-40 mb-0.5">
                <Cloud size={10} className="text-white" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Cloud System Link</span>
              </div>
              <p className="text-[10px] font-bold text-white uppercase truncate tracking-tighter leading-tight">
                {message}
              </p>
            </div>

            {/* Pulsing indicator */}
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0 ml-1" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CloudSuccessToast;


// import React, { useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { CheckCircle2, Cloud } from 'lucide-react';

// const CloudSuccessToast = ({ message, isOpen, onClose }) => {
//   useEffect(() => {
//     if (isOpen) {
//       const timer = setTimeout(() => onClose(), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isOpen, onClose]);

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ y: -100, x: '-50%', opacity: 0 }}
//           animate={{ y: 20, x: '-50%', opacity: 1 }}
//           exit={{ y: -100, x: '-50%', opacity: 0 }}
//           className="fixed top-4 left-1/2 -translate-x-1/2 z-[250] w-[90%] max-w-sm bg-slate-900 border-2 border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-[20px] p-4 flex items-center gap-4"
//         >
//           <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
//             <CheckCircle2 size={20} />
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-1.5 opacity-40 mb-0.5">
//               <Cloud size={10} className="text-white" />
//               <span className="text-[8px] font-black text-white uppercase tracking-widest">Cloud Update Success</span>
//             </div>
//             <p className="text-[10px] font-bold text-white uppercase truncate tracking-tighter leading-tight">
//               {message}
//             </p>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default CloudSuccessToast;