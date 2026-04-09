import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, ChevronRight } from 'lucide-react';
import type { SimpleUser } from '../../../types/admin';
import { AnimatePresence } from 'framer-motion';
import { UserDetailDrawer } from '../components/drawers/UserDetailDrawer';

export const UsersView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Customer' | 'Provider'>('Customer');
    const [users, setUsers] = useState<SimpleUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SimpleUser | null>(null);

    const fetchUsers = async (role: string) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://localhost:7166/api/admin/users?role=${role}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchUsers(activeTab);
    }, [activeTab]);

    return (
        <div className="relative h-full flex flex-col">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">User Management</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono mt-1 opacity-80">Platform identity directory</p>
                </div>

                <div className="bg-[#0D0D0D] p-1 rounded-xl border border-[#1A1A1A] flex">
                    {(['Customer', 'Provider'] as const).map(role => (
                        <button
                            key={role}
                            onClick={() => setActiveTab(role)}
                            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all font-mono ${activeTab === role
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-[#111]'
                                }`}
                        >
                            {role === 'Customer' ? 'Clients' : 'Nodes'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#0D0D0D] rounded-2xl border border-[#1A1A1A] flex-1 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500 shadow-2xl shadow-black/50">
                <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-[#000] border-b border-[#1A1A1A] text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
                    <div className="col-span-4">Identity Matrix</div>
                    <div className="col-span-4">Contact Logic</div>
                    <div className="col-span-3">Sync Status</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-12 text-center text-slate-600 flex flex-col items-center gap-3 font-mono">
                            <div className="w-5 h-5 border-2 border-[#1A1A1A] border-t-indigo-600 rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase tracking-widest font-bold">Querying Directory...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 italic font-mono text-[10px] uppercase tracking-widest">No matching records found.</div>
                    ) : (
                        <div className="divide-y divide-[#1A1A1A]">
                            {users.map(u => (
                                <div
                                    key={u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`grid grid-cols-12 gap-4 px-8 py-5 items-center cursor-pointer transition-all group border-l-4 ${selectedUser?.id === u.id
                                        ? 'bg-[#1D1B26] border-l-indigo-600'
                                        : 'hover:bg-[#111] border-l-transparent'
                                        }`}
                                >
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${selectedUser?.id === u.id ? 'bg-indigo-600 text-white' : 'bg-[#000] border border-[#222] text-slate-500 group-hover:bg-[#111] group-hover:text-slate-300'}`}>
                                            {u.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors tracking-tight">{u.fullName}</p>
                                            <p className="text-[9px] font-bold text-slate-600 font-mono tracking-widest uppercase mt-0.5">UID: {u.id.substring(0, 8)}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-4">
                                        <div className="font-semibold text-slate-300 text-xs tracking-tight">{u.email}</div>
                                        <div className="text-[10px] text-slate-600 font-mono italic">{u.phoneNumber || 'NO_PH_RECORD'}</div>
                                    </div>

                                    <div className="col-span-3">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {u.emailConfirmed
                                                ? <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[9px] font-bold uppercase tracking-widest font-mono"><Check size={8} /> Verified</span>
                                                : <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[9px] font-bold uppercase tracking-widest font-mono"><AlertCircle size={8} /> Unverified</span>
                                            }
                                        </div>

                                        {activeTab === 'Provider' && (
                                            <div className="flex items-center gap-2">
                                                {u.status === 'Active' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[9px] font-bold uppercase tracking-widest font-mono">Live Node</span>
                                                ) : u.status === 'Pending' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-orange-500/20 bg-orange-500/5 text-orange-400 text-[9px] font-bold uppercase tracking-widest font-mono animate-pulse">Pending Auth</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-700 bg-slate-800/5 text-slate-600 text-[9px] font-bold uppercase tracking-widest font-mono opacity-50">Inert Node</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <ChevronRight size={14} className="text-slate-800 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="py-4 px-8 border-t border-[#1A1A1A] bg-[#000] flex justify-between items-center text-[10px] font-bold font-mono text-slate-600 uppercase tracking-widest">
                    <span>Directory size: {users.length} units</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 rounded border border-[#1A1A1A] opacity-20 cursor-not-allowed">Previous</button>
                        <button disabled className="px-3 py-1 rounded border border-[#1A1A1A] opacity-20 cursor-not-allowed">Next</button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedUser && (
                    <UserDetailDrawer
                        user={selectedUser}
                        role={activeTab}
                        onClose={() => setSelectedUser(null)}
                        onRefresh={() => fetchUsers(activeTab)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
