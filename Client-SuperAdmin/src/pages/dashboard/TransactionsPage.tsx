import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface Transaction {
    id: number;
    guestName: string;
    workshopTitle: string;
    hostName: string;
    totalAmount: number;
    platformFee: number;
    hostEarnings: number;
    bookingStatus: string;
    paymentStatus: string;
    payoutStatus: string;
    bookingDate: string;
    transactionId: string | null;
}

const TransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('superadmin_token');
            const res = await fetch(`${API_BASE_URL}/financials/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to load transactions');
            const data = await res.json();
            setTransactions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fmt = (n: number) =>
        new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(n);

    const getStatusColor = (status: any) => {
        const s = String(status || '').toLowerCase();
        switch (s) {
            case 'confirmed': case 'paid': case 'readyforpayout': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'escrow': case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'cancelled': case 'refunded': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    const filtered = transactions.filter(t => 
        t.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.workshopTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p className="text-white/30 text-sm">Loading transactions...</p>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Transaction Ledger</h1>
                    <p className="text-white/40 text-sm mt-1">Audit log of all platform bookings and financial movement</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search records..." 
                        className="bg-[#1C1C1E] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-white/20 text-white min-w-[300px]"
                    />
                </div>
            </div>

            <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-white/30 text-[10px] uppercase tracking-widest font-semibold border-b border-white/5">
                            <th className="px-6 py-4">ID / Date</th>
                            <th className="px-6 py-4">Guest & Workshop</th>
                            <th className="px-6 py-4">Host</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4 text-center">Statuses</th>
                            <th className="px-6 py-4 text-right">Earnings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-white/20">
                                    No transaction records found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((t) => (
                                <tr key={t.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-5">
                                        <p className="text-white/80 font-mono">#{t.id}</p>
                                        <p className="text-white/30 text-[10px] mt-1">{new Date(t.bookingDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-medium text-white/90">{t.guestName}</p>
                                        <p className="text-xs text-white/30 mt-0.5 max-w-[200px] truncate">{t.workshopTitle}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-white/60">{t.hostName}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <p className="text-white/80">{fmt(t.totalAmount)}</p>
                                        <p className="text-[10px] text-white/20 mt-0.5">Fee: {fmt(t.platformFee)}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1 items-center">
                                            <div className="flex gap-2">
                                                <Badge status={t.bookingStatus} colorStyle={getStatusColor(t.bookingStatus)} />
                                                <Badge status={t.paymentStatus} colorStyle={getStatusColor(t.paymentStatus)} />
                                            </div>
                                            <Badge status={t.payoutStatus} colorStyle={getStatusColor(t.payoutStatus)} isPayout />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <p className="text-green-400 font-semibold">{fmt(t.hostEarnings)}</p>
                                        <p className="text-[10px] text-white/30 mt-0.5">{t.transactionId || 'No Tx ID'}</p>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Badge: React.FC<{ status: string; colorStyle: string; isPayout?: boolean }> = ({ status, colorStyle, isPayout }) => (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${colorStyle} ${isPayout ? 'w-full text-center' : ''}`}>
        {isPayout ? `Payout: ${status}` : status}
    </span>
);

export default TransactionsPage;
