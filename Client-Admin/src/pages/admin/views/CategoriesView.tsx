import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit3, Trash2, CheckCircle2, XCircle,
    Layers, BarChart3,
    Filter,
    ChevronRight, AlertCircle, Info
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkshopCategory {
    id: number;
    name: string;
    description: string;

    isActive: boolean;
    workshopCount?: number;
}

export const CategoriesView: React.FC = () => {
    const [categories, setCategories] = useState<WorkshopCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<WorkshopCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',

        isActive: true
    });

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.category);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenPanel = (category?: WorkshopCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description,

                isActive: category.isActive
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',

                isActive: true
            });
        }
        setIsPanelOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const token = localStorage.getItem('token');
        const url = editingCategory
            ? `${API_ENDPOINTS.category}/${editingCategory.id}`
            : API_ENDPOINTS.category;

        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsPanelOpen(false);
                fetchCategories();
            } else {
                const data = await response.json();
                setError(data.message || 'Operation failed');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you certain? Deleting a category may leave workshops uncategorized.')) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_ENDPOINTS.category}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchCategories();
            } else {
                setError('Failed to delete category');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Categories', value: categories.length, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active', value: categories.filter(c => c.isActive).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Placements', value: categories.reduce((acc, curr) => acc + (curr.workshopCount || 0), 0), icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-full flex flex-col gap-8 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-sans font-bold text-white tracking-tight">Taxonomy & Categories</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] font-mono">
                        <span className="opacity-60">System Core</span>
                        <ChevronRight size={10} className="opacity-40" />
                        <span className="text-indigo-400">Taxonomy Manager</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOpenPanel()}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold font-mono text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Append Node
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-[#0D0D0D] p-6 rounded-2xl border border-[#1A1A1A] flex items-center justify-between group hover:border-[#333] transition-all"
                    >
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono group-hover:text-slate-400 transition-colors">{stat.label}</p>
                            <p className="text-3xl font-sans font-bold text-white tracking-tighter">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-black border border-[#1A1A1A] ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-[#0D0D0D] p-4 rounded-2xl border border-[#1A1A1A] flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search taxonomy nodes by identity or logic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black border border-[#1A1A1A] focus:border-indigo-500/50 rounded-xl transition-all outline-none font-mono text-[11px] uppercase tracking-wider text-slate-300 placeholder:text-slate-800"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-[#1A1A1A] rounded-xl text-slate-500 font-bold hover:bg-black transition-all text-[10px] uppercase tracking-widest font-mono">
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[400px]">
                {isLoading ? (
                    <div className="h-96 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-2 border-white/5 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] font-mono animate-pulse">Syncing Topology...</p>
                    </div>
                ) : (
                    <div className="bg-[#0D0D0D] rounded-3xl border border-[#1A1A1A] overflow-hidden shadow-2xl shadow-black/50">
                        <div className="px-8 py-5 flex items-center justify-between bg-black/40 border-b border-[#1A1A1A]">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono">{filteredCategories.length} NODES DETECTED</span>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-black/20">
                                        <th className="px-8 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 font-mono">Identity & Logic</th>
                                        <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 font-mono">Visibility</th>
                                        <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 font-mono text-right">Operation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1A1A1A]">
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="group hover:bg-white/[0.02] transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-start gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-black border border-[#1A1A1A] flex items-center justify-center text-slate-600 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-500">
                                                        <Layers size={22} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight text-lg">{category.name}</h4>
                                                        <p className="text-[11px] text-slate-500 max-w-sm line-clamp-1 opacity-70 font-mono">{category.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-mono">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-[9px] font-bold uppercase tracking-widest ${category.isActive
                                                    ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-slate-800/10 text-slate-600 border-slate-700/20'
                                                    }`}>
                                                    <div className={`w-1 h-1 rounded-full ${category.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                                    {category.isActive ? 'Live' : 'Hidden'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleOpenPanel(category)}
                                                        className="p-3 bg-black border border-[#1A1A1A] hover:border-indigo-500/30 text-slate-500 hover:text-indigo-400 rounded-xl transition-all"
                                                        title="Edit Topology"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="p-3 bg-black border border-[#1A1A1A] hover:border-red-500/30 text-slate-500 hover:text-red-500 rounded-xl transition-all"
                                                        title="Eject Node"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isPanelOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPanelOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-xl bg-[#0A0A0A] h-screen shadow-[-20px_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border-l border-[#1A1A1A]"
                        >
                            <div className="p-8 border-b border-[#1A1A1A] flex items-center justify-between bg-black">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-sans font-bold text-white tracking-tight">
                                        {editingCategory ? 'Edit Taxonomy Node' : 'Configure New Segment'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] font-mono uppercase opacity-60">System Hierarchy Configuration</p>
                                </div>
                                <button onClick={() => setIsPanelOpen(false)} className="p-3 bg-[#111] border border-[#222] rounded-xl text-slate-500 hover:text-white transition-all shadow-xl">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                {error && (
                                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4">
                                        <AlertCircle className="text-red-500 shrink-0 mt-1" size={18} />
                                        <div className="space-y-1">
                                            <p className="font-bold text-red-500 text-[10px] uppercase font-mono tracking-widest">Logic Conflict</p>
                                            <p className="text-red-400 text-xs font-medium leading-relaxed">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-8">
                                    {/* Name Input */}
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">Segment Label</span>
                                            <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Required Node IP</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-6 py-4 bg-black border border-[#1A1A1A] focus:border-indigo-500/50 rounded-2xl transition-all outline-none font-bold text-white placeholder:text-slate-800 font-mono tracking-tight"
                                            placeholder="ENTER_SEGMENT_LABEL..."
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">Global Logic Descriptor</span>
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-6 py-4 bg-black border border-[#1A1A1A] focus:border-indigo-500/50 rounded-2xl transition-all outline-none min-h-[140px] font-medium text-slate-400 placeholder:text-slate-800 resize-none text-sm tracking-tight leading-relaxed"
                                            placeholder="Describe the scope of this workshop segment..."
                                            required
                                        />
                                    </div>

                                    {/* Position & Status */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">Deployment Status</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                            className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl border transition-all ${formData.isActive
                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                                : 'bg-black border-[#1A1A1A] text-slate-600'
                                                }`}
                                        >
                                            <span className="font-bold text-[10px] uppercase tracking-[0.2em] font-mono">{formData.isActive ? 'Active Node' : 'Inert'}</span>
                                            <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-800'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex gap-4">
                                    <Info className="text-indigo-400 shrink-0" size={18} />
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-[0.2em] font-mono opacity-60">
                                        Topology changes will propagate across all assigned workshop clusters and the public discovery engine.
                                    </p>
                                </div>
                            </form>

                            <div className="p-8 border-t border-[#1A1A1A] bg-black flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsPanelOpen(false)}
                                    className="flex-1 py-4 border border-[#1A1A1A] text-slate-500 font-bold rounded-xl hover:bg-[#111] transition-all uppercase tracking-widest text-[10px] font-mono"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/10 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] font-mono"
                                >
                                    {editingCategory ? 'Commit Topology' : 'Deploy Node'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
