import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { Percent, Receipt, Info } from 'lucide-react';

interface RateCardProps {
    title: string;
    description: string;
    currentRate: number | null;
    inputRate: string;
    onInputChange: (val: string) => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    saving: boolean;
    message: { type: 'success' | 'error'; text: string } | null;
    accent: string;
    icon: React.ReactNode;
    hint?: string;
}

const RateCard: React.FC<RateCardProps> = ({
    title, description, currentRate, inputRate, onInputChange,
    onSave, saving, message, accent, icon, hint
}) => (
    <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
                {icon}
            </div>
            <div>
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="text-xs text-white/40">{description}</p>
            </div>
        </div>

        <div className="mb-8">
            <p className="text-xs text-white/35 uppercase tracking-wider mb-2">Current Rate</p>
            <p className="text-5xl font-bold tracking-tight">
                {currentRate !== null ? `${currentRate}%` : '—'}
            </p>
        </div>

        <form onSubmit={onSave} className="space-y-5">
            <div>
                <label className="block text-xs text-white/40 mb-2">New Rate (%)</label>
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={inputRate}
                    onChange={(e) => onInputChange(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-2 text-base outline-none focus:border-white transition-colors"
                />
            </div>

            {hint && (
                <p className="flex items-start gap-1.5 text-xs text-white/30">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    {hint}
                </p>
            )}

            {message && (
                <p className={`text-xs ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.text}
                </p>
            )}

            <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-40"
            >
                {saving ? 'Saving...' : 'Update Rate'}
            </button>
        </form>
    </div>
);

const CommissionPage: React.FC = () => {
    // --- Commission ---
    const [commissionRate, setCommissionRate] = useState<number | null>(null);
    const [commissionInput, setCommissionInput] = useState('');
    const [commissionSaving, setCommissionSaving] = useState(false);
    const [commissionMsg, setCommissionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- VAT ---
    const [vatRate, setVatRate] = useState<number | null>(null);
    const [vatInput, setVatInput] = useState('');
    const [vatSaving, setVatSaving] = useState(false);
    const [vatMsg, setVatMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('superadmin_token');
        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            fetch(`${API_BASE_URL}/financials/commission`, { headers }).then(r => r.json()),
            fetch(`${API_BASE_URL}/financials/vat`, { headers }).then(r => r.json()),
        ])
            .then(([c, v]) => {
                setCommissionRate(c.rate);
                setCommissionInput(String(c.rate));
                setVatRate(v.rate);
                setVatInput(String(v.rate));
            })
            .finally(() => setLoading(false));
    }, []);

    const updateRate = async (
        endpoint: string,
        input: string,
        setSaving: (b: boolean) => void,
        setMsg: (m: { type: 'success' | 'error'; text: string } | null) => void,
        setRate: (n: number) => void,
        label: string
    ) => {
        const parsed = parseFloat(input);
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
            setMsg({ type: 'error', text: 'Enter a value between 0 and 100' });
            return;
        }
        setSaving(true);
        setMsg(null);
        try {
            const token = localStorage.getItem('superadmin_token');
            const res = await fetch(`${API_BASE_URL}/financials/${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ percentage: parsed }),
            });
            if (!res.ok) throw new Error();
            setRate(parsed);
            setMsg({ type: 'success', text: `${label} updated successfully` });
        } catch {
            setMsg({ type: 'error', text: `Could not update ${label.toLowerCase()}` });
        } finally {
            setSaving(false);
        }
    };

    const handleCommissionSave = (e: React.FormEvent) => {
        e.preventDefault();
        return updateRate('commission', commissionInput, setCommissionSaving, setCommissionMsg, setCommissionRate, 'Commission rate');
    };

    const handleVatSave = (e: React.FormEvent) => {
        e.preventDefault();
        return updateRate('vat', vatInput, setVatSaving, setVatMsg, setVatRate, 'VAT rate');
    };

    if (loading) return <p className="text-white/30 text-sm">Loading...</p>;

    // Example breakdown
    const exampleTotal = 1000;
    const exampleCommission = commissionRate ? +(exampleTotal * commissionRate / 100).toFixed(2) : 0;
    const exampleVat = vatRate ? +(exampleCommission * vatRate / 100).toFixed(2) : 0;
    const exampleNet = +(exampleCommission - exampleVat).toFixed(2);
    const exampleHost = +(exampleTotal - exampleCommission).toFixed(2);

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight">Commission &amp; VAT</h1>
                <p className="text-white/40 text-sm mt-1">
                    Platform fee and tax settings applied to all bookings
                </p>
            </div>

            {/* Example breakdown */}
            <div className="mb-10 bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                    <Info size={12} /> How it works — example for a Rs.{exampleTotal} booking
                </p>
                <div className="flex flex-wrap gap-0">
                    {[
                        { label: 'Booking Amount', value: `Rs. ${exampleTotal}`, sub: 'Paid by customer', color: 'text-white' },
                        { label: `Commission (${commissionRate}%)`, value: `Rs. ${exampleCommission}`, sub: 'Gross platform fee', color: 'text-purple-400' },
                        { label: `VAT on commission (${vatRate}%)`, value: `− Rs. ${exampleVat}`, sub: 'Remit to IRD', color: 'text-amber-400' },
                        { label: 'Net Platform Revenue', value: `Rs. ${exampleNet}`, sub: 'Platform keeps', color: 'text-green-400' },
                        { label: 'Host Earnings', value: `Rs. ${exampleHost}`, sub: 'Paid out to host', color: 'text-blue-400' },
                    ].map((item, i, arr) => (
                        <React.Fragment key={item.label}>
                            <div className="flex flex-col gap-1 min-w-[140px]">
                                <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.label}</p>
                                <p className={`text-xl font-semibold ${item.color}`}>{item.value}</p>
                                <p className="text-[10px] text-white/25">{item.sub}</p>
                            </div>
                            {i < arr.length - 1 && (
                                <div className="flex items-center px-4 text-white/15 text-lg self-center">→</div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Rate editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <RateCard
                    title="Commission Rate"
                    description="Platform fee on each booking"
                    currentRate={commissionRate}
                    inputRate={commissionInput}
                    onInputChange={setCommissionInput}
                    onSave={handleCommissionSave}
                    saving={commissionSaving}
                    message={commissionMsg}
                    accent="bg-purple-500/10"
                    icon={<Percent size={16} className="text-purple-400" />}
                    hint="Applies to total booking amount. Host receives the remainder."
                />
                <RateCard
                    title="VAT Rate"
                    description="Tax deducted from commission only"
                    currentRate={vatRate}
                    inputRate={vatInput}
                    onInputChange={setVatInput}
                    onSave={handleVatSave}
                    saving={vatSaving}
                    message={vatMsg}
                    accent="bg-amber-500/10"
                    icon={<Receipt size={16} className="text-amber-400" />}
                    hint="Nepal standard VAT is 13%. This is deducted from the platform commission — it does NOT affect host earnings."
                />
            </div>
        </div>
    );
};

export default CommissionPage;
