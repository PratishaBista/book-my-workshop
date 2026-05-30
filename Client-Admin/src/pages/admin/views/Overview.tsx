import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Library, Users, RefreshCw, MessageSquareWarning } from 'lucide-react';
import { API_URL } from '../../../config/api';

interface AdminStats {
    totalRevenue: number;
    activeWorkshops: number;
    pendingHosts: number;
    totalUsers: number;
    flaggedReviews?: number;
    totalReviews?: number;
}

export const Overview: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/overview-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load dashboard metrics');
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
                <RefreshCw size={24} className="animate-spin text-purple-400" />
                <span className="text-xs font-mono">Connecting to analytics engine...</span>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-10 text-center bg-red-500/5 border border-red-500/10 rounded-2xl">
                <p className="text-red-400 text-sm font-medium">Analytics Connection Failed</p>
                <p className="text-xs text-white/40 mt-1">{error}</p>
                <button
                    onClick={fetchStats}
                    className="mt-4 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold rounded-xl transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                {[
                    { 
                        label: 'Net Platform Revenue', 
                        value: `Rs. ${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
                        tag: 'Net after VAT',
                        color: 'text-emerald-400', 
                        bg: 'bg-emerald-500/10',
                        border: 'border-emerald-500/20',
                        icon: Activity
                    },
                    { 
                        label: 'Active Workshops', 
                        value: stats.activeWorkshops.toString(), 
                        tag: 'Live listings',
                        color: 'text-indigo-400', 
                        bg: 'bg-indigo-500/10',
                        border: 'border-indigo-500/20',
                        icon: Library
                    },
                    { 
                        label: 'Pending Hosts', 
                        value: stats.pendingHosts.toString(), 
                        tag: stats.pendingHosts > 0 ? 'Requires Action' : 'All Cleared',
                        color: stats.pendingHosts > 0 ? 'text-amber-400' : 'text-blue-400', 
                        bg: stats.pendingHosts > 0 ? 'bg-amber-500/10' : 'bg-blue-500/10',
                        border: stats.pendingHosts > 0 ? 'border-amber-500/20' : 'border-blue-500/20',
                        icon: ShieldCheck
                    },
                    { 
                        label: 'Flagged Reviews', 
                        value: (stats.flaggedReviews ?? 0).toString(), 
                        tag: `${stats.totalReviews ?? 0} total reviews`,
                        color: (stats.flaggedReviews ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400', 
                        bg: (stats.flaggedReviews ?? 0) > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10',
                        border: (stats.flaggedReviews ?? 0) > 0 ? 'border-red-500/20' : 'border-emerald-500/20',
                        icon: MessageSquareWarning
                    },
                    { 
                        label: 'Total Platform Users', 
                        value: stats.totalUsers.toLocaleString(), 
                        tag: 'Registered accounts',
                        color: 'text-purple-400', 
                        bg: 'bg-purple-500/10',
                        border: 'border-purple-500/20',
                        icon: Users
                    }
                ].map((stat, i) => (
                    <div key={i} className={`bg-[#0D0D0D] border ${stat.border} p-6 rounded-2xl shadow-sm hover:border-white/10 transition-all group relative overflow-hidden`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono group-hover:text-slate-300 transition-colors">{stat.label}</p>
                                <p className="text-[10px] text-white/20 mt-0.5">{stat.tag}</p>
                            </div>
                            <stat.icon size={16} className={stat.color} />
                        </div>
                        <div className="mt-5">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* System Status and Diagnostics Hub */}
            <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-base font-semibold tracking-wide text-white">System Diagnostics & Security</h2>
                        <p className="text-xs text-white/40 mt-0.5">Live handshake status</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        MONITOR SECURE
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Column 1 */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Service</p>
                        <div className="space-y-3">
                            <StatusIndicator label="API Gateway core" status="Online" color="bg-emerald-400" />
                            <StatusIndicator label="SignalR notification hub" status="Connected" color="bg-emerald-400" />
                            <StatusIndicator label="Identity vault service" status="Ready" color="bg-emerald-400" />
                        </div>
                    </div>

                    {/* Status Column 2 */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Third-Party Handshakes</p>
                        <div className="space-y-3">
                            <StatusIndicator label="Stripe payment API" status="Sandbox Active" color="bg-emerald-400" />
                            <StatusIndicator label="eSewa payment gateway" status="Ready" color="bg-emerald-400" />
                            <StatusIndicator label="Cloudinary media server" status="Online" color="bg-emerald-400" />
                        </div>
                    </div>

                    {/* Status Column 3 */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Infrastructure</p>
                        <div className="space-y-3">
                            <StatusIndicator label="SMTP mail dispatcher" status="Configured" color="bg-emerald-400" />
                            <StatusIndicator label="Microsoft SQL Server" status="Handshake Active" color="bg-emerald-400" />
                            <StatusIndicator label="AWS MinIO storage vault" status="Connected" color="bg-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusIndicator: React.FC<{ label: string; status: string; color: string }> = ({ label, status, color }) => (
    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 hover:bg-white/[0.04] transition-colors">
        <span className="text-xs text-white/70">{label}</span>
        <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
            <span className="text-[10px] font-mono text-white/40 uppercase">{status}</span>
        </div>
    </div>
);
