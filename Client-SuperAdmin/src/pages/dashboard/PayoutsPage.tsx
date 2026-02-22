import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

interface HostPayout {
    providerId: number;
    businessName: string;
    email: string;
    walletBalance: number;
}

const PayoutsPage: React.FC = () => {
    const [hosts, setHosts] = useState<HostPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [settling, setSettling] = useState<number | null>(null);

    const fetchHosts = async () => {
        try {
            const token = localStorage.getItem('superadmin_token');
            const res = await fetch(`${API_BASE_URL}/financials/payouts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to load hosts');
            const data = await res.json();
            setHosts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHosts();
    }, []);

    const handleSettle = async (providerId: number) => {
        setSettling(providerId);
        try {
            const token = localStorage.getItem('superadmin_token');
            const res = await fetch(`${API_BASE_URL}/financials/payouts/${providerId}/settle`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to settle');
            await fetchHosts();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSettling(null);
        }
    };

    const fmt = (n: number) =>
        new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(n);

    if (loading) return <p className="text-white/30 text-sm">Loading...</p>;
    if (error) return <p className="text-red-400 text-sm">{error}</p>;

    const pending = hosts.filter((h) => h.walletBalance > 0);

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight">Host Payouts</h1>
                <p className="text-white/40 text-sm mt-1">
                    {pending.length} host{pending.length !== 1 ? 's' : ''} with pending balance
                </p>
            </div>

            {hosts.length === 0 ? (
                <p className="text-white/30 text-sm">No hosts found</p>
            ) : (
                <div className="space-y-0 max-w-2xl">
                    {/* Header */}
                    <div className="grid grid-cols-3 pb-3 text-xs text-white/30 uppercase tracking-wider">
                        <span>Host</span>
                        <span className="text-right">Balance</span>
                        <span />
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {hosts.map((host) => (
                        <div key={host.providerId} className="grid grid-cols-3 items-center py-4 border-b border-white/[0.04]">
                            <div>
                                <p className="text-sm font-medium">{host.businessName}</p>
                                <p className="text-xs text-white/30 mt-0.5">{host.email}</p>
                            </div>

                            <p className={`text-sm text-right font-medium ${host.walletBalance > 0 ? 'text-white' : 'text-white/25'}`}>
                                {fmt(host.walletBalance)}
                            </p>

                            <div className="flex justify-end">
                                {host.walletBalance > 0 ? (
                                    <button
                                        onClick={() => handleSettle(host.providerId)}
                                        disabled={settling === host.providerId}
                                        className="text-xs px-4 py-1.5 bg-white text-black font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-40"
                                    >
                                        {settling === host.providerId ? 'Settling...' : 'Settle'}
                                    </button>
                                ) : (
                                    <span className="text-xs text-white/20">Settled</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PayoutsPage;
