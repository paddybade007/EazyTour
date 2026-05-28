import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Info, Camera, ShieldCheck, X, Image as ImageIcon } from 'lucide-react';
import { ADMIN_EMAILS, TOUR_TYPES } from '../config';
import CloudSuccessToast from '../components/CloudSuccessToast';

const AddTour = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    
    // इमेज फाइल्स के लिए नए States
    const [selectedImages, setSelectedImages] = useState([]); // [{file, preview, base64}]

    const [formData, setFormData] = useState({
        id: Date.now(),
        name: '',
        loc: '',
        price: '',
        rating: '4.5',
        type: 'Waterfall',
        desc: '',
        images: '' // ये वो हैं जो टेक्स्ट एरिया में हैं (Drive Links)
    });

    const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const checkAccess = () => {
            if (ADMIN_EMAILS === "*") return true;
            if (!savedUser) return false;
            return ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).includes(savedUser.email.toLowerCase());
        };

        if (checkAccess()) {
            setIsAdmin(true);
            setCurrentUser(savedUser);
            if (location.state?.editData) {
                const d = location.state.editData;
                setIsEditMode(true);
                setFormData({
                    id: d.id, name: d.name, loc: d.loc, price: d.price, 
                    rating: d.rating, type: d.type, desc: d.desc, 
                    images: Array.isArray(d.images) ? d.images.join('\n') : d.images
                });
            }
        } else {
            setToastMsg("Unauthorized Access");
            setTimeout(() => navigate('/'), 2000);
        }
    }, [navigate, location]);

    // 🖼️ फाइल को Base64 में बदलने का लॉजिक
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setSelectedImages(prev => [...prev, {
                    preview: URL.createObjectURL(file),
                    base64: reader.result,
                    mimeType: file.type,
                    name: file.name
                }]);
            };
        });
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            action: "save",
            isSystemAdmin: true, // सीधे एप्रूव्ड के लिए (बदलाव के अनुसार)
            imageFiles: selectedImages.map(img => ({ base64: img.base64, mimeType: img.mimeType })),
            adminUserEmail: currentUser?.email
        };

        try {
            await fetch(SHEET_API_URL, { 
                method: 'POST', 
                body: JSON.stringify(payload) 
            });
            setToastMsg(isEditMode ? "Record Synced" : "New Place Uploaded");
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setToastMsg("Sync Error");
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) return <div className="h-screen flex items-center justify-center font-black">Validating Cloud...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-24 font-sans text-slate-900">
            <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-75 transition-all"><ArrowLeft size={20} /></button>
                    <div className="leading-tight">
                        <h1 className="text-sm font-black uppercase">{isEditMode ? "Cloud Edit" : "Cloud Entry"}</h1>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">Drive & Sheets Secure Link</p>
                    </div>
                </div>
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                    <ShieldCheck size={22} />
                </div>
            </header>

            <main className="px-6 mt-6 max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                        
                        {/* 📁 UPLOAD AREA */}
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-3 ml-1 flex items-center gap-2">
                                <Camera size={12}/> Cloud Gallery Uploads
                            </label>
                            
                            <div className="flex flex-wrap gap-3">
                                {/* Upload Button */}
                                <label className="h-20 w-20 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-all active:scale-90">
                                    <ImageIcon size={20} className="text-blue-400 mb-1" />
                                    <span className="text-[7px] font-black uppercase text-gray-400">Add Image</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>

                                {/* Previews */}
                                {selectedImages.map((img, i) => (
                                    <div key={i} className="h-20 w-20 relative group">
                                        <img src={img.preview} className="h-full w-full object-cover rounded-2xl shadow-sm border border-gray-100" alt="p" />
                                        <button 
                                            type="button" 
                                            onClick={() => removeImage(i)}
                                            className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-75"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Existing Input Fields */}
                        <div className="pt-2 border-t border-gray-50">
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Title</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none" placeholder="e.g. Kondana Caves" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Location</label>
                                <input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Category</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none appearance-none">
                                    {TOUR_TYPES.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Overview (Optional)</label>
                            <textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-xs outline-none h-24 resize-none" />
                        </div>

                        {/* Drive Links Field (Already existing URLs) */}
                        <div className="opacity-50">
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Static Cloud URLs (Line by line)</label>
                            <textarea value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-mono text-[9px] outline-none h-16 resize-none" placeholder="Link auto-appears here after sync..." />
                        </div>

                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (isEditMode ? "Save Synchronization" : "Synchronize to Cloud")}
                    </button>
                </form>
            </main>
            
            <CloudSuccessToast message={toastMsg} isOpen={!!toastMsg} onClose={() => setToastMsg("")} />
        </div>
    );
};

export default AddTour;













// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { ArrowLeft, Save, Loader2, Info, Lock, Trash2, Edit2, Camera, ShieldCheck } from 'lucide-react';
// import { ADMIN_EMAILS, TOUR_TYPES } from '../config';
// import CloudSuccessToast from '../components/CloudSuccessToast';

// const AddTour = () => {
//     const navigate = useNavigate();
//     const location = useLocation();

//     const [loading, setLoading] = useState(false);
//     const [isAdmin, setIsAdmin] = useState(false);
//     const [currentUser, setCurrentUser] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;
//     const [toastMsg, setToastMsg] = useState("");

//     const [formData, setFormData] = useState({
//         id: Date.now(),
//         name: '',
//         loc: '',
//         price: '',
//         rating: '4.5',
//         type: 'Waterfall',
//         desc: '',
//         images: ''
//     });

//     useEffect(() => {
//         const savedUser = JSON.parse(localStorage.getItem('user'));

//         const checkAccess = () => {
//             if (ADMIN_EMAILS === "*") return true;
//             if (!savedUser) return false;
//             const allowed = ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
//             return allowed.includes(savedUser.email.toLowerCase());
//         };

//         if (checkAccess()) {
//             setIsAdmin(true);
//             setCurrentUser(savedUser);

//             if (location.state && location.state.editData) {
//                 const d = location.state.editData;
//                 setIsEditMode(true);
//                 setFormData({
//                     id: d.id,
//                     name: d.name,
//                     loc: d.loc,
//                     price: d.price,
//                     rating: d.rating,
//                     type: d.type,
//                     desc: d.desc,
//                     images: Array.isArray(d.images) ? d.images.join('\n') : d.images
//                 });
//             }
//         } else {
//             // ✅ Alert removed and replaced with Toast + Delayed Navigate
//             setToastMsg("Unauthorized Access - Redirection Active");
//             setTimeout(() => navigate('/'), 2500);
//         }
//     }, [navigate, location]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         const payload = {
//             ...formData,
//             action: "save",
//             adminUserEmail: currentUser?.email || "Cloud"
//         };

//         try {
//             await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify(payload) });
//             const msg = isEditMode 
//                 ? `${formData.name} - Updated Successfully` 
//                 : `${formData.name} - New Place Added Successfully`;
//             setToastMsg(msg);
//             setTimeout(() => navigate('/'), 2500);
//         } catch (error) {
//             navigate('/');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Render logic with toast support for unauthorized attempts
//     if (!isAdmin) return (
//         <div className="h-screen bg-white flex items-center justify-center font-black text-gray-200 uppercase">
//             Checking Cloud Status...
//             <CloudSuccessToast message={toastMsg} isOpen={!!toastMsg} onClose={() => setToastMsg("")} />
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-[#F8F9FB] pb-10 font-sans text-slate-900">
            
//             <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 shadow-sm">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-75 transition-all"><ArrowLeft size={20} /></button>
//                     <div className="leading-tight">
//                         <h1 className="text-s font-black uppercase">{isEditMode ? "Modify Place" : "Add New Place"}</h1>
//                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">Secured Cloud Link</p>
//                     </div>
//                 </div>
//                 <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
//                     <ShieldCheck size={22} />
//                 </div>
//             </header>

//             <main className="px-6 mt-6 max-w-xl mx-auto">
//                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl mb-6 border border-gray-100 flex gap-4 items-center">
//                     <div className="relative group h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner cursor-help">
//                         <Info size={20} />
//                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-[110] bg-slate-900 text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap uppercase tracking-widest border border-white/10 pointer-events-none">
//                             You have to request admin to add/update the data
//                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
//                         </div>
//                     </div>
//                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
//                         {isEditMode ? "You are now modifying live cloud records." : "Ensure all details are accurate before cloud synchronization."}
//                     </p>
//                 </motion.div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                        
//                         <div>
//                             <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Destination Title</label>
//                             <input 
//                                 required 
//                                 value={formData.name} 
//                                 onChange={e => setFormData({ ...formData, name: e.target.value })} 
//                                 className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none transition-all focus:bg-white focus:ring-1 ring-blue-100" 
//                                 placeholder="e.g. Zenith Waterfall" 
//                             />
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">City/Locality</label><input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Type</label><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none">
//                                 {TOUR_TYPES
//                                     .filter(type => type !== "All")
//                                     .map(type => (
//                                         <option key={type} value={type}>
//                                             {type}
//                                         </option>
//                                     ))}
//                             </select></div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Entrance Fee</label><input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="150" /></div>
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Safety Rating</label><input value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
//                         </div>

//                         <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Overview Description</label><textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none h-24 resize-none" /></div>

//                         <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block flex items-center gap-1"><Camera size={10} /> Cloud Photos (One per line)</label>
//                             <textarea required value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-mono text-[9px] outline-none h-32 resize-none" placeholder="Paste links here..." /></div>
//                     </div>

//                     <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[26px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
//                         {loading ? <Loader2 className="animate-spin" size={18} /> : isEditMode ? "Update Place" : "Add New Place"}
//                     </button>
//                 </form>
//             </main>
//             <CloudSuccessToast message={toastMsg} isOpen={!!toastMsg} onClose={() => setToastMsg("")} />
//         </div>
//     );
// };

// export default AddTour;







// ##################### WORKING ON THIS FILE - 1.1.5 #####################

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { ArrowLeft, Save, Loader2, Info, Lock, Trash2, Edit2, Camera, ShieldCheck } from 'lucide-react';
// import { ADMIN_EMAILS, TOUR_TYPES } from '../config';
// import CloudSuccessToast from '../components/CloudSuccessToast';


// const AddTour = () => {
//     const navigate = useNavigate();
//     const location = useLocation();

//     const [loading, setLoading] = useState(false);
//     const [isAdmin, setIsAdmin] = useState(false);
//     const [currentUser, setCurrentUser] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const SHEET_API_URL = import.meta.env.VITE_SHEET_API_URL;
//     const [toastMsg, setToastMsg] = useState("");


//     const [formData, setFormData] = useState({
//         id: Date.now(),
//         name: '',
//         loc: '',
//         price: '',
//         rating: '4.5',
//         type: 'Waterfall',
//         desc: '',
//         images: ''
//     });

//     useEffect(() => {
//         const savedUser = JSON.parse(localStorage.getItem('user'));

//         const checkAccess = () => {
//             if (ADMIN_EMAILS === "*") return true;
//             if (!savedUser) return false;
//             const allowed = ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
//             return allowed.includes(savedUser.email.toLowerCase());
//         };

//         if (checkAccess()) {
//             setIsAdmin(true);
//             setCurrentUser(savedUser);

//             if (location.state && location.state.editData) {
//                 const d = location.state.editData;
//                 setIsEditMode(true);
//                 setFormData({
//                     id: d.id,
//                     name: d.name,
//                     loc: d.loc,
//                     price: d.price,
//                     rating: d.rating,
//                     type: d.type,
//                     desc: d.desc,
//                     images: Array.isArray(d.images) ? d.images.join('\n') : d.images
//                 });
//             }
//         } else {
//             alert("Unauthorized Access!");
//             navigate('/');
//         }
//     }, [navigate, location]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         const payload = {
//             ...formData,
//             action: "save",
//             adminUserEmail: currentUser?.email || "Cloud"
//         };

//         try {
//             await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify(payload) });
//             const msg = isEditMode 
//            ? `${formData.name} - Updated Successfully` 
//            : `${formData.name} - New Place Added Successfully`;
//            setToastMsg(msg);
//            setTimeout(() => navigate('/'), 2500);
//         } catch (error) {
//             navigate('/');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isAdmin) return <div className="h-screen bg-white flex items-center justify-center font-black text-gray-200 uppercase">Checking Cloud Status...</div>;

//     return (
//         <div className="min-h-screen bg-[#F8F9FB] pb-10 font-sans text-slate-900">
            
//             <header className="px-6 py-4 bg-white sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 shadow-sm">
//                 <div className="flex items-center gap-4">
//                     <button onClick={() => navigate(-1)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-slate-400 active:scale-75 transition-all"><ArrowLeft size={20} /></button>
//                     <div className="leading-tight">
//                         <h1 className="text-s font-black uppercase">{isEditMode ? "Modify Place" : "Add New Place"}</h1>
//                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">Secured Cloud Link</p>
//                     </div>
//                 </div>
//                 <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
//                     <ShieldCheck size={22} />
//                 </div>
//             </header>



//             <main className="px-6 mt-6 max-w-xl mx-auto">
//                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl mb-6 border border-gray-100 flex gap-4 items-center">
//                     <div className="relative group h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner cursor-help">
//                         <Info size={20} />
//                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-[110] bg-slate-900 text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap uppercase tracking-widest border border-white/10 pointer-events-none">
//                             You have to request admin to add/update the data
//                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
//                         </div>
//                     </div>
//                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
//                         {isEditMode ? "You are now modifying live cloud records." : "Ensure all details are accurate before cloud synchronization."}
//                     </p>
//                 </motion.div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                        
//                         {/* ✅ TITLE FIELD UNLOCKED (Ab ye Edit mode me change ho sakta hai) */}
//                         <div>
//                             <label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Destination Title</label>
//                             <input 
//                                 required 
//                                 value={formData.name} 
//                                 onChange={e => setFormData({ ...formData, name: e.target.value })} 
//                                 className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none transition-all focus:bg-white focus:ring-1 ring-blue-100" 
//                                 placeholder="e.g. Zenith Waterfall" 
//                             />
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">City/Locality</label><input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Type</label><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none">
//                                 {TOUR_TYPES
//                                     .filter(type => type !== "All")
//                                     .map(type => (
//                                         <option key={type} value={type}>
//                                             {type}
//                                         </option>
//                                     ))}
//                             </select></div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Entrance Fee</label><input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="150" /></div>
//                             <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Safety Rating</label><input value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" /></div>
//                         </div>

//                         <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block">Overview Description</label><textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none h-24 resize-none" /></div>

//                         <div><label className="text-[9px] font-black uppercase text-gray-400 mb-1 ml-1 block flex items-center gap-1"><Camera size={10} /> Cloud Photos (One per line)</label>
//                             <textarea required value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl font-mono text-[9px] outline-none h-32 resize-none" placeholder="Paste links here..." /></div>
//                     </div>

//                     <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[26px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
//                         {loading ? <Loader2 className="animate-spin" size={18} /> : isEditMode ? "Update Place" : "Add New Place"}
//                     </button>
//                 </form>
//             </main>
//             <CloudSuccessToast message={toastMsg} isOpen={!!toastMsg} onClose={() => setToastMsg("")} />
//         </div>
//     );
// };

// export default AddTour;