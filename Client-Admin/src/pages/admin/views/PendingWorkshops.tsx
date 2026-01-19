import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PendingWorkshop } from '../../../types/admin';
import { API_ENDPOINTS } from '../../../config/api';

export const PendingWorkshops: React.FC = () => {
    const [workshops, setWorkshops] = useState<PendingWorkshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<PendingWorkshop | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; itemId: number; } | null>(null);

    const fetchWorkshops = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_ENDPOINTS.admin.workshops}/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setWorkshops(await res.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchWorkshops(); }, []);

    const executeAction = async () => {
        if (!confirmAction) return;
        const token = localStorage.getItem('token');
        const endpoint = confirmAction.type === 'approve'
            ? API_ENDPOINTS.admin.approveWorkshop(confirmAction.itemId)
            : API_ENDPOINTS.admin.rejectWorkshop(confirmAction.itemId);

        try {
            const res = await fetch(endpoint, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                setSelectedItem(null);
                setConfirmAction(null);
                fetchWorkshops();
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="relative h-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Pending Workshops</h2>
                <p className="text-slate-500 text-sm mt-1">Review workshop submissions</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-4">Title</div>
                    <div className="col-span-4">Provider</div>
                    <div className="col-span-3">Price</div>
                    <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-slate-50">
                    {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : workshops.length === 0 ? <div className="p-12 text-center text-slate-400">No pending workshops.</div> : (
                        workshops.map(w => (
                            <div key={w.id} onClick={() => setSelectedItem(w)} className={`grid grid-cols-12 gap-4 px-6 py-5 items-center cursor-pointer transition-all ${selectedItem?.id === w.id ? 'bg-orange-50 border-l-4 border-l-[#E57A44]' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}>
                                <div className="col-span-4">
                                    <div className="font-bold text-slate-700">{w.title}</div>
                                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-1 inline-block">{w.categoryName}</span>
                                </div>
                                <div className="col-span-4 text-sm text-slate-500">{w.providerName}</div>
                                <div className="col-span-3 text-sm font-bold text-[#E57A44]">${w.price}</div>
                                <div className="col-span-1 text-right"><ChevronRight size={16} className="text-slate-300 ml-auto" /></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }} className="fixed top-20 right-0 h-[calc(100%-80px)] w-[500px] bg-white shadow-2xl border-l border-slate-100 z-50 flex flex-col font-sans">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div><span className="text-xs font-bold uppercase tracking-widest text-[#E57A44] mb-1 block">Details</span><h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedItem.title}</h2></div>
                            <button onClick={() => setSelectedItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition-all shadow-sm"><X size={18} /></button>
                        </div>
                        <div className="p-8 flex-grow overflow-y-auto space-y-6 custom-scrollbar">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed italic">"{selectedItem.description}"</div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 p-4 bg-white border border-slate-100 shadow-sm rounded-xl"><div className="text-xs text-slate-400 font-bold uppercase mb-1">Price</div><div className="text-xl font-bold text-[#E57A44]">${selectedItem.price}</div></div>
                                <div className="flex-1 p-4 bg-white border border-slate-100 shadow-sm rounded-xl"><div className="text-xs text-slate-400 font-bold uppercase mb-1">Capacity</div><div className="text-xl font-bold text-slate-700">{selectedItem.maxCapacity}</div></div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                            <button onClick={() => setConfirmAction({ type: 'reject', itemId: selectedItem.id })} className="w-full py-3.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 font-bold rounded-xl border border-slate-200 hover:border-red-200 transition-all flex items-center justify-center gap-2"><X size={18} /> Reject</button>
                            <button onClick={() => setConfirmAction({ type: 'approve', itemId: selectedItem.id })} className="w-full py-3.5 bg-[#E57A44] hover:bg-[#d06735] text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"><Check size={18} /> Approve</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmAction && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-white/50">
                            <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">{confirmAction.type === 'approve' ? 'Approve Workshop' : 'Reject Workshop'}</h3>
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button onClick={() => setConfirmAction(null)} className="py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                                <button onClick={executeAction} className={`py-3 rounded-xl font-bold text-white shadow-lg ${confirmAction.type === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>Confirm</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
