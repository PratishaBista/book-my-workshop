import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronRight, Check, X, FileText, Eye, Info, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PendingProvider } from '../../../types/admin';

export const PendingProviders: React.FC = () => {
    const [providers, setProviders] = useState<PendingProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<PendingProvider | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve'; itemId: number; } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

    const getTrustColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
        if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
        return 'text-slate-400 bg-slate-50 border-slate-100';
    };

    return (
        <div className="relative h-full font-sans">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Pending Host Applications</h2>
                <p className="text-slate-500 text-xs mt-0.5">Review and verify artisan credentials for marketplace safety.</p>
            </div>

            <div className="bg-[#0D0D0D] rounded-2xl border border-[#1A1A1A] overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#000] border-b border-[#1A1A1A] text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    <div className="col-span-4">Business & Identity</div>
                    <div className="col-span-3">Contact</div>
                    <div className="col-span-2 text-center">AI Integrity</div>
                    <div className="col-span-2">Submitted</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <div className="p-10 text-center text-slate-500 text-sm font-mono">Loading telemetry...</div>
                    ) : providers.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 text-sm italic font-mono uppercase tracking-widest">No pending applications found.</div>
                    ) : (
                        providers.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => setSelectedItem(p)} 
                                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-all ${selectedItem?.id === p.id ? 'bg-[#1A1A1A]' : 'hover:bg-[#111111]'}`}
                            >
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#000] border border-[#222] flex items-center justify-center text-slate-500 font-bold text-[10px] uppercase">
                                        {p.businessName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm leading-tight tracking-tight">{p.businessName}</div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                                            <MapPin size={10} /> {p.state}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <div className="text-xs font-semibold text-slate-200 tracking-tight">{p.contactPerson}</div>
                                    <div className="text-[10px] text-slate-500 truncate font-mono">{p.email}</div>
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    {p.trustScore > 0 ? (
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold font-mono ${getTrustColor(p.trustScore)}`}>
                                            <ShieldCheck size={12} />
                                            {Math.round(p.trustScore)}%
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-slate-600 font-bold font-mono uppercase tracking-widest">Unverified</div>
                                    )}
                                </div>
                                <div className="col-span-2 text-[11px] text-slate-400 font-mono">
                                    {new Date(p.registeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="col-span-1 text-right">
                                    <ChevronRight size={14} className="text-slate-700 ml-auto" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-screen w-[420px] bg-[#0A0A0A] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-[#1A1A1A] z-50 flex flex-col p-8"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{selectedItem.businessName}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-[0.1em] font-mono ${getTrustColor(selectedItem.trustScore)}`}>
                                        Integrity Score: {Math.round(selectedItem.trustScore)}%
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-[#1A1A1A] rounded-full transition-colors"><X size={20} className="text-slate-600" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-8 pb-6 pr-2 custom-scrollbar">
                            <section>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
                                    <Info size={12} /> Basic Information
                                </h4>
                                <div className="bg-[#000] rounded-2xl p-5 space-y-4 border border-[#1A1A1A]">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-mono text-[10px] uppercase">Contact</span>
                                        <span className="font-semibold text-slate-300 tracking-tight">{selectedItem.contactPerson}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-mono text-[10px] uppercase">Email</span>
                                        <span className="font-semibold text-indigo-400 font-mono">{selectedItem.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-mono text-[10px] uppercase">Phone</span>
                                        <span className="font-semibold text-slate-300 font-mono">{selectedItem.phoneNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-mono text-[10px] uppercase">Location</span>
                                        <span className="font-semibold text-slate-300 tracking-tight">{selectedItem.state}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
                                    <ShieldCheck size={12} /> Verification
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                    {selectedItem.idCardUrl ? (
                                        <div className="bg-[#000] border border-[#1A1A1A] rounded-xl p-3 hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => setPreviewImage(selectedItem.idCardUrl!)}>
                                            <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                                <FileText size={14} />
                                                <span className="text-[9px] font-bold uppercase font-mono tracking-widest">Govt ID</span>
                                            </div>
                                            <div className="aspect-video bg-black rounded overflow-hidden relative border border-white/5">
                                                {selectedItem.idCardUrl.endsWith('.pdf') ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#050505] text-slate-600 font-bold text-[9px] font-mono">PDF_STREAM</div>
                                                ) : (
                                                    <img src={selectedItem.idCardUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="ID" />
                                                )}
                                                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                    <Eye size={16} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-[#000] border border-dashed border-[#1A1A1A] rounded-xl p-4 flex items-center justify-center text-[9px] text-slate-600 uppercase font-mono">No ID Uploaded</div>
                                    )}

                                    {selectedItem.panCardUrl ? (
                                        <div className="bg-[#000] border border-[#1A1A1A] rounded-xl p-3 hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => setPreviewImage(selectedItem.panCardUrl!)}>
                                            <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                                <FileText size={14} />
                                                <span className="text-[9px] font-bold uppercase font-mono tracking-widest">PAN Card</span>
                                            </div>
                                            <div className="aspect-video bg-black rounded overflow-hidden relative border border-white/5">
                                                {selectedItem.panCardUrl.endsWith('.pdf') ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#050505] text-slate-600 font-bold text-[9px] font-mono">PDF_STREAM</div>
                                                ) : (
                                                    <img src={selectedItem.panCardUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="PAN" />
                                                )}
                                                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                    <Eye size={16} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-[#000] border border-dashed border-[#1A1A1A] rounded-xl p-4 flex items-center justify-center text-[9px] text-slate-600 uppercase font-mono">No PAN Uploaded</div>
                                    )}
                                    </div>

                                    {/* Studio Image - full width */}
                                    {selectedItem.studioImageUrl ? (
                                        <div className="bg-[#000] border border-[#1A1A1A] rounded-xl p-3 hover:border-emerald-500/50 transition-colors cursor-pointer group" onClick={() => setPreviewImage(selectedItem.studioImageUrl!)}>
                                            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                                <Info size={14} />
                                                <span className="text-[9px] font-bold uppercase font-mono tracking-widest">Workspace Photo</span>
                                            </div>
                                            <div className="w-full h-40 bg-black border border-white/5 rounded overflow-hidden relative">
                                                <img src={selectedItem.studioImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale contrast-125" alt="Studio" />
                                                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                    <Eye size={20} className="text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-[#111] border border-dashed border-[#222] rounded-xl p-4 flex items-center justify-center gap-2 text-[9px] text-amber-500 font-bold uppercase tracking-widest font-mono">
                                            <Info size={12} /> Studio Required
                                        </div>
                                    )}
                                </div>
                            </section>

                            {(selectedItem.tagline || selectedItem.description) && (
                                <section>
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
                                        <FileText size={12} /> Description
                                    </h4>
                                    <div className="bg-[#000] rounded-2xl p-5 border border-[#1A1A1A]">
                                        {selectedItem.tagline && <p className="text-sm font-bold text-white italic  mb-4 border-l-2 border-indigo-500 pl-4">"{selectedItem.tagline}"</p>}
                                        <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="pt-8 border-t border-[#1A1A1A]">
                            <button 
                                onClick={() => setConfirmAction({ type: 'approve', itemId: selectedItem.id })}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                            >
                                <Check size={18} /> Approve Host
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmAction && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative border border-white/50 text-center">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Approval</h3>
                            <p className="text-slate-500 mb-8 text-sm leading-relaxed">By approving this host, they will gain full access to publish workshops on the marketplace.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setConfirmAction(null)} className="py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-sm">Cancel</button>
                                <button onClick={executeAction} className="py-3 rounded-xl font-bold text-white shadow-lg bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100 text-sm">Confirm</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Preview Overlay */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 cursor-zoom-out"
                        onClick={() => setPreviewImage(null)}
                    >
                        {previewImage.endsWith('.pdf') ? (
                            <iframe src={previewImage} className="w-full max-w-4xl h-full rounded-2xl bg-white" />
                        ) : (
                            <img src={previewImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Preview" />
                        )}
                        <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors" onClick={() => setPreviewImage(null)}><X size={40} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
