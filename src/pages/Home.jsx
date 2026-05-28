import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Compass, Star, Heart, Loader2, LogOut, LogIn, Trash2, RotateCcw, Box, X, ShieldCheck, Bookmark, Layout, RefreshCcw, Settings, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import ProfileModal from '../components/ProfileModal';
import RestoreConfirmModal from '../components/RestoreConfirmModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CloudActionLoader from '../components/CloudActionLoader';
import PermDeleteModal from '../components/PermDeleteModal';
import CloudSuccessToast from '../components/CloudSuccessToast';


const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;

const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const fallback = "https://i.pinimg.com/736x/04/35/c4/0435c4cc66061a2c05a63489b77480a0.jpg";
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => setCurrent(p => (p === images.length - 1 ? 0 : p + 1)), 3500);
    return () => clearInterval(timer);
  }, [images]);
  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      {images.map((img, i) => (
        <motion.img
          key={i} src={img || null} onError={(e) => { e.target.src = fallback; }}
          initial={{ opacity: 0 }} animate={{ opacity: i === current ? 1 : 0 }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ scale: i === current ? 1.05 : 1, transition: 'all 3s linear' }}
        />
      ))}
      {images.length > 1 && <div className="absolute top-2 left-0 right-0 flex gap-0.5 px-3 z-20">{images.map((_, i) => (<div key={i} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden"><div className={`h-full bg-white transition-all duration-[3500ms] linear ${i === current ? 'w-full' : 'w-0'}`} /></div>))}</div>}
    </div>
  );
};

const Home = () => {

  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [user, setUser] = useState(null);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Detecting...");
  const [coords, setCoords] = useState({ lat: 19.0760, lon: 72.8777 });
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("live");
  const [favorites, setFavorites] = useState([]);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [itemToRestore, setItemToRestore] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [globalActionLoading, setGlobalActionLoading] = useState(false);
  const [itemToPermDelete, setItemToPermDelete] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const [settings, setSettings] = useState({
    APP_HEADER: "EasyTour Cloud",
    SEARCH_PLACEHOLDER: "Loading Explorer...",
    ADMIN_EMAILS: "",
    DELETE_ACCESS: "",
    TOUR_TYPES: ["All"],
    TOUR_TYPE_COLORS: {}
  });

  const isAdmin = useMemo(() => {
    if (settings.ADMIN_EMAILS === "*") return true;
    if (!user || !settings.ADMIN_EMAILS) return false;
    return settings.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase());
  }, [user, settings]);

  const isDeleteAdmin = useMemo(() => {
    if (!user || !settings.DELETE_ACCESS) return false;
    return settings.DELETE_ACCESS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase());
  }, [user, settings]);

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${SHEET_API_URL}?mode=configs`);
      const data = await res.json();
      const configMap = {};
      data.forEach(item => { configMap[item.key] = item.value; });
      if (configMap.TOUR_TYPE_COLORS) configMap.TOUR_TYPE_COLORS = JSON.parse(configMap.TOUR_TYPE_COLORS.replace(/;/g, ''));
      if (configMap.TOUR_TYPES) configMap.TOUR_TYPES = configMap.TOUR_TYPES.split(',').map(t => t.trim());
      setSettings(prev => ({ ...prev, ...configMap }));
    } catch (e) { console.log(e); }
  };

  const loadData = async (mode) => {
    setViewMode(mode); setShowProfileDetails(false);
    if (mode === "map" || mode === "saved") { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await fetch(`${SHEET_API_URL}?mode=${mode === 'trash' ? 'trash' : 'live'}`, { redirect: 'follow' });
      const data = await res.json();
      setTours(data);
    } catch (err) { setTours([]); }
    finally { setLoading(false); }
  };

  const fetchLoc = () => {
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const d = await res.json();
        const area = d.address.suburb || d.address.neighbourhood || "";
        setLocation(`${area}${area ? ', ' : ''}${d.address.city || "Mumbai"}`);
      } catch (e) { setLocation("Mumbai, MH"); }
      setLoadingLoc(false);
    }, () => { setLocation("Navi Mumbai"); setLoadingLoc(false); });
  };

  const syncTrash = async () => {
    try {
      const res = await fetch(`${SHEET_API_URL}?mode=trash`);
      const data = await res.json();
      setTrashCount(Array.isArray(data) ? data.length : 0);
    } catch (e) { setTrashCount(0); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchConfigs();
    loadData("live");
    fetchLoc();
    syncTrash();
  }, []);

  useEffect(() => {
    if (user) setFavorites(JSON.parse(localStorage.getItem(`favs_${user.email}`)) || []);
  }, [user]);

  // --- FIX: HANDLING DUPLICATE KEY 19 ---
  const filtered = useMemo(() => {
    let list = viewMode === "saved" ? tours.filter(t => favorites.includes(t.id)) : tours;
    
    const seenIds = new Set(); // UNIQUE ID Tracker

    return (list || []).filter(t => {
      // Skip item if ID is already seen to prevent Duplicate Key error
      if (seenIds.has(t.id)) return false; 
      seenIds.add(t.id);

      const matchesTab = activeTab === "All" || t.type === activeTab;
      const searchTerm = search.toLowerCase();
      const name = String(t.name || "").toLowerCase();
      const loc = String(t.loc || "").toLowerCase();
      const matchesSearch = name.includes(searchTerm) || loc.includes(searchTerm);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search, tours, viewMode, favorites]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    if (!user) { setShowLoginGate(true); return; }
    let updatedFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(updatedFavs);
    localStorage.setItem(`favs_${user.email}`, JSON.stringify(updatedFavs));
  };

  const handleRestoreExecute = async () => {
    if (!itemToRestore) return;
    const itemName = itemToRestore.name;
    const t = itemToRestore;
    setItemToRestore(null); 
    setGlobalActionLoading(true); 

    try {
      const checkRes = await fetch(`${SHEET_API_URL}?mode=live`);
      const liveData = await checkRes.json();
      const exists = liveData.some(tour => String(tour.name).toLowerCase() === String(t.name).toLowerCase());

      if (exists) {
        setToastMsg(`Conflict: ${itemName} already Live!`);
        setGlobalActionLoading(false);
        return;
      }

      await fetch(SHEET_API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'restore', id: t.id })
      });
      setToastMsg(`${itemName} - Restored Successfully`);
      await loadData("trash"); 
      syncTrash();
    } catch (err) {
      setToastMsg("Restore failed - Network Error");
    } finally {
      setGlobalActionLoading(false); 
    }
  };

  const handleDeleteExecute = async () => {
    if (!itemToDelete) return;
    const itemName = itemToDelete.name;

    setItemToDelete(null); 
    setGlobalActionLoading(true); 

    try {
      await fetch(SHEET_API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id: itemToDelete.id, adminUserEmail: user?.email })
      });
      setToastMsg(`${itemName} - Moved to Trash`);
      await loadData("live"); 
      syncTrash();           
    } catch (err) {
      setToastMsg("Sync Error: Modification Failed");
    } finally {
      setGlobalActionLoading(false); 
    }
  };

  const handlePermDeleteExecute = async () => {
    if (!itemToPermDelete) return;
    const itemName = itemToPermDelete.name;
    const id = itemToPermDelete.id;

    setItemToPermDelete(null); 
    setGlobalActionLoading(true); 

    try {
        await fetch(SHEET_API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: 'permanentDelete', 
                id: id, 
                adminUserEmail: user?.email 
            }) 
        });
        setToastMsg(`${itemName} - Permanently Erased`);
        await loadData("trash");
        syncTrash(); 
    } catch (err) {
        setToastMsg("Error: Deletion unsuccessful");
    } finally {
        setGlobalActionLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-slate-900 overflow-x-hidden">

      <CloudSuccessToast 
        message={toastMsg} 
        isOpen={!!toastMsg} 
        onClose={() => setToastMsg("")} 
      />

      <Header
        settings={settings}
        location={location}
        loadingLoc={loadingLoc}
        fetchLoc={fetchLoc}
        isAdmin={isAdmin}
        viewMode={viewMode}
        user={user}
        setShowProfileDetails={setShowProfileDetails}
      />

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {viewMode === "map" ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-[70vh]">
            <div className="flex-1 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-50">
              <button onClick={() => loadData('live')} className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md text-[10px] font-black uppercase">Exit Radar ✕</button>
              <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=14&output=embed`} />
            </div>
          </motion.div>
        ) : (
          <>
            {viewMode === "trash" && <div className="mb-4 flex items-center justify-between px-2 bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-inner"><div className="flex items-center gap-2 text-orange-600 font-black uppercase text-xs"><Trash2 size={18} />Trash ({trashCount})</div></div>}
            {viewMode === "saved" && <div className="mb-4 flex items-center gap-2 text-red-600 border-l-4 border-red-500 px-3"><Heart size={20} fill="red" /><h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">My Collections</h2></div>}

            <div className="mb-4 flex items-center bg-gray-50 p-3.5 rounded-2xl border border-gray-100 focus-within:bg-white transition-all shadow-inner"><Search className="text-gray-300 mr-2" size={18} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={settings.SEARCH_PLACEHOLDER} className="bg-transparent outline-none w-full text-xs font-black uppercase" /></div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-6 py-1">
              {(settings.TOUR_TYPES || []).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl whitespace-nowrap text-[10px] font-black uppercase transition-all shadow-sm ${activeTab === tab ? (settings.TOUR_TYPE_COLORS?.[tab] || 'bg-slate-900 text-white') : 'bg-white text-gray-400 border border-gray-100'}`}
                >{tab}</button>
              ))}
            </div>

            {loading ? <div className="py-24 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /><p className="text-[9px] font-black text-gray-400 uppercase mt-4 animate-pulse">Communicating with Cloud...</p></div> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filtered.map(t => (
                  <div key={t.id} onClick={() => viewMode === "live" && navigate(`/details/${t.id}`)} className="relative aspect-square rounded-[28px] overflow-hidden active:scale-[0.96] transition-all bg-gray-50 border border-gray-100 group shadow-sm">
                    <div className="w-full h-full"><ImageSlider images={t.images?.length > 0 ? t.images : [t.img]} /></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20">

                     {viewMode === "live" && isDeleteAdmin && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setItemToDelete(t);
                          }} 
                          className="h-8 w-8 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-75 transition-transform"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      {viewMode === "trash" && isDeleteAdmin && (
                        <div className="flex flex-col gap-1.5 z-20">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setItemToRestore(t); }} 
                            className="h-8 w-8 bg-blue-500 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-75"
                          >
                            <RotateCcw size={12} />
                          </button>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); setItemToPermDelete(t); }} 
                            className="h-8 w-8 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-75"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}

                      {viewMode !== "trash" && (
                        <button onClick={(e) => toggleFavorite(e, t.id)} className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-125 transition-all">
                          <Heart size={14} className={favorites.includes(t.id) ? "text-red-500 fill-red-500 shadow-xl" : "text-white opacity-70"} />
                        </button>
                      )}
                    </div>

                    <div className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-md shadow-sm border border-gray-100 text-[8px] font-black">★ {t.rating}</div>
                    <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none z-10 leading-none">
                      <h3 className="text-[10px] md:text-xs font-black truncate uppercase tracking-tighter mb-1">{t.name}</h3>
                      <div className="flex justify-between items-center opacity-70 leading-none">
                        <span className="text-[8px] flex items-center gap-0.5 truncate max-w-[65%] uppercase"><MapPin size={7} />{t.loc?.split(',')[0]}</span>
                        <span className="text-[10px] font-black text-blue-400">₹{t.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {globalActionLoading && <CloudActionLoader message={viewMode === "trash" ? "Restoring Destination" : "Moving to Recycle Bin"} />}

      </main>

      <ProfileModal showProfileDetails={showProfileDetails} setShowProfileDetails={setShowProfileDetails} user={user} viewMode={viewMode} loadData={loadData} tours={tours} favorites={favorites} isDeleteAdmin={isDeleteAdmin} trashCount={trashCount} />
      
      <DeleteConfirmModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDeleteExecute} itemName={itemToDelete?.name} />
        
      <RestoreConfirmModal isOpen={!!itemToRestore} onClose={() => setItemToRestore(null)} onConfirm={handleRestoreExecute} itemName={itemToRestore?.name} />

      <PermDeleteModal isOpen={!!itemToPermDelete} onClose={() => setItemToPermDelete(null)} onConfirm={handlePermDeleteExecute} itemName={itemToPermDelete?.name}/>

      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-slate-900/95 backdrop-blur-xl rounded-[30px] flex justify-around items-center px-4 shadow-2xl z-[90] max-w-sm mx-auto border border-white/10">
        <button className={viewMode === 'live' ? 'text-blue-400' : 'text-slate-600'} onClick={() => loadData('live')}><Compass size={22} strokeWidth={2.5} /></button>
        <button className={viewMode === 'saved' ? 'text-blue-400' : 'text-slate-600'} onClick={() => loadData('saved')}><Heart size={22} fill={viewMode === 'saved' ? 'currentColor' : 'none'} strokeWidth={2.5} /></button>
        <button className={viewMode === 'map' ? 'text-blue-300' : 'text-slate-600'} onClick={() => loadData('map')}><MapPin size={22} strokeWidth={2.5} /></button>
        <button onClick={() => user ? setShowProfileDetails(true) : navigate('/login')} className={`h-11 w-11 rounded-2xl flex items-center justify-center bg-slate-800 ${user ? 'border-2 border-blue-400' : ''}`}>{user ? <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-ping" /> : <LogIn size={18} className="text-gray-400" />}</button>
      </nav>
    </div>
  );
};

export default Home;



// ########################SAHI CODE - Home.jsx########################

// import React, { useState, useEffect, useMemo } from 'react';
// import { MapPin, Search, Compass, Star, Heart, Loader2, LogOut, LogIn, Trash2, RotateCcw, Box, X, ShieldCheck, Bookmark, Layout, RefreshCcw, Settings, UserCircle } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import Header from '../components/Header'; // ✅ Import Header

// const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;

// const ImageSlider = ({ images }) => {
//   const [current, setCurrent] = useState(0);
//   const fallback = "https://i.pinimg.com/736x/04/35/c4/0435c4cc66061a2c05a63489b77480a0.jpg";
//   useEffect(() => {
//     if (!images || images.length <= 1) return;
//     const timer = setInterval(() => setCurrent(p => (p === images.length - 1 ? 0 : p + 1)), 3500);
//     return () => clearInterval(timer);
//   }, [images]);
//   return (
//     <div className="relative w-full h-full overflow-hidden bg-gray-100">
//       {images.map((img, i) => (
//         <motion.img
//           key={i} src={img || null} onError={(e) => { e.target.src = fallback; }}
//           initial={{ opacity: 0 }} animate={{ opacity: i === current ? 1 : 0 }}
//           className="absolute inset-0 w-full h-full object-cover"
//           style={{ scale: i === current ? 1.05 : 1, transition: 'all 3s linear' }}
//         />
//       ))}
//       {images.length > 1 && <div className="absolute top-2 left-0 right-0 flex gap-0.5 px-3 z-20">{images.map((_, i) => (<div key={i} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden"><div className={`h-full bg-white transition-all duration-[3500ms] linear ${i === current ? 'w-full' : 'w-0'}`} /></div>))}</div>}
//     </div>
//   );
// };

// const Home = () => {
//   const navigate = useNavigate();
//   const [tours, setTours] = useState([]);
//   const [user, setUser] = useState(null);
//   const [trashCount, setTrashCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [location, setLocation] = useState("Detecting...");
//   const [coords, setCoords] = useState({ lat: 19.0760, lon: 72.8777 });
//   const [loadingLoc, setLoadingLoc] = useState(true);
//   const [activeTab, setActiveTab] = useState("All");
//   const [search, setSearch] = useState("");
//   const [viewMode, setViewMode] = useState("live");
//   const [favorites, setFavorites] = useState([]);
//   const [showProfileDetails, setShowProfileDetails] = useState(false);
//   const [showLoginGate, setShowLoginGate] = useState(false);

//   const [settings, setSettings] = useState({
//     APP_HEADER: "EasyTour Cloud",
//     SEARCH_PLACEHOLDER: "Loading Explorer...",
//     ADMIN_EMAILS: "",
//     DELETE_ACCESS: "",
//     TOUR_TYPES: ["All"],
//     TOUR_TYPE_COLORS: {}
//   });

//   const isAdmin = useMemo(() => {
//     if (settings.ADMIN_EMAILS === "*") return true;
//     if (!user || !settings.ADMIN_EMAILS) return false;
//     return settings.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase());
//   }, [user, settings]);

//   const isDeleteAdmin = useMemo(() => {
//     if (!user || !settings.DELETE_ACCESS) return false;
//     return settings.DELETE_ACCESS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase());
//   }, [user, settings]);

//   const fetchConfigs = async () => {
//     try {
//       const res = await fetch(`${SHEET_API_URL}?mode=configs`);
//       const data = await res.json();
//       const configMap = {};
//       data.forEach(item => { configMap[item.key] = item.value; });
//       if (configMap.TOUR_TYPE_COLORS) configMap.TOUR_TYPE_COLORS = JSON.parse(configMap.TOUR_TYPE_COLORS.replace(/;/g, ''));
//       if (configMap.TOUR_TYPES) configMap.TOUR_TYPES = configMap.TOUR_TYPES.split(',').map(t => t.trim());
//       setSettings(prev => ({ ...prev, ...configMap }));
//     } catch (e) { console.log(e); }
//   };

//   const loadData = async (mode) => {
//     setViewMode(mode); setShowProfileDetails(false);
//     if (mode === "map" || mode === "saved") { setLoading(false); return; }
//     try {
//       setLoading(true);
//       const res = await fetch(`${SHEET_API_URL}?mode=${mode === 'trash' ? 'trash' : 'live'}`, { redirect: 'follow' });
//       const data = await res.json();
//       setTours(data);
//     } catch (err) { setTours([]); }
//     finally { setLoading(false); }
//   };

//   const fetchLoc = () => {
//     setLoadingLoc(true);
//     navigator.geolocation.getCurrentPosition(async (pos) => {
//       setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
//       try {
//         const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
//         const d = await res.json();
//         const area = d.address.suburb || d.address.neighbourhood || "";
//         setLocation(`${area}${area ? ', ' : ''}${d.address.city || "Mumbai"}`);
//       } catch (e) { setLocation("Mumbai, MH"); }
//       setLoadingLoc(false);
//     }, () => { setLocation("Navi Mumbai"); setLoadingLoc(false); });
//   };

//   const syncTrash = async () => {
//     try {
//       const res = await fetch(`${SHEET_API_URL}?mode=trash`);
//       const data = await res.json();
//       setTrashCount(data.length || 0);
//     } catch (e) { setTrashCount(0); }
//   };

//   useEffect(() => {
//     const savedUser = localStorage.getItem('user');
//     if (savedUser) setUser(JSON.parse(savedUser));
//     fetchConfigs();
//     loadData("live");
//     fetchLoc();
//     syncTrash();
//   }, []);

//   useEffect(() => {
//     if (user) setFavorites(JSON.parse(localStorage.getItem(`favs_${user.email}`)) || []);
//   }, [user]);

//   const filtered = useMemo(() => {
//     let list = viewMode === "saved" ? tours.filter(t => favorites.includes(t.id)) : tours;
//     return (list || []).filter(t => (activeTab === "All" || t.type === activeTab) && (t.name?.toLowerCase().includes(search.toLowerCase()) || t.loc?.toLowerCase().includes(search.toLowerCase())));
//   }, [activeTab, search, tours, viewMode, favorites]);

//   const handleDelete = async (e, id) => {
//     e.stopPropagation(); if (!window.confirm("Move to trash?")) return; setLoading(true);
//     await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', id, adminUserEmail: user?.email }) });
//     loadData("live"); syncTrash();
//   };

//   const handleRestore = async (e, t) => {
//     e.stopPropagation(); setLoading(true);
//     await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify({ action: 'restore', id: t.id }) });
//     loadData("trash"); syncTrash();
//   };

//   const toggleFavorite = (e, id) => {
//     e.stopPropagation();
//     if (!user) { setShowLoginGate(true); return; }
//     let updatedFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
//     setFavorites(updatedFavs);
//     localStorage.setItem(`favs_${user.email}`, JSON.stringify(updatedFavs));
//   };

//   return (
//     <div className="min-h-screen bg-white pb-24 font-sans text-slate-900 overflow-x-hidden">

//       {/* --- 🏰 INTEGRATED HEADER COMPONENT --- */}
//       <Header
//         settings={settings}
//         location={location}
//         loadingLoc={loadingLoc}
//         fetchLoc={fetchLoc}
//         isAdmin={isAdmin}
//         viewMode={viewMode}
//         user={user}
//         setShowProfileDetails={setShowProfileDetails}
//       />

//       <main className="max-w-6xl mx-auto px-4 pt-6">
//         {viewMode === "map" ? (
//           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-[70vh]">
//             <div className="flex-1 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-50">
//               <button onClick={() => loadData('live')} className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md text-[10px] font-black uppercase">Exit Radar ✕</button>
//               <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=14&output=embed`} />
//             </div>
//           </motion.div>
//         ) : (
//           <>
//             {viewMode === "trash" && <div className="mb-4 flex items-center justify-between px-2 bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-inner"><div className="flex items-center gap-2 text-orange-600 font-black uppercase text-xs"><Trash2 size={18} />Trash ({trashCount})</div></div>}
//             {viewMode === "saved" && <div className="mb-4 flex items-center gap-2 text-red-600 border-l-4 border-red-500 px-3"><Heart size={20} fill="red" /><h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">My Collections</h2></div>}

//             <div className="mb-4 flex items-center bg-gray-50 p-3.5 rounded-2xl border border-gray-100 focus-within:bg-white transition-all shadow-inner"><Search className="text-gray-300 mr-2" size={18} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={settings.SEARCH_PLACEHOLDER} className="bg-transparent outline-none w-full text-xs font-black uppercase" /></div>

//             <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-6 py-1">
//               {(settings.TOUR_TYPES || []).map(tab => (
//                 <button key={tab} onClick={() => setActiveTab(tab)}
//                   className={`px-5 py-2 rounded-xl whitespace-nowrap text-[10px] font-black uppercase transition-all shadow-sm ${activeTab === tab ? (settings.TOUR_TYPE_COLORS?.[tab] || 'bg-slate-900 text-white') : 'bg-white text-gray-400 border border-gray-100'}`}
//                 >{tab}</button>
//               ))}
//             </div>

//             {loading ? <div className="py-24 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /><p className="text-[9px] font-black text-gray-400 uppercase mt-4 animate-pulse">Communicating with Cloud...</p></div> : (
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                 {filtered.map(t => (
//                   <div key={t.id} onClick={() => viewMode === "live" && navigate(`/details/${t.id}`)} className="relative aspect-square rounded-[28px] overflow-hidden active:scale-[0.96] transition-all bg-gray-50 border border-gray-100 group shadow-sm">
//                     <div className="w-full h-full"><ImageSlider images={t.images?.length > 0 ? t.images : [t.img]} /></div>
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

//                     <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20">
//                       {viewMode === "live" && isDeleteAdmin && (<button onClick={(e) => handleDelete(e, t.id)} className="h-8 w-8 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg active:scale-75 transition-transform"><Trash2 size={12} /></button>)}
//                       {viewMode === "trash" && isDeleteAdmin && (<button onClick={(e) => { e.stopPropagation(); navigate('/admin/add', { state: { editData: t } }) }} className="h-8 w-8 bg-blue-500 text-white rounded-lg flex items-center justify-center active:scale-75 shadow-lg"><RotateCcw size={12} /></button>)}
//                       {viewMode !== "trash" && (<button onClick={(e) => toggleFavorite(e, t.id)} className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-125 transition-all"><Heart size={14} className={favorites.includes(t.id) ? "text-red-500 fill-red-500 shadow-xl" : "text-white opacity-70"} /></button>)}
//                     </div>

//                     <div className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-md shadow-sm border border-gray-100 text-[8px] font-black">★ {t.rating}</div>
//                     <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none z-10 leading-none">
//                       <h3 className="text-[10px] md:text-xs font-black truncate uppercase tracking-tighter mb-1">{t.name}</h3>
//                       <div className="flex justify-between items-center opacity-70 leading-none">
//                         <span className="text-[8px] flex items-center gap-0.5 truncate max-w-[65%] uppercase"><MapPin size={7} />{t.loc?.split(',')[0]}</span>
//                         <span className="text-[10px] font-black text-blue-400">₹{t.price}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </main>

//       <AnimatePresence>
//         {showProfileDetails && user && (
//           <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileDetails(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
//             <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
//               className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-5 pb-8 border border-gray-100 overflow-hidden"
//             >
//               <div className="flex items-center gap-4 mb-6 p-2">
//                 <div className="h-14 w-14 rounded-full border-2 border-blue-50 p-0.5">
//                   <img src={user.picture} className="w-full h-full rounded-full object-cover" alt="dp" referrerPolicy="no-referrer" />
//                 </div>
//                 <div className="flex-1 overflow-hidden">
//                   <h2 className="text-lg font-black text-slate-800 truncate leading-none">{user.name}</h2>
//                   <p className="text-[10px] font-bold text-gray-400 mt-1 truncate uppercase">{user.email}</p>
//                 </div>
//                 <button onClick={() => setShowProfileDetails(false)} className="bg-gray-50 h-8 w-8 rounded-full flex items-center justify-center text-gray-400"><X size={16} /></button>
//               </div>

//               <div className="space-y-1">
//                 <button onClick={() => loadData('live')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${viewMode === 'live' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-50 text-slate-700'}`}>
//                   <div className="flex items-center gap-4">
//                     <Compass size={18} />
//                     <span className="text-[11px] font-black uppercase tracking-wider">Explore Feed</span>
//                   </div>
//                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${viewMode === 'live' ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
//                     {tours.length}
//                   </span>
//                 </button>

//                 {/* --- 💖 MY FAVORITES --- */}
//                 <button onClick={() => loadData('saved')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${viewMode === 'saved' ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-gray-50 text-slate-700'}`}>
//                   <div className="flex items-center gap-4">
//                     <Bookmark size={18} />
//                     <span className="text-[11px] font-black uppercase tracking-wider">My Favorites</span>
//                   </div>
//                   {/* Yahan humne .filter(id => tours.some(t => t.id === id)) lagaya hai taki wahi count dikhe jo list mein exist karte hain */}
//                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${viewMode === 'saved' ? 'bg-white/20' : 'bg-red-50 text-red-500'}`}>
//                     {favorites.filter(id => id && tours.some(t => t.id === id)).length}
//                   </span>
//                 </button>

//                 {isDeleteAdmin && (
//                   <button onClick={() => loadData('trash')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${viewMode === 'trash' ? 'bg-orange-600 text-white shadow-lg' : 'hover:bg-gray-50 text-slate-700'}`}>
//                     <div className="flex items-center gap-4">
//                       <Trash2 size={18} />
//                       <span className="text-[11px] font-black uppercase tracking-wider">Recycle Bin</span>
//                     </div>
//                     <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${viewMode === 'trash' ? 'bg-white/20' : 'bg-orange-50 text-orange-600'}`}>
//                       {trashCount}
//                     </span>
//                   </button>
//                 )}

//                 <div className="h-px bg-gray-100 my-4" />

//                 <button onClick={() => { localStorage.removeItem('user'); window.location.reload(); }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest">
//                   <LogOut size={18} /> Logout Account
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       <nav className="fixed bottom-6 left-6 right-6 h-16 bg-slate-900/95 backdrop-blur-xl rounded-[30px] flex justify-around items-center px-4 shadow-2xl z-[90] max-w-sm mx-auto border border-white/10">
//         <button className={viewMode === 'live' ? 'text-blue-400' : 'text-slate-600'} onClick={() => loadData('live')}><Compass size={22} strokeWidth={2.5} /></button>
//         <button className={viewMode === 'saved' ? 'text-blue-400' : 'text-slate-600'} onClick={() => loadData('saved')}><Heart size={22} fill={viewMode === 'saved' ? 'currentColor' : 'none'} strokeWidth={2.5} /></button>
//         <button className={viewMode === 'map' ? 'text-blue-300' : 'text-slate-600'} onClick={() => loadData('map')}><MapPin size={22} strokeWidth={2.5} /></button>
//         <button onClick={() => user ? setShowProfileDetails(true) : navigate('/login')} className={`h-11 w-11 rounded-2xl flex items-center justify-center bg-slate-800 ${user ? 'border-2 border-blue-400' : ''}`}>{user ? <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-ping" /> : <LogIn size={18} className="text-gray-400" />}</button>
//       </nav>
//     </div>
//   );
// };

// export default Home;

// ########################SAHI CODE - Home.jsx########################
