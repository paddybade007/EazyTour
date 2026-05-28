import React from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ 
  settings, 
  location, 
  loadingLoc, 
  fetchLoc, 
  isAdmin, 
  viewMode, 
  user, 
  setShowProfileDetails 
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-gray-100 shadow-sm">
      <div className="flex flex-col gap-0 group cursor-pointer leading-tight" onClick={fetchLoc}>
        <h1 className="font-black text-[13px] uppercase tracking-tighter text-slate-800 leading-none">
          {settings.APP_HEADER}
        </h1>
        <div className="flex items-center text-blue-600 font-bold leading-none mt-1">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          {loadingLoc ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <span className="text-[10px] font-black truncate max-w-[130px]">{location}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && viewMode === 'live' && (
          <button 
            onClick={() => navigate('/admin/add')} 
            className="text-[9px] font-black text-blue-600 uppercase border-b-2 border-blue-50"
          >
            Add Place
          </button>
        )}
        <div 
          onClick={() => user ? setShowProfileDetails(true) : navigate('/login')} 
          className="flex items-center gap-2 cursor-pointer transition-all group"
        >
          {user && (
            <div className="flex flex-col items-end leading-[0.85] mr-1">
              <span className="text-[10px] font-black uppercase text-slate-900">
                {user.given_name || user.name.split(' ')[0]}
              </span>
              <span className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter opacity-60 mt-1 leading-none">
                {user.family_name || "MEMBER"}
              </span>
            </div>
          )}
          <div className="h-9 w-9 rounded-full bg-blue-50 border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
            {user ? (
              <img src={user.picture} className="w-full h-full object-cover" alt="dp" referrerPolicy="no-referrer" />
            ) : (
              <LogIn size={16} className="text-blue-600" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;