import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

import { ProviderStatus } from '../../../types/host';
import type { ProviderStatusType } from '../../../types/host';

interface HostOverviewProps {
    status: ProviderStatusType;
    onStartOnboarding?: () => void;
}

export const HostOverview: React.FC<HostOverviewProps> = ({ status, onStartOnboarding }) => {

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-deep-purple">Business Snapshot</h2>
                    <p className="text-gray-500 mt-1">Here's what's happening today in your workshops.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-600">Jan 04, 2026</span>
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
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-deep-purple text-lg mb-1">Welcome to your studio, Artisan!</h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                                Your account is almost ready. Complete your business profile so our team can review and verify your studio for the marketplace.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onStartOnboarding}
                        className="px-6 py-3 bg-deep-purple text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                    >
                        Complete Profile
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="md:col-span-4 bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex items-center gap-4 mb-2">
                        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-deep-purple text-lg">Studio Verified</h3>
                            <p className="text-gray-500 text-sm">Your business profile is active. You can now publish workshops and start accepting bookings.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bookings</p>
                        <h4 className="text-3xl font-bold text-deep-purple">0</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Workshops</p>
                        <h4 className="text-3xl font-bold text-deep-purple">0</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h4 className="text-3xl font-bold text-deep-purple">Rs. 0</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Rating</p>
                        <h4 className="text-3xl font-bold text-deep-purple">5.0</h4>
                    </div>
                </div>
            )}

        </div>
    );
};
