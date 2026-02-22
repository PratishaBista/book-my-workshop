import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

interface DashboardStats {
    commissionRate: number;
    totalPlatformRevenue: number;
    pendingHostPayouts: number;
    totalBookingVolume: number;
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
        <div>
            <div className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
                <p className="text-white/40 text-sm mt-1">Platform financial summary</p>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-10 max-w-xl">
                <Stat label="Booking Volume" value={fmt(stats!.totalBookingVolume)} />
                <Stat label="Platform Revenue" value={fmt(stats!.totalPlatformRevenue)} />
                <Stat label="Pending Payouts" value={fmt(stats!.pendingHostPayouts)} />
                <Stat label="Commission Rate" value={`${stats!.commissionRate}%`} />
            </div>
        </div>
    );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-white/35 mb-2 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
);

export default OverviewPage;
