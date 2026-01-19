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

    useEffect(() => {
        if (user) {
            // Future: Fetch specific booking/workshop stats here
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
            className="fixed top-20 right-0 h-[calc(100%-80px)] w-[600px] bg-white shadow-2xl border-l border-slate-100 z-50 flex flex-col font-sans"
        >
            <div className={`p-8 border-b border-slate-100 flex justify-between items-start ${role === 'Provider' ? 'bg-orange-50/30' : 'bg-slate-50/50'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 border-white shadow-sm ${role === 'Provider' ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                        {user.fullName.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-slate-800 leading-tight">{user.fullName}</h2>
                            {user.emailConfirmed && <Shield size={16} className="text-emerald-500 fill-emerald-500" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-slate-500 font-medium">{role}</p>
                            {isPendingHost && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded uppercase tracking-wider animate-pulse">Pending Review</span>}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 pb-0">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                                <p className="text-sm font-bold text-slate-700">{user.email}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                                <p className="text-sm font-bold text-slate-700">{user.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">DoB/Joined</p>
                                <p className="text-sm font-bold text-slate-700">Jan 12, 2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity size={16} className="text-[#E57A44]" />
                        Platform Activity
                    </h3>

                    {role === 'Customer' && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                                <p className="text-emerald-600 text-xs font-bold uppercase mb-1">Bookings Made</p>
                                <p className="text-2xl font-bold text-slate-800">--</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <p className="text-blue-600 text-xs font-bold uppercase mb-1">Satisfaction</p>
                                <p className="text-2xl font-bold text-slate-800">100%</p>
                            </div>
                        </div>
                    )}

                    {role === 'Provider' && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                                <p className="text-orange-600 text-xs font-bold uppercase mb-1">Total Workshops</p>
                                <p className="text-2xl font-bold text-slate-800">--</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                                <p className="text-purple-600 text-xs font-bold uppercase mb-1">Status</p>
                                <p className="text-lg font-bold text-slate-800">{user.status}</p>
                            </div>
                        </div>
                    )}

                    <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50 p-8 text-center">
                        <p className="text-slate-400 text-sm">Historical activity logs will appear here once the studio begins hosting sessions.</p>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                {isPendingHost ? (
                    <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="col-span-2 w-full py-4 bg-[#E57A44] hover:bg-[#d06735] text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isApproving ? 'Approving...' : 'Approve Host Account'}
                    </button>
                ) : (
                    <>
                        <button className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl border border-slate-200 transition-all">Reset Password</button>
                        <button className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-all">Suspend User</button>
                    </>
                )}
            </div>
        </motion.div>
    );
};
