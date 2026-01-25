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
                    <h2 className="text-2xl font-bold text-slate-800">Pending Topology Review</h2>
                    <p className="text-slate-500 text-sm mt-1">Classify and approve workshop submissions</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-4">Workshop Identity</div>
                    <div className="col-span-4">Provider Agency</div>
                    <div className="col-span-3">Unit Price</div>
                    <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-12 text-center text-slate-300 animate-pulse font-bold uppercase tracking-widest text-xs">Synchronizing Buffer...</div>
                    ) : workshops.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-medium italic">Queue empty. No pending taxonomy validations.</div>
                    ) : (
                        workshops.map(w => (
                            <div key={w.id} onClick={() => handleSelectWorkshop(w)} className={`grid grid-cols-12 gap-4 px-6 py-5 items-center cursor-pointer transition-all ${selectedItem?.id === w.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}>
                                <div className="col-span-4">
                                    <div className="font-bold text-slate-900">{w.title}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold uppercase bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{w.categoryNames?.[0] || 'Uncategorized'}</span>
                                    </div>
                                </div>
                                <div className="col-span-4 text-sm text-slate-600 font-medium">{w.providerName}</div>
                                <div className="col-span-3 text-sm font-bold text-slate-900">NPR {w.price.toLocaleString()}</div>
                                <div className="col-span-1 text-right"><ChevronRight size={16} className="text-slate-300 ml-auto" /></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }} className="fixed top-0 right-0 h-screen w-[550px] bg-white shadow-[0_0_100px_rgba(0,0,0,0.1)] z-50 flex flex-col border-l border-slate-100">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1 block">Classification Analysis</span>
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedItem.title}</h2>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all font-bold">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-grow overflow-y-auto space-y-8 custom-scrollbar">
                            {/* ML Insight Block */}
                            <div className="relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-[2rem] -z-10" />
                                <div className="p-6 border border-indigo-100 rounded-[2rem] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <BrainCircuit size={18} />
                                            <span className="text-xs font-bold uppercase tracking-widest">System Logic Insight</span>
                                        </div>
                                        {isMLAnalyzing && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
                                    </div>

                                    {mlSuggestion ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="flex items-baseline justify-between mb-2">
                                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                                    {mlSuggestion.suggested_category === "Uncategorized" ? "Expansion Required" : mlSuggestion.suggested_category}
                                                </h3>
                                                <div className={`text-xs font-bold ${mlSuggestion.is_confident ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {Math.round(mlSuggestion.confidence_score * 100)}% Match
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                                {mlSuggestion.is_confident
                                                    ? `High confidence match found. Based on taxonomy vectors, this workshop aligns perfectly with the "${mlSuggestion.suggested_category}" segment.`
                                                    : `No precise taxonomy match. Title/Description patterns suggest this may be a new market segment or a legacy cluster.`}
                                            </p>

                                            {!mlSuggestion.is_confident && (
                                                <div className="mt-4 flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                    <AlertTriangle size={14} className="text-orange-500" />
                                                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">Anomaly Detected: Review Taxonomy Topology</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : !isMLAnalyzing && (
                                        <p className="text-xs text-slate-400 font-medium italic">Click on a workshop to trigger AI classification...</p>
                                    )}

                                    {/* Manual Override Dropdown */}
                                    <div className="pt-2 border-t border-indigo-50">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                            {mlSuggestion?.is_confident ? 'Verified Category' : 'Manual Classification Required'}
                                        </label>
                                        <select
                                            value={manualCategoryId || ''}
                                            onChange={(e) => setManualCategoryId(Number(e.target.value))}
                                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors ${!mlSuggestion?.is_confident && !manualCategoryId ? 'border-orange-300 ring-2 ring-orange-100' : 'border-slate-200'}`}
                                        >
                                            <option value="">-- Select Category --</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Executive Summary</label>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed">
                                        {selectedItem.description}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-colors">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Unit Value</div>
                                        <div className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">NPR {selectedItem.price.toLocaleString()}</div>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Cohort Limit</div>
                                        <div className="text-xl font-bold text-slate-900">{selectedItem.maxCapacity} Per Slot</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Logistic Anchor</div>
                                    <div className="text-sm font-bold text-slate-700">{selectedItem.locationName}</div>
                                    <div className="text-xs text-slate-400 mt-1">{selectedItem.locationAddress}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-8 border-t border-slate-50 bg-white grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfirmAction({ type: 'reject', itemId: selectedItem.id })}
                                className="py-4 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold rounded-2xl border border-slate-200 hover:border-red-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <X size={16} /> Mark Rejected
                            </button>
                            <button
                                onClick={() => setConfirmAction({ type: 'approve', itemId: selectedItem.id })}
                                className="py-4 bg-[#0E0E0C] hover:bg-[#1a1a17] text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Approve Entry
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-white/50 space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                                    {confirmAction.type === 'approve' ? 'Authorize Submission?' : 'Confirm Rejection?'}
                                </h3>
                                <p className="text-xs font-medium text-slate-400">This action will propagate to the public marketplace topology.</p>

                                {confirmAction.type === 'approve' && (
                                    <div className="text-left pt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Classification</p>
                                        <p className="text-sm font-bold text-indigo-600">
                                            {categories.find(c => c.id === manualCategoryId)?.name || <span className="text-red-500">No Category Selected</span>}
                                        </p>
                                        {!manualCategoryId && (
                                            <p className="text-[10px] text-red-500 mt-2 font-bold">⚠️ Please go back and select a category.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setConfirmAction(null)} className="py-3.5 rounded-2xl border border-slate-200 text-slate-400 font-bold hover:bg-slate-50 text-xs uppercase tracking-widest">Abort</button>
                                <button onClick={executeAction} disabled={confirmAction.type === 'approve' && !manualCategoryId} className={`py-3.5 rounded-2xl font-bold text-white shadow-lg text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${confirmAction.type === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-red-500 hover:bg-red-600 shadow-red-100'}`}>Execute</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
