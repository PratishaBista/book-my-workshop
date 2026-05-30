import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Shield, Activity, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import type { SimpleUser } from '../../../../types/admin';
import { API_ENDPOINTS } from '../../../../config/api';

interface UserDetailDrawerProps {
    user: SimpleUser | null;
    onClose: () => void;
    role: 'Customer' | 'Provider' | string;
    onRefresh?: () => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ user, onClose, role, onRefresh }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');

    const token = localStorage.getItem('token');

    const callApi = async (url: string, method: string, body?: object) => {
        setIsLoading(true);
        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...(body ? { 'Content-Type': 'application/json' } : {})
                },
                ...(body ? { body: JSON.stringify(body) } : {})
            });
            if (res.ok) {
                if (onRefresh) onRefresh();
                onClose();
            } else {
                const err = await res.text();
                alert(`Error: ${err}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = () => {
        if (!user?.id) return;
        callApi(`${API_ENDPOINTS.admin.workshops.replace('/workshops', '')}/verify-user/${user.id}`, 'PUT');
    };

    const handleApproveProvider = () => {
        if (!user?.providerId) return;
        callApi(API_ENDPOINTS.admin.approveProvider(user.providerId), 'PUT');
    };

    const handleSuspend = async () => {
        if (!suspendReason.trim()) return;
        if (role === 'Provider' && user?.providerId) {
            await callApi(API_ENDPOINTS.admin.suspendProvider(user.providerId), 'PUT', { reason: suspendReason });
        } else if (role === 'Customer' && user?.id) {
            await callApi(API_ENDPOINTS.admin.suspendUser(user.id), 'PUT', { reason: suspendReason });
        }
        setShowSuspendModal(false);
        setSuspendReason('');
    };

    const handleUnsuspend = () => {
        if (role === 'Provider' && user?.providerId) {
            callApi(API_ENDPOINTS.admin.unsuspendProvider(user.providerId), 'PUT');
        } else if (role === 'Customer' && user?.id) {
            callApi(API_ENDPOINTS.admin.unsuspendUser(user.id), 'PUT');
        }
    };

    if (!user) return null;

    const isSuspended = user.isSuspended || user.status === 'Suspended';
    const isPendingHost = role === 'Provider' && (user.status === 'Pending' || user.status === 'PendingReview');

    const statusBadge = isSuspended ? (
        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold border border-red-500/20 rounded uppercase tracking-wider font-mono flex items-center gap-1">
            <Ban size={8} /> SUSPENDED
        </span>
    ) : isPendingHost ? (
        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold border border-orange-500/20 rounded uppercase tracking-wider animate-pulse font-mono">
            PENDING_REVIEW
        </span>
    ) : (
        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 rounded uppercase tracking-wider font-mono flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse inline-block" /> ACTIVE
        </span>
    );

    return (
        <>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed top-20 right-0 h-[calc(100%-80px)] w-[550px] bg-[#0A0A0A] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] border-l border-[#1A1A1A] z-50 flex flex-col font-sans"
            >
                {/* Header */}
                <div className={`p-8 border-b border-[#1A1A1A] flex justify-between items-start ${isSuspended ? 'bg-red-950/20' : 'bg-[#000]'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-2 shadow-2xl ${
                            isSuspended ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            role === 'Provider' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20' :
                            'bg-[#111] text-slate-500 border-[#222]'
                        }`}>
                            {user.fullName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">{user.fullName}</h2>
                                {user.emailConfirmed && !isSuspended && <Shield size={16} className="text-emerald-500 fill-emerald-500/20" />}
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono">{role}</p>
                                {statusBadge}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] border border-[#222] text-slate-500 hover:text-white transition-all shadow-xl">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 pb-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl flex items-center gap-5 group hover:border-indigo-500/30 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono mb-0.5">Email</p>
                                    <p className="text-sm font-bold text-slate-200 font-mono tracking-tight">{user.email}</p>
                                </div>
                            </div>
                            <div className="p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl flex items-center gap-5 group hover:border-indigo-500/30 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono mb-0.5">Phone</p>
                                    <p className="text-sm font-bold text-slate-200 font-mono tracking-tighter">{user.phoneNumber || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="p-5 bg-[#000] border border-[#1A1A1A] rounded-2xl flex items-center gap-5">
                                <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-slate-500">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono mb-0.5">Email Verified</p>
                                    <p className={`text-sm font-bold font-mono tracking-tighter ${user.emailConfirmed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {user.emailConfirmed ? 'Verified' : 'Unverified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="text-[10px] font-bold text-slate-500 mb-5 flex items-center gap-2 uppercase tracking-[0.2em] font-mono">
                            <Activity size={14} className="text-indigo-500" />
                            Account Status
                        </h3>

                        {isSuspended && (
                            <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3">
                                <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest font-mono mb-1">Account Suspended</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">This account has been suspended by an admin. The user cannot log in or access the platform.</p>
                                </div>
                            </div>
                        )}

                        {role === 'Provider' && (
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className={`rounded-2xl p-6 border font-mono ${
                                    isSuspended ? 'bg-red-500/5 border-red-500/10' : 'bg-indigo-500/5 border-indigo-500/10'
                                }`}>
                                    <p className={`text-[10px] font-bold uppercase mb-2 tracking-widest ${isSuspended ? 'text-red-400' : 'text-indigo-400'}`}>Provider Status</p>
                                    <p className="text-lg font-bold text-white uppercase tracking-tight">{user.status}</p>
                                </div>
                                <div className="bg-purple-500/5 rounded-2xl p-6 border border-purple-500/10 font-mono">
                                    <p className="text-purple-500 text-[10px] font-bold uppercase mb-2 tracking-widest">Provider ID</p>
                                    <p className="text-lg font-bold text-white tracking-tight">#{user.providerId?.toString().padStart(4, '0') || 'N/A'}</p>
                                </div>
                            </div>
                        )}

                        {role === 'Customer' && (
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className={`rounded-2xl p-6 border font-mono ${
                                    isSuspended ? 'bg-red-500/5 border-red-500/10' : 'bg-emerald-500/5 border-emerald-500/10'
                                }`}>
                                    <p className={`text-[10px] font-bold uppercase mb-2 tracking-widest ${isSuspended ? 'text-red-400' : 'text-emerald-500'}`}>Account Status</p>
                                    <p className="text-lg font-bold text-white uppercase tracking-tight">{user.status}</p>
                                </div>
                                <div className="bg-indigo-500/5 rounded-2xl p-6 border border-indigo-500/10 font-mono">
                                    <p className="text-indigo-500 text-[10px] font-bold uppercase mb-2 tracking-widest">UID</p>
                                    <p className="text-sm font-bold text-white tracking-tight">{user.id.substring(0, 12)}...</p>
                                </div>
                            </div>
                        )}

                        <div className="border border-[#1A1A1A] rounded-2xl bg-[#000] p-8 text-center border-dashed">
                            <p className="text-slate-600 text-[11px] font-medium leading-relaxed uppercase tracking-widest font-mono opacity-60">
                                Historical activity logs pending marketplace activation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-[#1A1A1A] bg-[#000] space-y-3 shadow-2xl">
                    {isPendingHost && (
                        <button
                            onClick={handleApproveProvider}
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] font-mono disabled:opacity-30"
                        >
                            <CheckCircle size={14} />
                            {isLoading ? 'Processing...' : 'Approve Provider'}
                        </button>
                    )}

                    {!user.emailConfirmed && !isPendingHost && (
                        <button
                            onClick={handleVerifyEmail}
                            disabled={isLoading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] font-mono disabled:opacity-30"
                        >
                            <Shield size={14} />
                            {isLoading ? 'Verifying...' : 'Force Verify Email'}
                        </button>
                    )}

                    {isSuspended ? (
                        <button
                            onClick={handleUnsuspend}
                            disabled={isLoading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] font-mono disabled:opacity-30"
                        >
                            <CheckCircle size={14} />
                            {isLoading ? 'Reinstating...' : 'Lift Suspension'}
                        </button>
                    ) : (
                        !isPendingHost && (
                            <button
                                onClick={() => setShowSuspendModal(true)}
                                disabled={isLoading}
                                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] font-mono disabled:opacity-30"
                            >
                                <Ban size={14} />
                                Suspend Account
                            </button>
                        )
                    )}
                </div>
            </motion.div>

            {/* Suspend Reason Modal */}
            <AnimatePresence>
                {showSuspendModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0D0D0D] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-500/20 space-y-5"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <Ban size={18} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">Suspend Account</h3>
                                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                        {user.fullName}
                                    </p>
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm leading-relaxed">
                                This will immediately block the user from logging in. They will receive an email with the reason. You can lift the suspension at any time.
                            </p>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block mb-2">
                                    Reason for Suspension <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={suspendReason}
                                    onChange={(e) => setSuspendReason(e.target.value)}
                                    placeholder="e.g. Repeated policy violations, fraudulent activity, spam..."
                                    className="w-full p-4 rounded-xl border border-[#222] bg-[#000] text-slate-300 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none resize-none"
                                    rows={4}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => { setShowSuspendModal(false); setSuspendReason(''); }}
                                    className="py-3 rounded-xl border border-[#1A1A1A] text-slate-400 font-bold hover:bg-[#111] text-[10px] uppercase tracking-widest font-mono"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSuspend}
                                    disabled={!suspendReason.trim() || isLoading}
                                    className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase tracking-widest font-mono disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? 'Suspending...' : 'Confirm Suspend'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
