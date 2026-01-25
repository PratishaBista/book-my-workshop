import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit3, Trash2, CheckCircle2, XCircle,
    Layers, MoreHorizontal, ArrowUpRight, BarChart3,
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
        <div className="min-h-full bg-slate-50/30 flex flex-col gap-6 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-sans font-bold text-slate-900 tracking-tight">Taxonomy & Categories</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span>Management Control Panel</span>
                        <ChevronRight size={14} />
                        <span className="text-slate-900 font-semibold">Workshop Categories</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">


                    <button
                        onClick={() => handleOpenPanel()}
                        className="flex items-center gap-2 bg-[#0E0E0C] hover:bg-[#1a1a17] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 text-sm"
                    >
                        <Plus size={18} />
                        New Category
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
                    >
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                            <p className="text-2xl font-sans font-bold text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                            <stat.icon size={24} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E57A44] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Filter taxonomy by name, property, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent border-b-2 focus:border-[#E57A44] rounded-2xl transition-all outline-none font-medium placeholder:text-slate-300"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm">
                        <Filter size={18} /> Filters
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm">
                        <ArrowUpRight size={18} /> Export
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[400px]">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-[#0E0E0C]/10 border-t-[#0E0E0C] rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold animate-pulse">Syncing Database...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{filteredCategories.length} Categories found</span>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Default Sort: Name</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/30">
                                        <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Identity & Taxonomy</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Visibility</th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Utility</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="group hover:bg-slate-50/80 transition-all cursor-default">
                                            <td className="px-8 py-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0E0E0C] group-hover:text-white transition-all duration-300">
                                                        <Layers size={22} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-slate-900 group-hover:text-[#E57A44] transition-colors">{category.name}</h4>
                                                        <p className="text-xs text-slate-400 max-w-sm line-clamp-1">{category.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${category.isActive
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                                    {category.isActive ? 'Live' : 'Hidden'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleOpenPanel(category)}
                                                        className="p-2.5 hover:bg-white hover:shadow-sm text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                                        title="Edit Topology"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="p-2.5 hover:bg-white hover:shadow-sm text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                                        title="Archive Category"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <div className="w-px h-6 bg-slate-100 mx-1" />
                                                    <button className="p-2.5 text-slate-300 hover:text-slate-900 transition-colors">
                                                        <MoreHorizontal size={18} />
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
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-xl bg-white h-screen shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-sans font-bold text-slate-900 uppercase tracking-tight">
                                        {editingCategory ? 'Edit Taxonomy Node' : 'Configure New Segment'}
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">System Hierarchy Controls</p>
                                </div>
                                <button onClick={() => setIsPanelOpen(false)} className="p-3 hover:bg-white shadow-sm border border-slate-100 rounded-2xl transition-all">
                                    <XCircle size={24} className="text-slate-400 hover:text-slate-900" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                                {error && (
                                    <div className="p-6 bg-red-50 border border-red-100 rounded-[1.5rem] flex items-start gap-4 animate-in slide-in-from-top-4">
                                        <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                                        <div className="space-y-1">
                                            <p className="font-bold text-red-900 text-sm">Action Required</p>
                                            <p className="text-red-600 text-xs font-medium leading-relaxed">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-8">
                                    {/* Name Input */}
                                    <div className="space-y-2.5">
                                        <label className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category Name</span>
                                            <span className="text-[10px] text-slate-300">Required Property</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#E57A44] focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-900 placeholder:text-slate-200"
                                            placeholder="Enter classification name..."
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2.5">
                                        <label className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Description</span>
                                            <span className="text-[10px] text-slate-300">Minimum 20 characters</span>
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-[#E57A44] focus:bg-white rounded-2xl transition-all outline-none min-h-[140px] font-medium text-slate-600 placeholder:text-slate-200 resize-none"
                                            placeholder="Describe the scope of this workshop segment..."
                                            required
                                        />
                                    </div>

                                    {/* Position & Status */}

                                    <div className="space-y-2.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Status</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${formData.isActive
                                                ? 'bg-green-50/50 border-green-200 text-green-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-400'
                                                }`}
                                        >
                                            <span className="font-bold text-sm uppercase tracking-wide">{formData.isActive ? 'Active Node' : 'Dormant'}</span>
                                            <div className={`w-2.5 h-2.5 rounded-full ${formData.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
                                    <Info className="text-[#E57A44] shrink-0" size={20} />
                                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-wide">
                                        Note: Changes to the taxonomy will propagate across all assigned workshops and the public discovery engine.
                                    </p>
                                </div>
                            </form>

                            <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsPanelOpen(false)}
                                    className="flex-1 py-4 border-2 border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-[2] py-4 bg-[#0E0E0C] text-white font-bold rounded-2xl hover:bg-[#1a1a17] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                                >
                                    {editingCategory ? 'Finalize Topology' : 'Commit to Database'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
