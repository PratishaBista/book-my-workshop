import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import type { PendingProvider } from '../../../types/admin';

export const ActiveHosts: React.FC = () => {
    const [hosts, setHosts] = useState<PendingProvider[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHosts = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('https://localhost:7166/api/admin/providers/active', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setHosts(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchHosts();
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Active Hosts</h2>
                <p className="text-slate-500 text-sm mt-1">Manage verified providers</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-4">Business Name</div>
                    <div className="col-span-4">Email</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="divide-y divide-slate-50">
                    {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : hosts.length === 0 ? <div className="p-12 text-center text-slate-400">No active hosts found.</div> : (
                        hosts.map(p => (
                            <div key={p.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 border-l-4 border-l-transparent transition-colors">
                                <div className="col-span-4 font-bold text-slate-700">{p.businessName}</div>
                                <div className="col-span-4 text-sm text-slate-500">{p.email}</div>
                                <div className="col-span-3"><span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">Active</span></div>
                                <div className="col-span-1 text-right"><ChevronRight size={16} className="text-slate-300 ml-auto" /></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
