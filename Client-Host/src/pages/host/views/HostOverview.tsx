import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

import { ProviderStatus } from '../../../types/host';
import type { ProviderStatusType } from '../../../types/host';
import { API_ENDPOINTS } from '../../../config/api';

interface HostOverviewProps {
    status: ProviderStatusType;
    onStartOnboarding?: () => void;
    onStartVerification?: () => void;
}

interface HostStats {
    totalBookings: number;
    activeWorkshops: number;
    totalRevenue: number;
    avgRating: number;
}

export const HostOverview: React.FC<HostOverviewProps> = ({ status, onStartVerification }) => {
    const [stats, setStats] = useState<HostStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === ProviderStatus.Approved) {
            fetchStats();
        }
    }, [status]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.provider.stats, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load snapshot metrics');
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getTodayDate = () => {
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-gray-500 mt-1">Here's what's happening today in your workshops.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-600">{getTodayDate()}</span>
                    </div>
                </div>
            </div>

            {/* Status Banners */}
            {status === ProviderStatus.Incomplete && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary-orange/5 border border-primary-orange/20 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-primary-orange/10 p-3 rounded-2xl text-primary-orange">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-deep-purple text-lg mb-1">Identity Verification Required</h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                                To start listing workshops, we need to verify your identity. Please upload your Government ID and PAN Certificate in the Security Center.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onStartVerification}
                        className="px-6 py-3 bg-deep-purple text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                    >
                        Verify Identity
                    </button>
                </motion.div>
            )}

            {status === ProviderStatus.PendingReview && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4"
                >
                    <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-deep-purple text-lg mb-1">Verification in progress</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                            Our partner success team is currently reviewing your profile. This usually takes 1-2 business days.
                            We will send a professional confirmation to your email once your studio is verified.
                        </p>
                    </div>
                </motion.div>
            )}

            {status === ProviderStatus.Approved && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <RefreshCw className="animate-spin text-primary-orange" size={24} />
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                            <p className="text-red-600 font-bold text-sm">Failed to connect to business stats.</p>
                            <button
                                onClick={fetchStats}
                                className="mt-2 text-xs font-bold text-deep-purple hover:underline"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : stats ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="md:col-span-4 bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex items-center gap-4 mb-2">
                                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-deep-purple text-lg">Studio Verified</h3>
                                    <p className="text-gray-500 text-sm">Your business profile is active. You can now publish workshops and start accepting bookings.</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bookings</p>
                                <h4 className="text-3xl font-bold text-deep-purple">{stats.totalBookings}</h4>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Workshops</p>
                                <h4 className="text-3xl font-bold text-deep-purple">{stats.activeWorkshops}</h4>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                                <h4 className="text-3xl font-bold text-deep-purple">
                                    Rs. {stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </h4>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Rating</p>
                                <h4 className="text-3xl font-bold text-deep-purple">{stats.avgRating.toFixed(1)}</h4>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};
