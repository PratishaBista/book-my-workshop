import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PendingProvider } from '../../../types/admin';

export const PendingProviders: React.FC = () => {
    const [providers, setProviders] = useState<PendingProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<PendingProvider | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve'; itemId: number; } | null>(null);

    const fetchProviders = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('https://localhost:7166/api/admin/providers/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setProviders(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const executeAction = async () => {
        if (!confirmAction) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://localhost:7166/api/admin/approve-provider/${confirmAction.itemId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSelectedItem(null);
                setConfirmAction(null);
                fetchProviders();
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="relative h-full">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Pending Hosts</h2>
                    <p className="text-slate-500 text-sm mt-1">Verify and approve new host applications</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-4">Business Name</div>
                    <div className="col-span-4">Contact Person</div>
                    <div className="col-span-3">Registered At</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Loading...</div>
                    ) : providers.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">No pending applications found.</div>
                    ) : (
                        providers.map(p => (
                            <div key={p.id} onClick={() => setSelectedItem(p)} className={`grid grid-cols-12 gap-4 px-6 py-5 items-center cursor-pointer transition-all ${selectedItem?.id === p.id ? 'bg-orange-50 border-l-4 border-l-[#E57A44]' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}>
                                <div className="col-span-4 font-bold text-slate-700">{p.businessName}</div>
                                <div className="col-span-4 text-sm text-slate-500">
                                    <div className="font-medium text-slate-700">{p.contactPerson}</div>
                                    <div className="text-xs text-slate-400">{p.email}</div>
                                </div>
                                <div className="col-span-3 text-sm text-slate-500 font-mono bg-slate-100 inline-block w-fit px-2 py-1 rounded">{new Date(p.registeredAt).toLocaleDateString()}</div>
                                <div className="col-span-1 text-right"><ChevronRight size={16} className="text-slate-300 ml-auto" /></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed top-20 right-0 h-[calc(100%-80px)] w-[500px] bg-white shadow-2xl border-l border-slate-100 z-50 flex flex-col font-sans"
                    >
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#E57A44] mb-1 block">Details</span>
                                <h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedItem.businessName}</h2>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm"><X size={18} /></button>
                        </div>
                        <div className="p-8 flex-grow overflow-y-auto space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail size={16} className="text-[#E57A44]" />
                                        <span className="text-xs font-bold text-slate-500 uppercase">Email</span>
                                    </div>
                                    <p className="text-lg font-medium text-slate-800">{selectedItem.email}</p>
                                </div>
                                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Handle</span>
                                    <p className="font-mono text-sm text-[#E57A44] font-bold">host/{selectedItem.slug}</p>
                                </div>
                                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">State</span>
                                    <p className="font-bold text-slate-700">{selectedItem.state}</p>
                                </div>
                                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Phone</span>
                                    <p className="font-bold text-slate-700">{selectedItem.phoneNumber}</p>
                                </div>
                                {selectedItem.tagline && (
                                    <div className="col-span-2 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 italic">
                                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1 not-italic">Tagline</span>
                                        "{selectedItem.tagline}"
                                    </div>
                                )}
                                {selectedItem.description && (
                                    <div className="col-span-2 p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Studio Story</span>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-1 gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                            <button onClick={() => setConfirmAction({ type: 'approve', itemId: selectedItem.id })} className="w-full py-3.5 bg-[#E57A44] hover:bg-[#d06735] text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"><Check size={18} /> Approve</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmAction && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-white/50">
                            <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Confirm Approval</h3>
                            <p className="text-slate-500 text-center mb-8 text-sm">Approve this provider?</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setConfirmAction(null)} className="py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                                <button onClick={executeAction} className="py-3 rounded-xl font-bold text-white shadow-lg bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200">Confirm</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
