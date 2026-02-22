import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const CommissionPage: React.FC = () => {
    const [currentRate, setCurrentRate] = useState<number | null>(null);
    const [inputRate, setInputRate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const token = localStorage.getItem('superadmin_token');
                const res = await fetch(`${API_BASE_URL}/financials/commission`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setCurrentRate(data.rate);
                setInputRate(String(data.rate));
            } catch {
                setMessage({ type: 'error', text: 'Failed to load commission rate' });
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const parsed = parseFloat(inputRate);
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
            setMessage({ type: 'error', text: 'Enter a value between 0 and 100' });
            setSaving(false);
            return;
        }

        try {
            const token = localStorage.getItem('superadmin_token');
            const res = await fetch(`${API_BASE_URL}/financials/commission`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ percentage: parsed }),
            });

            if (!res.ok) throw new Error('Update failed');
            setCurrentRate(parsed);
            setMessage({ type: 'success', text: 'Commission rate updated' });
        } catch {
            setMessage({ type: 'error', text: 'Could not update commission rate' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-white/30 text-sm">Loading...</p>;

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight">Commission</h1>
                <p className="text-white/40 text-sm mt-1">Platform fee applied to all bookings</p>
            </div>

            <div className="max-w-xs">
                <div className="mb-8">
                    <p className="text-xs text-white/35 uppercase tracking-wider mb-2">Current Rate</p>
                    <p className="text-4xl font-semibold tracking-tight">{currentRate}%</p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label className="block text-xs text-white/40 mb-2">New Rate (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={inputRate}
                            onChange={(e) => setInputRate(e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 py-2 text-base outline-none focus:border-white transition-colors"
                        />
                    </div>

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
        </div>
    );
};

export default CommissionPage;
