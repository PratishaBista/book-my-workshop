import React, { useState, useEffect } from 'react';
import { Filter, Search, Calendar, MapPin, Users } from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';

interface LiveWorkshop {
    id: number;
    title: string;
    providerName: string;
    price: number;
    categoryNames: string[];
    publishedAt: string;
    maxCapacity: number;
    locationAddress: string;
}

export const LiveWorkshops: React.FC = () => {
    const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                // Fetch Categories
                const catRes = await fetch(API_ENDPOINTS.category);
                if (catRes.ok) setCategories(await catRes.json());

                // Fetch Live Workshops
                const res = await fetch(`${API_ENDPOINTS.admin.workshops}/live`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setWorkshops(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Logic
    const filteredWorkshops = workshops.filter(w => {
        const matchesCategory = selectedCategory === 'All' || w.categoryNames.includes(selectedCategory);
        const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.providerName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="h-full font-sans flex flex-col">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">Live Marketplace</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono mt-1 opacity-80">Synchronized Node Monitor</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#0D0D0D] p-4 rounded-2xl border border-[#1A1A1A] mb-6 flex gap-4 items-center">
                <div className="flex items-center gap-3 bg-[#000] px-4 py-2.5 rounded-xl border border-[#1A1A1A] flex-1">
                    <Search size={16} className="text-slate-600" />
                    <input
                        type="text"
                        placeholder="Search active clusters..."
                        className="bg-transparent outline-none text-xs font-mono w-full text-slate-300 placeholder:text-slate-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 bg-[#000] px-4 py-2.5 rounded-xl border border-[#1A1A1A] min-w-[200px]">
                    <Filter size={16} className="text-slate-600" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent outline-none text-xs font-bold font-mono text-slate-400 w-full cursor-pointer appearance-none"
                    >
                        <option value="All">ALL_CATEGORIES</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-12 custom-scrollbar">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-600 animate-pulse font-mono font-bold text-xs uppercase tracking-[0.3em]">Downloading Live Topology...</div>
                ) : filteredWorkshops.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic font-mono text-xs uppercase tracking-widest">No matching nodes detected in live buffer.</div>
                ) : (
                    filteredWorkshops.map(w => (
                        <div key={w.id} className="bg-[#0D0D0D] rounded-2xl border border-[#1A1A1A] hover:border-[#333] transition-all p-6 flex flex-col gap-5 group">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {w.categoryNames.map(cat => (
                                            <span key={cat} className="text-[9px] uppercase font-bold tracking-widest bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">{cat}</span>
                                        ))}
                                    </div>
                                    <h3 className="font-bold text-white text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2 tracking-tight">{w.title}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300 bg-[#000] p-3 rounded-xl border border-[#1A1A1A] font-mono">
                                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                                    {w.providerName.charAt(0)}
                                </div>
                                <span className="uppercase tracking-wider">{w.providerName}</span>
                            </div>

                            <div className="flex justify-between items-end mt-2">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                        <Users size={12} className="text-indigo-600" />
                                        <span>COHORT: {w.maxCapacity}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                        <Calendar size={12} className="text-indigo-600" />
                                        <span>SYNC: {new Date(w.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-white font-mono tracking-tighter">NPR {w.price.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#1A1A1A] flex items-center gap-2 text-[10px] text-slate-600 font-mono lowercase truncate">
                                <MapPin size={12} className="shrink-0 text-indigo-900" />
                                <span className="truncate opacity-60 tracking-tight">{w.locationAddress}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
