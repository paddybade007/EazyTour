import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Loader2, Camera, ShieldCheck, X,
    Image as ImageIcon, MapPin, Tag, AlignLeft,
    Link as LinkIcon, Sparkles, Plus, Wallet, Star
} from 'lucide-react';
import { ADMIN_EMAILS, TOUR_TYPES } from '../config';
import CloudSuccessToast from '../components/CloudSuccessToast';

const AddTour = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);

    const [formData, setFormData] = useState({
        id: Date.now(), name: '', loc: '', price: '',
        rating: '4.8', type: '',
        desc: '', images: ''
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
                    rating: d.rating, type: d.type || '', desc: d.desc,
                    images: Array.isArray(d.images) ? d.images.join('\n') : d.images
                });
            }
        } else {
            setToastMsg("Validating Security Access...");
            setTimeout(() => navigate('/'), 2000);
        }
    }, [navigate, location]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setSelectedImages(prev => [...prev, {
                    preview: URL.createObjectURL(file),
                    base64: reader.result, mimeType: file.type
                }]);
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            ...formData, action: "save", isSystemAdmin: true,
            imageFiles: selectedImages.map(img => ({ base64: img.base64, mimeType: img.mimeType })),
            adminUserEmail: currentUser?.email
        };
        try {
            await fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify(payload) });
            setToastMsg(isEditMode ? "Update Success" : "New Entry Added");
            setTimeout(() => navigate('/'), 2000);
        } catch (error) { setToastMsg("Cloud Sync Error"); }
        finally { setLoading(false); }
    };

    if (!isAdmin) return <div className="h-screen bg-white flex items-center justify-center font-black uppercase text-[10px] text-slate-300">Terminal Connecting...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
            {/* Header */}
            <header className="px-5 py-4 bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[120] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="h-10 w-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center active:scale-75 transition-all"><ArrowLeft size={18} /></button>
                    <div>
                        <h1 className="text-sm font-black uppercase">{isEditMode ? 'Modify Record' : 'Add New Spot'}</h1>
                        <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">Administrator Module</p>
                    </div>
                </div>
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><ShieldCheck size={20} /></div>
            </header>

            <main className="px-4 mt-5 max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Primary Details Card */}
                    <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
                        <div className="space-y-3">
                            <div className="relative">
                                <span className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 block">Destination Name</span>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl font-black text-xs outline-none focus:ring-1 ring-blue-100" placeholder="e.g. Zenith Waterfalls" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 block">Territory / Hub</span>
                                    <input required value={formData.loc} onChange={e => setFormData({ ...formData, loc: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none" placeholder="Location Name" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 block">Select Category</span>
                                    <div className="relative">
                                        <select required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className={`w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none appearance-none uppercase ${formData.type === "" ? "text-slate-400" : "text-slate-800"}`}>
                                            <option value="" disabled hidden>Waterfall / Resort</option>
                                            {TOUR_TYPES.filter(t => t !== "All").map(t => <option key={t}>{t}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20"><Tag size={12} /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 block">Entrance Fee</span>
                                    <div className="flex items-center bg-slate-50 rounded-2xl p-1 px-3 border border-transparent">
                                        <Wallet size={12} className="text-slate-400" />
                                        <input value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-3 font-bold text-xs outline-none bg-transparent" placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 block">Safety Rating</span>
                                    <div className="flex items-center bg-slate-50 rounded-2xl p-1 px-3">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <input value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="w-full p-3 font-black text-xs outline-none bg-transparent" placeholder="4.8" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-[9px] font-black uppercase text-slate-400 mb-1 ml-1 block">Place Description</span>
                                <textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-slate-50 p-4 h-24 rounded-2xl font-bold text-xs outline-none resize-none leading-relaxed" placeholder="Brief about the location vibe..." />
                            </div>
                        </div>
                    </div>

                    {/* Integrated Asset Vault */}
                    <div className="bg-white rounded-[35px] p-6 border-2 border-blue-50 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                                <Camera size={14} className="text-blue-600" /> Upload Photos
                            </label>
                            <span className="text-[8px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">SNAPSHOT VAULT</span>
                        </div>

                        {/* Local File Selector */}
                        <div className="flex flex-wrap gap-2.5 mb-5 p-3.5 bg-slate-50/50 rounded-3xl border border-dashed border-blue-100 min-h-[80px]">
                            <button type="button" onClick={() => fileInputRef.current.click()} className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center border-2 border-dashed border-blue-100 text-blue-600">
                                <Plus size={18} strokeWidth={3} />
                                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                            </button>
                            <AnimatePresence>
                                {selectedImages.map((img, i) => (
                                    <motion.div key={i} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="h-14 w-14 relative group">
                                        <img src={img.preview} className="h-full w-full object-cover rounded-xl shadow-md border-2 border-white" />
                                        <button type="button" onClick={() => setSelectedImages(p => p.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"><X size={10} /></button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* External Link Repo (Light UI + Blue Links) */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                                <LinkIcon size={12} className="text-blue-500" />
                                <span className="text-[9px] font-black uppercase text-slate-400">External Cloud Links (Optional)</span>
                            </div>
                            <textarea
                                value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })}
                                className="w-full bg-blue-50/40 p-4 h-20 rounded-2xl font-mono text-[10px] font-bold text-blue-600 border-none outline-none resize-none leading-relaxed placeholder:text-slate-300 transition-all"
                                placeholder="http://resource.cloud/file..."
                            />
                        </div>
                    </div>

                    {/* Submit Action Button */}
                    <div className="fixed bottom-6 left-0 right-0 px-8 flex justify-center z-[130]">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full max-w-[280px] h-14 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center transition-all active:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className="opacity-80">Submit Destination</span>
                                    <ShieldCheck size={15} className="opacity-30 flex-shrink-0" />
                                </div>
                            )}
                        </motion.button>
                    </div>
                </form>
            </main>

            <CloudSuccessToast message={toastMsg} isOpen={!!toastMsg} onClose={() => setToastMsg("")} />
        </div>
    );
};

export default AddTour;