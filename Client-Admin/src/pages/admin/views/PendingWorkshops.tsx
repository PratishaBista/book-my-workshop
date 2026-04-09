import React, { useState, useEffect } from 'react';
import { ChevronRight, X, BrainCircuit, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PendingWorkshop } from '../../../types/admin';
import { API_ENDPOINTS } from '../../../config/api';

interface MLSuggestion {
    suggested_category: string;
    confidence_score: number;
    is_confident: boolean;
}

export const PendingWorkshops: React.FC = () => {
    const [workshops, setWorkshops] = useState<PendingWorkshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<PendingWorkshop | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; itemId: number; } | null>(null);

    // ML Specific State
    const [isMLAnalyzing, setIsMLAnalyzing] = useState(false);
    const [mlSuggestion, setMLSuggestion] = useState<MLSuggestion | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [manualCategoryId, setManualCategoryId] = useState<number | undefined>();

    const fetchCategories = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.category);
            if (res.ok) setCategories(await res.json());
        } catch (e) { console.error(e); }
    };

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

    useEffect(() => {
        fetchWorkshops();
        fetchCategories();
    }, []);

    const fetchMLSuggestion = async (workshop: PendingWorkshop) => {
        setIsMLAnalyzing(true);
        setMLSuggestion(null);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(API_ENDPOINTS.ml.suggestCategory, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: workshop.title,
                    description: workshop.description
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMLSuggestion(data);
            }
        } catch (e) {
            console.error('ML Inference Error:', e);
        } finally {
            setIsMLAnalyzing(false);
        }
    };

    const handleSelectWorkshop = (workshop: PendingWorkshop) => {
        setSelectedItem(workshop);

        // Auto-populate from stored AI data if available
        if (workshop.aiSuggestedCategory) {
            setMLSuggestion({
                suggested_category: workshop.aiSuggestedCategory,
                confidence_score: workshop.aiConfidenceScore || 0,
                is_confident: workshop.aiIsConfident || false
            });
            setIsMLAnalyzing(false);

            // Auto-select if confident
            const match = categories.find(c => c.name === workshop.aiSuggestedCategory);
            if (match && workshop.aiIsConfident) setManualCategoryId(match.id);
            else setManualCategoryId(undefined);

        } else {
            // Fallback for legacy records without AI data
            fetchMLSuggestion(workshop);
        }
    };

    // Auto-select ML suggestion when it arrives
    useEffect(() => {
        if (mlSuggestion && mlSuggestion.is_confident) {
            const match = categories.find(c => c.name === mlSuggestion.suggested_category);
            if (match) setManualCategoryId(match.id);
        }
    }, [mlSuggestion, categories]);

    const executeAction = async () => {
        if (!confirmAction) return;
        const token = localStorage.getItem('token');
        const endpoint = confirmAction.type === 'approve'
            ? API_ENDPOINTS.admin.approveWorkshop(confirmAction.itemId)
            : API_ENDPOINTS.admin.rejectWorkshop(confirmAction.itemId);

        try {
            const options: RequestInit = {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            };

            if (confirmAction.type === 'approve') {
                options.headers = { ...options.headers, 'Content-Type': 'application/json' };
                options.body = JSON.stringify({ categoryId: manualCategoryId });
            }

            const res = await fetch(endpoint, options);
            if (res.ok) {
                setSelectedItem(null);
                setConfirmAction(null);
                fetchWorkshops();
            } else {
                alert("Failed: " + (await res.text()));
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="relative h-full font-sans">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">Pending Review</h2>
                    <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest opacity-80">Classify and approve workshop submissions</p>
                </div>
            </div>

            <div className="bg-[#0D0D0D] rounded-2xl border border-[#1A1A1A] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#000] border-b border-[#1A1A1A] text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    <div className="col-span-4">Workshop Identity</div>
                    <div className="col-span-4">Provider Agency</div>
                    <div className="col-span-3">Unit Price</div>
                    <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <div className="p-12 text-center text-slate-600 animate-pulse font-bold uppercase tracking-widest text-xs font-mono">Synchronizing Buffer...</div>
                    ) : workshops.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-medium italic font-mono uppercase tracking-widest text-xs">Queue empty. No pending taxonomy validations.</div>
                    ) : (
                        workshops.map(w => (
                            <div key={w.id} onClick={() => handleSelectWorkshop(w)} className={`grid grid-cols-12 gap-4 px-6 py-5 items-center cursor-pointer transition-all border-l-4 ${selectedItem?.id === w.id ? 'bg-[#1D1B26] border-l-indigo-500' : 'hover:bg-[#111] border-l-transparent'}`}>
                                <div className="col-span-4">
                                    <div className="font-bold text-white tracking-tight">{w.title}</div>
                                    <div className="flex items-center gap-2 mt-1.5 focus:outline-none">
                                        <span className="text-[9px] font-bold uppercase bg-black/40 border border-[#222] text-slate-400 px-2 py-0.5 rounded font-mono tracking-widest">{w.categoryNames?.[0] || 'Uncategorized'}</span>
                                    </div>
                                </div>
                                <div className="col-span-4 text-xs text-slate-400 font-medium tracking-tight">{w.providerName}</div>
                                <div className="col-span-3 text-sm font-bold text-white font-mono tracking-tighter">NPR {w.price.toLocaleString()}</div>
                                <div className="col-span-1 text-right"><ChevronRight size={14} className="text-slate-600 ml-auto" /></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }} className="fixed top-0 right-0 h-screen w-[550px] bg-[#0A0A0A] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] z-50 flex flex-col border-l border-[#1A1A1A]">
                        {/* Header */}
                        <div className="p-8 border-b border-[#1A1A1A] flex justify-between items-center bg-[#000]">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2 block font-mono">Classification Analysis</span>
                                <h2 className="text-xl font-bold text-white leading-tight tracking-tight">{selectedItem.title}</h2>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-2.5 rounded-xl bg-[#111] text-slate-500 hover:text-white transition-all font-bold border border-[#222]">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-grow overflow-y-auto space-y-10 custom-scrollbar">
                            {/* ML Insight Block */}
                            <div className="relative overflow-hidden group font-mono">
                                <div className="absolute inset-0 bg-indigo-500/[0.03] rounded-[2rem] -z-10" />
                                <div className="p-6 border border-indigo-500/20 rounded-[2rem] space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <BrainCircuit size={18} />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Logic Insight</span>
                                        </div>
                                        {isMLAnalyzing && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                                    </div>

                                    {mlSuggestion ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="flex items-baseline justify-between mb-2">
                                                <h3 className="text-2xl font-bold text-white tracking-tighter">
                                                    {mlSuggestion.suggested_category === "Uncategorized" ? "Expansion Required" : mlSuggestion.suggested_category}
                                                </h3>
                                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${mlSuggestion.is_confident ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                    {Math.round(mlSuggestion.confidence_score * 100)}% Match
                                                </div>
                                            </div>

                                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-wide">
                                                {mlSuggestion.is_confident
                                                    ? `High confidence match discovered. Taxonomy vectors aligned with "${mlSuggestion.suggested_category}" cluster.`
                                                    : `Taxonomy collision detected. Suggesting manual node placement.`}
                                            </p>

                                            {!mlSuggestion.is_confident && (
                                                <div className="mt-4 flex items-center gap-2 p-3 bg-orange-500/5 rounded-xl border border-orange-500/20">
                                                    <AlertTriangle size={14} className="text-orange-400" />
                                                    <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">Anomaly: Topology Conflict</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : !isMLAnalyzing && (
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic opacity-50">Pulse trigger required for inference...</p>
                                    )}

                                    {/* Manual Override Dropdown */}
                                    <div className="pt-4 border-t border-white/5">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-3">
                                            {mlSuggestion?.is_confident ? 'Verified Cluster' : 'Manual Placement'}
                                        </label>
                                        <select
                                            value={manualCategoryId || ''}
                                            onChange={(e) => setManualCategoryId(Number(e.target.value))}
                                            className={`w-full bg-black border rounded-xl px-4 py-3 text-xs font-bold text-slate-300 outline-none focus:border-indigo-500 transition-colors ${!mlSuggestion?.is_confident && !manualCategoryId ? 'border-orange-500/50' : 'border-[#222]'}`}
                                        >
                                            <option value="">-- SELECT TAXONOMY NODE --</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">Executive Summary</label>
                                    <div className="p-6 bg-[#000] rounded-2xl border border-[#1A1A1A] text-slate-400 text-[11px] leading-relaxed tracking-tight">
                                        {selectedItem.description}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl group hover:border-indigo-500/30 transition-colors">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase mb-2 tracking-[0.2em] font-mono">Unit Value</div>
                                        <div className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors font-mono tracking-tighter">NPR {selectedItem.price.toLocaleString()}</div>
                                    </div>
                                    <div className="p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl font-mono">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase mb-2 tracking-[0.2em]">Cohort Size</div>
                                        <div className="text-xl font-bold text-white tracking-tighter">{selectedItem.maxCapacity} UX</div>
                                    </div>
                                </div>

                                <div className="p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl">
                                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-2 tracking-[0.2em] font-mono">Logistic Anchor</div>
                                    <div className="text-xs font-bold text-slate-200 tracking-tight">{selectedItem.locationName}</div>
                                    <div className="text-[10px] text-slate-500 mt-1 font-mono uppercase opacity-60 tracking-wider">{selectedItem.locationAddress}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-8 border-t border-[#1A1A1A] bg-[#000] grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfirmAction({ type: 'reject', itemId: selectedItem.id })}
                                className="py-4 bg-transparent hover:bg-red-500/10 text-slate-500 hover:text-red-400 font-bold rounded-2xl border border-[#1A1A1A] hover:border-red-500/30 transition-all text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 font-mono"
                            >
                                <X size={14} /> Reject
                            </button>
                            <button
                                onClick={() => setConfirmAction({ type: 'approve', itemId: selectedItem.id })}
                                className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 font-mono"
                            >
                                <CheckCircle size={14} /> Commit Entry
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0D0D0D] rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-[#1A1A1A] space-y-6">
                            <div className="text-center space-y-3">
                                <h3 className="text-xl font-bold text-white font-sans tracking-tight">
                                    {confirmAction.type === 'approve' ? 'Authorize Submission?' : 'Confirm Rejection?'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Marketplace Propagation Imminent</p>

                                {confirmAction.type === 'approve' && (
                                    <div className="text-left pt-4 p-5 bg-[#000] rounded-xl border border-[#1A1A1A]">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 font-mono">Final Taxonomy Node</p>
                                        <p className="text-sm font-bold text-indigo-400 font-mono">
                                            {categories.find(c => c.id === manualCategoryId)?.name.toUpperCase() || <span className="text-red-500 font-bold">UNDEFINED_CLUSTER</span>}
                                        </p>
                                        {!manualCategoryId && (
                                            <p className="text-[9px] text-red-500 mt-2 font-bold font-mono tracking-widest">⚠️ REQUIRES NODE ATTACHMENT</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setConfirmAction(null)} className="py-4 rounded-xl border border-[#1A1A1A] text-slate-400 font-bold hover:bg-[#111] text-[10px] uppercase tracking-[0.2em] font-mono">Abort</button>
                                <button onClick={executeAction} disabled={confirmAction.type === 'approve' && !manualCategoryId} className={`py-4 rounded-xl font-bold text-white shadow-lg text-[10px] uppercase tracking-[0.2em] font-mono disabled:opacity-20 disabled:cursor-not-allowed ${confirmAction.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>Execute</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
