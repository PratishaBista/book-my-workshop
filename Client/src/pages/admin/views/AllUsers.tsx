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
                    <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage platform {activeTab === 'Customer' ? 'customers' : 'hosts'}</p>
                </div>

                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                    {(['Customer', 'Provider'] as const).map(role => (
                        <button
                            key={role}
                            onClick={() => setActiveTab(role)}
                            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === role
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {role === 'Customer' ? 'Customers' : 'Hosts'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-4">User Details</div>
                    <div className="col-span-4">Contact</div>
                    <div className="col-span-3">Account Status</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#E57A44] rounded-full animate-spin"></div>
                            Loading users...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">No {activeTab.toLowerCase()}s found.</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {users.map(u => (
                                <div
                                    key={u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`grid grid-cols-12 gap-4 px-8 py-5 items-center cursor-pointer transition-all group ${selectedUser?.id === u.id
                                        ? 'bg-orange-50/50 border-l-4 border-l-[#E57A44]'
                                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${selectedUser?.id === u.id ? 'bg-[#E57A44] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow'}`}>
                                            {u.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 group-hover:text-[#E57A44] transition-colors">{u.fullName}</p>
                                            <p className="text-xs text-slate-400">ID: ...{u.id.substring(0, 8)}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-4 text-sm text-slate-500">
                                        <div className="font-medium text-slate-700">{u.email}</div>
                                        <div className="text-xs text-slate-400">{u.phoneNumber || 'No phone'}</div>
                                    </div>

                                    <div className="col-span-3 flex flex-col gap-2">
                                        {/* Email Verification */}
                                        <div className="flex items-center gap-2">
                                            {u.emailConfirmed
                                                ? <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 uppercase tracking-tight"><Check size={10} /> Email Verified</span>
                                                : <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 uppercase tracking-tight"><AlertCircle size={10} /> Email Unverified</span>
                                            }
                                        </div>

                                        {activeTab === 'Provider' && (
                                            <div className="flex items-center gap-2">
                                                {u.status === 'Active' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 shadow-sm">Verified Partner</span>
                                                ) : u.status === 'Pending' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100 animate-pulse">Pending Review</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-bold border border-slate-100 italic">Account Setup</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-[#E57A44] group-hover:translate-x-1 transition-all ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="py-4 px-8 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-400">
                    <span>Showing {users.length} results</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 rounded border border-slate-200 opacity-50 cursor-not-allowed">Previous</button>
                        <button disabled className="px-3 py-1 rounded border border-slate-200 opacity-50 cursor-not-allowed">Next</button>
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
