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
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">Active Partners</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono mt-1 opacity-80">Verified Platform Nodes</p>
            </div>

            <div className="bg-[#0D0D0D] rounded-2xl border border-[#1A1A1A] overflow-hidden animate-in slide-in-from-bottom-4 duration-500 shadow-2xl shadow-black/50">
                <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-[#000] border-b border-[#1A1A1A] text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
                    <div className="col-span-4">Business Identity</div>
                    <div className="col-span-4">Network Logic</div>
                    <div className="col-span-3">Sync Status</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="divide-y divide-[#1A1A1A]">
                    {loading ? (
                        <div className="p-20 text-center text-slate-600 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">Syncing directory...</div>
                    ) : hosts.length === 0 ? (
                        <div className="p-20 text-center text-slate-500 italic font-mono text-xs uppercase tracking-widest">No active nodes detected.</div>
                    ) : (
                        hosts.map(p => (
                            <div key={p.id} className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-[#111] border-l-4 border-l-transparent hover:border-l-indigo-600 transition-all cursor-pointer group">
                                <div className="col-span-4">
                                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">{p.businessName}</p>
                                    <p className="text-[9px] font-bold text-slate-600 font-mono tracking-widest uppercase mt-0.5">ID: {p.id.toString().padStart(6, '0')}</p>
                                </div>
                                <div className="col-span-4 text-[11px] text-slate-400 font-mono group-hover:text-slate-300 transition-colors">{p.email}</div>
                                <div className="col-span-3">
                                    <span className="px-3 py-1.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[9px] font-bold uppercase tracking-widest font-mono">
                                        <span className="inline-block w-1 h-1 rounded-full bg-emerald-500 animate-pulse mr-2" />
                                        Live_Node
                                    </span>
                                </div>
                                <div className="col-span-1 text-right">
                                    <ChevronRight size={14} className="text-slate-800 ml-auto group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
