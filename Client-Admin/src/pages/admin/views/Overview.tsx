import React from 'react';

export const Overview: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: '$12,450', trend: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Active Workshops', value: '45', trend: '+5', color: 'text-[#E57A44]', bg: 'bg-orange-50' },
                    { label: 'New Hosts', value: '12', trend: '+2', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Users', value: '1,208', trend: '+8%', color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100/60 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-orange-500/5 transition-all">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                            <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${stat.bg} ${stat.color}`}>{stat.trend}</div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 h-96 flex flex-col items-center justify-center text-slate-300">
                <p className="font-medium text-lg">Analytics Overview Placeholder</p>
                <p className="text-sm">Charts & Graphs will be implemented here</p>
            </div>
        </div>
    );
};
