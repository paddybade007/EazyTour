import React from 'react';
import { Compass, Heart, MapPin, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BottomNav = ({ viewMode, loadData, user, setShowProfileDetails }) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-6 left-6 right-6 h-16 bg-slate-900/95 backdrop-blur-xl rounded-[30px] flex justify-around items-center px-4 shadow-2xl z-[90] max-w-sm mx-auto border border-white/10">
      {/* Explore Button */}
      <button 
        className={viewMode === 'live' ? 'text-blue-400' : 'text-slate-600'} 
        onClick={() => loadData('live')}
      >
        <Compass size={22} strokeWidth={2.5} />
      </button>

      {/* Favorites Button */}
      <button 
        className={viewMode === 'saved' ? 'text-blue-400' : 'text-slate-600'} 
        onClick={() => loadData('saved')}
      >
        <Heart size={22} fill={viewMode === 'saved' ? 'currentColor' : 'none'} strokeWidth={2.5} />
      </button>

      {/* Map/Radar Button */}
      <button 
        className={viewMode === 'map' ? 'text-blue-300' : 'text-slate-600'} 
        onClick={() => loadData('map')}
      >
        <MapPin size={22} strokeWidth={2.5} />
      </button>

      {/* Profile/Login Button */}
      <button 
        onClick={() => user ? setShowProfileDetails(true) : navigate('/login')} 
        className={`h-11 w-11 rounded-2xl flex items-center justify-center bg-slate-800 ${user ? 'border-2 border-blue-400' : ''}`}
      >
        {user ? (
          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-ping" />
        ) : (
          <LogIn size={18} className="text-gray-400" />
        )}
      </button>
    </nav>
  );
};

export default BottomNav;