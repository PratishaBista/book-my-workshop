import React from 'react';
import { Activity } from 'lucide-react';

export const Overview: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: '$12,450', trend: '+12%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Active Workshops', value: '45', trend: '+5', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'New Hosts', value: '12', trend: '+2', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Total Users', value: '1,208', trend: '+8%', color: 'text-purple-400', bg: 'bg-purple-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded-2xl shadow-sm hover:border-[#333] transition-all group">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono group-hover:text-slate-300 transition-colors">{stat.label}</p>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${stat.bg} ${stat.color}`}>{stat.trend}</div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-8 h-96 flex flex-col items-center justify-center text-slate-600 font-mono">
                <div className="w-16 h-16 bg-[#111] border border-[#222] rounded-full mb-4 flex items-center justify-center opacity-40">
                    <Activity size={24} />
                </div>
                <p className="font-bold text-sm uppercase tracking-widest mb-1">Analytics Engine Offline</p>
                <p className="text-[10px] opacity-60">Charts & Graphs will be implemented in v5.0</p>
            </div>
        </div>
    );
};
