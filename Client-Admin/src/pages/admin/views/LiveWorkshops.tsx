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
                    <h2 className="text-2xl font-bold text-slate-800">Live Marketplace</h2>
                    <p className="text-slate-500 text-sm mt-1">Monitor active workshops across all categories</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex gap-4 items-center">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex-1">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search workshops or hosts..."
                        className="bg-transparent outline-none text-sm font-medium w-full text-slate-700 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 min-w-[200px]">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent outline-none text-sm font-bold text-slate-700 w-full cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-12 custom-scrollbar">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400 animate-pulse font-medium">Loading live data...</div>
                ) : filteredWorkshops.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 italic">No active workshops found matching filtering criteria.</div>
                ) : (
                    filteredWorkshops.map(w => (
                        <div key={w.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all p-5 flex flex-col gap-4 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        {w.categoryNames.map(cat => (
                                            <span key={cat} className="text-[10px] uppercase font-bold tracking-wider bg-orange-50 text-orange-600 px-2 py-1 rounded-md border border-orange-100">{cat}</span>
                                        ))}
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{w.title}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-slate-900">NPR {w.price.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                    {w.providerName.charAt(0)}
                                </div>
                                {w.providerName}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Users size={14} />
                                    <span>Max {w.maxCapacity}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar size={14} />
                                    <span>{new Date(w.publishedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 text-xs text-slate-500 truncate">
                                    <MapPin size={14} className="shrink-0" />
                                    <span className="truncate">{w.locationAddress}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
