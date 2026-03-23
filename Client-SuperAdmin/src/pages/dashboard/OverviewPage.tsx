import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Library, ShieldCheck } from 'lucide-react';

interface DashboardStats {
    commissionRate: number;
    totalPlatformRevenue: number;
    pendingHostPayouts: number;
    totalBookingVolume: number;
    totalUsers: number;
    totalProviders: number;
    totalWorkshops: number;
    monthlyRevenueData: { month: string, revenue: number }[];
}

const OverviewPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('superadmin_token');
                const res = await fetch(`${API_BASE_URL}/financials/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to load data');
                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const fmt = (n: number) =>
        new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(n);

    if (loading) return <p className="text-white/30 text-sm">Loading...</p>;
    if (error) return <p className="text-red-400 text-sm">{error}</p>;

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
                <p className="text-white/40 text-sm mt-1">Platform financial summary & activity</p>
            </div>

            {/* Top Cards - Counts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-white/40 mb-3">
                        <Users size={16} />
                        <span className="text-xs uppercase tracking-wider font-semibold">Total Users</span>
                    </div>
                    <p className="text-3xl font-bold">{stats?.totalUsers.toLocaleString()}</p>
                </div>

                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-white/40 mb-3">
                        <ShieldCheck size={16} />
                        <span className="text-xs uppercase tracking-wider font-semibold">Total Providers</span>
                    </div>
                    <p className="text-3xl font-bold">{stats?.totalProviders.toLocaleString()}</p>
                </div>

                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-white/40 mb-3">
                        <Library size={16} />
                        <span className="text-xs uppercase tracking-wider font-semibold">Total Workshops</span>
                    </div>
                    <p className="text-3xl font-bold">{stats?.totalWorkshops.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Financial Summary */}
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-8">
                    <h2 className="text-lg font-semibold mb-8">Financial Overview</h2>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                        <Stat label="Booking Volume" value={fmt(stats!.totalBookingVolume)} icon={<span className="font-bold text-xs top-px relative">Rs.</span>} />
                        <Stat label="Platform Revenue" value={fmt(stats!.totalPlatformRevenue)} icon={<span className="font-bold text-xs top-px relative">Rs.</span>} highlight/>
                        <Stat label="Pending Payouts" value={fmt(stats!.pendingHostPayouts)} />
                        <Stat label="Commission Rate" value={`${stats!.commissionRate}%`} />
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-8 h-[360px] flex flex-col">
                    <h2 className="text-lg font-semibold mb-6">Revenue Trend (Last 6 Months)</h2>
                    <div className="flex-1 w-full -ml-4">
                        {stats?.monthlyRevenueData && stats.monthlyRevenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.monthlyRevenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#ffffff60', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#ffffff60', fontSize: 12 }}
                                        tickFormatter={(value) => `रु${value}`}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#ffffff10' }}
                                        contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: any) => [fmt(Number(value)), 'Revenue']}
                                    />
                                    <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/30 text-sm">
                                No revenue data available for the last 6 months.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Stat: React.FC<{ label: string; value: string; icon?: React.ReactNode; highlight?: boolean }> = ({ label, value, icon, highlight }) => (
    <div>
        <p className={`text-xs uppercase tracking-wider mb-2 flex flex-row items-center gap-1.5 ${highlight ? 'text-[#7C3AED]' : 'text-white/40'}`}>
            {icon}
            {label}
        </p>
        <p className={`text-2xl font-semibold tracking-tight ${highlight ? 'text-white' : ''}`}>{value}</p>
    </div>
);

export default OverviewPage;
