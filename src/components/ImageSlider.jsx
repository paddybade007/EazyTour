








import React, { useState, useEffect } from 'react'; // React और hooks जोड़ें
import { motion, AnimatePresence } from 'framer-motion'; // motion जोड़ें

const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const fallback = "https://i.pinimg.com/736x/04/35/c4/0435c4cc66061a2c05a63489b77480a0.jpg";
  
  const tourImages = images?.length > 0 ? images : [fallback];

  useEffect(() => {
    if (tourImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p === tourImages.length - 1 ? 0 : p + 1));
    }, 4000); 
    return () => clearInterval(timer);
  }, [tourImages]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={tourImages[current]}
            onError={(e) => { e.target.src = fallback; }}
            className="w-full h-full object-cover shadow-inner" 
            alt="tour"
          />
        </motion.div>
      </AnimatePresence>

       {/* --- Overlay Gradient (Readability ke liye) --- */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* --- Bottom Floating Dots Indicators --- */}
      {tourImages.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-30">
          {tourImages.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-700 ease-in-out ${
                i === current ? 'w-5 bg-white shadow-[0_0_8px_white]' : 'w-1 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* --- Top Instagram Style Progress Bars (Optional) --- */}
      {tourImages.length > 1 && (
        <div className="absolute top-2 left-0 right-0 flex gap-1 px-3 z-30 opacity-60 group-hover:opacity-100 transition-opacity">
          {tourImages.map((_, i) => (
            <div key={i} className="h-[2px] flex-1 bg-black/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: i === current ? "100%" : i < current ? "100%" : "0%" }}
                transition={{ duration: i === current ? 4 : 0.5, ease: "linear" }}
                className="h-full bg-white shadow-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
