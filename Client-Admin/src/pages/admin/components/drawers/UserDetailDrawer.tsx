import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, Calendar, Shield, Activity } from 'lucide-react';
import type { SimpleUser } from '../../../../types/admin';

interface UserDetailDrawerProps {
    user: SimpleUser | null;
    onClose: () => void;
    role: 'Customer' | 'Provider' | string;
    onRefresh?: () => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ user, onClose, role, onRefresh }) => {
    const [isApproving, setIsApproving] = React.useState(false);

    const handleApprove = async () => {
        if (!user?.providerId) return;
        setIsApproving(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://localhost:7166/api/admin/approve-provider/${user.providerId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsApproving(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!user?.id) return;
        setIsApproving(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://localhost:7166/api/admin/verify-user/${user.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsApproving(false);
        }
    };

    useEffect(() => {
        if (user) {
        }
    }, [user]);

    if (!user) return null;

    const isPendingHost = role === 'Provider' &&
        (user.status === 'Pending' || user.status === 'PendingReview');

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-20 right-0 h-[calc(100%-80px)] w-[550px] bg-[#0A0A0A] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] border-l border-[#1A1A1A] z-50 flex flex-col font-sans"
        >
            <div className={`p-8 border-b border-[#1A1A1A] flex justify-between items-start bg-[#000]`}>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-2 shadow-2xl ${role === 'Provider' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20' : 'bg-[#111] text-slate-500 border-[#222]'}`}>
                        {user.fullName.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">{user.fullName}</h2>
                            {user.emailConfirmed && <Shield size={16} className="text-emerald-500 fill-emerald-500/20" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">{role}</p>
                            {isPendingHost && <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold border border-orange-500/20 rounded uppercase tracking-wider animate-pulse font-mono">PENDING_REVIEW</span>}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] border border-[#222] text-slate-500 hover:text-white transition-all shadow-xl">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 pb-0">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl flex items-center gap-5 group hover:border-indigo-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono mb-0.5">Contact Logic</p>
                                <p className="text-sm font-bold text-slate-200 font-mono tracking-tight">{user.email}</p>
                            </div>
                        </div>
                        <div className="p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl flex items-center gap-5 group hover:border-indigo-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono mb-0.5">Cellular</p>
                                <p className="text-sm font-bold text-slate-200 font-mono tracking-tighter">{user.phoneNumber || 'NULL_PH'}</p>
                            </div>
                        </div>
                        <div className="p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl flex items-center gap-5 group hover:border-indigo-500/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono mb-0.5">Node Creation</p>
                                <p className="text-sm font-bold text-slate-200 font-mono tracking-tighter">JAN_12_2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-[10px] font-bold text-slate-500 mb-5 flex items-center gap-2 uppercase tracking-[0.2em] font-mono">
                        <Activity size={14} className="text-indigo-500" />
                        Platform Activity
                    </h3>

                    {role === 'Customer' && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10">
                                <p className="text-emerald-500 text-[10px] font-bold uppercase mb-2 tracking-widest font-mono">Bookings</p>
                                <p className="text-3xl font-bold text-white font-mono tracking-tighter">--</p>
                            </div>
                            <div className="bg-indigo-500/5 rounded-2xl p-6 border border-indigo-500/10">
                                <p className="text-indigo-500 text-[10px] font-bold uppercase mb-2 tracking-widest font-mono">Satisfaction</p>
                                <p className="text-3xl font-bold text-white font-mono tracking-tighter">100%</p>
                            </div>
                        </div>
                    )}

                    {role === 'Provider' && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-indigo-500/5 rounded-2xl p-6 border border-indigo-500/10 font-mono">
                                <p className="text-indigo-500 text-[10px] font-bold uppercase mb-2 tracking-widest">Inventory</p>
                                <p className="text-3xl font-bold text-white tracking-tighter">--</p>
                            </div>
                            <div className="bg-purple-500/5 rounded-2xl p-6 border border-purple-500/10 font-mono">
                                <p className="text-purple-500 text-[10px] font-bold uppercase mb-2 tracking-widest">Sync State</p>
                                <p className="text-lg font-bold text-white uppercase tracking-tight">{user.status}</p>
                            </div>
                        </div>
                    )}

                    <div className="border border-[#1A1A1A] rounded-2xl bg-[#000] p-10 text-center border-dashed">
                        <p className="text-slate-600 text-[11px] font-medium leading-relaxed uppercase tracking-widest font-mono opacity-60">Historical activity logs pending marketplace activation.</p>
                    </div>
                </div>
            </div>

            <div className="p-8 border-t border-[#1A1A1A] bg-[#000] grid grid-cols-2 gap-4 shadow-2xl">
                {isPendingHost ? (
                    <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="col-span-2 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] font-mono disabled:opacity-20"
                    >
                        {isApproving ? 'SYNCHRONIZING...' : 'APPROVE_PROVIDER_NODE'}
                    </button>
                ) : (
                    <div className="col-span-2 space-y-5">
                        {!user.emailConfirmed && (
                            <button
                                onClick={handleVerifyEmail}
                                disabled={isApproving}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] font-mono disabled:opacity-20 mb-2"
                            >
                                <Shield size={16} /> {isApproving ? 'VERIFYING...' : 'FORCE_EMAIL_SYNC'}
                            </button>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="w-full py-4 bg-[#111] hover:bg-[#1a1a1a] text-slate-400 font-bold rounded-xl border border-[#222] transition-all uppercase tracking-widest text-[9px] font-mono">Reset Key</button>
                            <button className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/20 transition-all uppercase tracking-widest text-[9px] font-mono">Eject Node</button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
