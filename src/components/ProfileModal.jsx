import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Bookmark, Trash2, LogOut, X } from 'lucide-react';

const ProfileModal = ({ 
  showProfileDetails, 
  setShowProfileDetails, 
  user, 
  viewMode, 
  loadData, 
  tours, 
  favorites, 
  isDeleteAdmin, 
  trashCount 
}) => {
  return (
    <AnimatePresence>
      {showProfileDetails && user && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setShowProfileDetails(false)} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          />
          
          {/* Modal Card */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-5 pb-8 border border-gray-100 overflow-hidden"
          >
            {/* User Header */}
            <div className="flex items-center gap-4 mb-6 p-2">
              <div className="h-14 w-14 rounded-full border-2 border-blue-50 p-0.5">
                <img src={user.picture} className="w-full h-full rounded-full object-cover" alt="dp" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h2 className="text-lg font-black text-slate-800 truncate leading-none">{user.name}</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-1 truncate uppercase">{user.email}</p>
              </div>
              <button onClick={() => setShowProfileDetails(false)} className="bg-gray-50 h-8 w-8 rounded-full flex items-center justify-center text-gray-400"><X size={16} /></button>
            </div>

            <div className="space-y-1">
              {/* Explore Feed */}
              <button onClick={() => loadData('live')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${viewMode === 'live' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-50 text-slate-700'}`}>
                <div className="flex items-center gap-4">
                  <Compass size={18} />
                  <span className="text-[11px] font-black uppercase tracking-wider">Explore Feed</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${viewMode === 'live' ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                  {tours.length}
                </span>
              </button>

              {/* My Favorites */}
              <button onClick={() => loadData('saved')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${viewMode === 'saved' ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-gray-50 text-slate-700'}`}>
                <div className="flex items-center gap-4">
                  <Bookmark size={18} />
                  <span className="text-[11px] font-black uppercase tracking-wider">My Favorites</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${viewMode === 'saved' ? 'bg-white/20' : 'bg-red-50 text-red-500'}`}>
                  {favorites.filter(id => id && tours.some(t => t.id === id)).length}
                </span>
              </button>

              {/* Recycle Bin */}
              {isDeleteAdmin && (
                <button onClick={() => loadData('trash')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${viewMode === 'trash' ? 'bg-orange-600 text-white shadow-lg' : 'hover:bg-gray-50 text-slate-700'}`}>
                  <div className="flex items-center gap-4">
                    <Trash2 size={18} />
                    <span className="text-[11px] font-black uppercase tracking-wider">Recycle Bin</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${viewMode === 'trash' ? 'bg-white/20' : 'bg-orange-50 text-orange-600'}`}>
                    {trashCount}
                  </span>
                </button>
              )}

              <div className="h-px bg-gray-100 my-4" />

              {/* Logout */}
              <button onClick={() => { localStorage.removeItem('user'); window.location.reload(); }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest">
                <LogOut size={18} /> Logout Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;