import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ArrowUpRight, RefreshCcw, Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';

interface EarningTransaction {
    bookingId: number;
    workshopTitle: string;
    bookingDate: string;
    guestName: string;
    numberOfSeats: number;
    totalAmount: number;
    platformFee: number;
    hostEarnings: number;
    payoutStatus: string;
    bookingStatus: string;
}

interface HostEarningsData {
    walletBalance: number;
    totalEarnings: number;
    pendingPayouts: number;
    paidOut: number;
    totalBookings: number;
    recentTransactions: EarningTransaction[];
}

export const Earnings: React.FC = () => {
    const [data, setData] = useState<HostEarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.provider.earnings, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                setError('Failed to load earnings data.');
            }
        } catch (err) {
            setError('An error occurred while fetching earnings.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-orange" size={40} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-white rounded-[3rem] border border-red-100 shadow-sm">
                <AlertCircle size={48} className="text-red-400 mb-6" />
                <h2 className="text-2xl font-serif font-bold text-deep-purple mb-4">Error Loading Earnings</h2>
                <p className="text-gray-500 mb-8">{error}</p>
                <button
                    onClick={fetchEarnings}
                    className="flex items-center gap-2 px-8 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
                >
                    <RefreshCcw size={20} /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-deep-purple">Earnings & Payouts</h1>
                    <p className="text-gray-500 mt-2">Track your workshop income and scheduled payouts.</p>
                </div>
                <button
                    onClick={fetchEarnings}
                    className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-semibold text-sm"
                >
                    <RefreshCcw size={16} /> Refresh
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 hover:cursor-default">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-deep-purple text-white p-8 rounded-[2rem] shadow-xl shadow-deep-purple/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors" />
                    <div className="flex items-center gap-3 text-white/70 mb-4 text-sm font-bold uppercase tracking-wider">
                        <DollarSign size={18} /> Available to Withdraw
                    </div>
                    <div className="text-4xl font-serif font-bold">
                        Rs {data.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm relative overflow-hidden"
                >
                    <div className="flex items-center gap-3 text-gray-400 mb-4 text-sm font-bold uppercase tracking-wider">
                        <ArrowUpRight size={18} /> Total Earned
                    </div>
                    <div className="text-4xl font-serif font-bold text-deep-purple">
                        Rs {data.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm relative overflow-hidden"
                >
                    <div className="flex items-center gap-3 text-gray-400 mb-4 text-sm font-bold uppercase tracking-wider">
                        <Clock size={18} /> Expected Payouts
                    </div>
                    <div className="text-4xl font-serif font-bold text-amber-500">
                        Rs {data.pendingPayouts.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm relative overflow-hidden"
                >
                    <div className="flex items-center gap-3 text-gray-400 mb-4 text-sm font-bold uppercase tracking-wider">
                        <CheckCircle2 size={18} /> Already Paid Out
                    </div>
                    <div className="text-4xl font-serif font-bold text-green-500">
                        Rs {data.paidOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </motion.div>
            </div>

            {/* Transactions List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden"
            >
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold text-deep-purple">Recent Transactions</h2>
                    <div className="px-4 py-1.5 bg-primary-orange/10 text-primary-orange rounded-full text-sm font-bold">
                        {data.totalBookings} Total Bookings
                    </div>
                </div>

                {data.recentTransactions.length === 0 ? (
                    <div className="p-16 text-center text-gray-400">
                        <p className="text-lg">No earning transactions yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-400">
                                    <th className="px-8 py-4 font-bold">Date & Workshop</th>
                                    <th className="px-8 py-4 font-bold">Guest</th>
                                    <th className="px-8 py-4 font-bold">Total Paid</th>
                                    <th className="px-8 py-4 font-bold">Platform Fee</th>
                                    <th className="px-8 py-4 font-bold text-right">Your Earnings</th>
                                    <th className="px-8 py-4 font-bold text-center">Payout Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.recentTransactions.map((tx) => (
                                    <tr key={tx.bookingId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-gray-400 mb-1">{formatDate(tx.bookingDate)}</div>
                                            <div className="font-serif font-bold text-deep-purple text-lg line-clamp-1">{tx.workshopTitle}</div>
                                            {tx.bookingStatus === 'Refunded' && (
                                                <div className="text-xs text-red-500 font-bold mt-1 uppercase tracking-wide">Refunded to guest</div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-semibold text-deep-purple">{tx.guestName}</div>
                                            <div className="text-xs text-gray-400 font-medium">{tx.numberOfSeats} Seat{tx.numberOfSeats > 1 ? 's' : ''}</div>
                                        </td>
                                        <td className="px-8 py-6 text-gray-600 font-medium">
                                            Rs {tx.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-gray-400 font-medium">
                                            - Rs {tx.platformFee.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-xl font-serif font-bold text-deep-purple">
                                                Rs {tx.hostEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {tx.payoutStatus === 'Paid' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                                                    Settled
                                                </span>
                                            ) : tx.payoutStatus === 'Pending' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-100">
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    {tx.payoutStatus}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
