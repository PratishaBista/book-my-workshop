import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Bell, Shield, CheckCircle2, Loader2, Banknote } from 'lucide-react';

interface HostPreferences {
    payoutMethod: 'Bank Transfer' | 'eSewa';
    bankName: string;
    accountName: string;
    accountNumber: string;
    esewaNumber: string;
    notifyOnNewBooking: boolean;
    notifyOnReview: boolean;
    weeklyEarningsReport: boolean;
    is2FaEnabled: boolean;
}

const DEFAULT_PREFS: HostPreferences = {
    payoutMethod: 'Bank Transfer',
    bankName: 'Nabil Bank Ltd.',
    accountName: 'Traditional Arts Studio',
    accountNumber: '012009384759001',
    esewaNumber: '',
    notifyOnNewBooking: true,
    notifyOnReview: true,
    weeklyEarningsReport: true,
    is2FaEnabled: false
};

export const HostSettingsView: React.FC = () => {
    const [prefs, setPrefs] = useState<HostPreferences>(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('host_dashboard_preferences');
        if (saved) {
            setPrefs(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    const handleSavePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Premium delay
        setSaving(false);

        localStorage.setItem('host_dashboard_preferences', JSON.stringify(prefs));
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const togglePref = (key: keyof HostPreferences) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] as any }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-primary-orange" size={32} />
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-4xl"
        >
            <div>
                <h2 className="text-3xl font-serif font-bold text-deep-purple">Account Settings</h2>
                <p className="text-gray-500 mt-1">Configure your payout gateways, notification frequencies, and studio security credentials.</p>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 font-semibold shadow-sm"
                    >
                        <CheckCircle2 className="text-emerald-600" size={20} />
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSavePreferences} className="space-y-8">
                {/* 1. Payout Gateway Configuration */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-lg font-bold text-deep-purple flex items-center gap-2 font-serif">
                        <CreditCard className="text-primary-orange" size={20} />
                        <span>Payout & Financial Gateway</span>
                    </h4>
                    <p className="text-xs text-gray-400 font-medium">Select your preferred platform withdrawal gateway and input accurate account coordinates.</p>

                    <div className="flex gap-4">
                        {['Bank Transfer', 'eSewa'].map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setPrefs(prev => ({ ...prev, payoutMethod: method as any }))}
                                className={`flex-1 p-5 rounded-2xl border-2 font-bold text-sm transition-all text-left flex items-center justify-between ${
                                    prefs.payoutMethod === method 
                                        ? 'border-deep-purple bg-deep-purple/5 text-deep-purple shadow-inner' 
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Banknote size={18} />
                                    {method}
                                </span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${prefs.payoutMethod === method ? 'border-deep-purple bg-deep-purple' : 'border-gray-300'}`}>
                                    {prefs.payoutMethod === method && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    {prefs.payoutMethod === 'Bank Transfer' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Bank Name</label>
                                <input
                                    type="text"
                                    required
                                    value={prefs.bankName}
                                    onChange={(e) => setPrefs(prev => ({ ...prev, bankName: e.target.value }))}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-deep-purple outline-none transition-all text-xs font-semibold text-deep-purple"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Account Holder Name</label>
                                <input
                                    type="text"
                                    required
                                    value={prefs.accountName}
                                    onChange={(e) => setPrefs(prev => ({ ...prev, accountName: e.target.value }))}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-deep-purple outline-none transition-all text-xs font-semibold text-deep-purple"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Account Number</label>
                                <input
                                    type="text"
                                    required
                                    value={prefs.accountNumber}
                                    onChange={(e) => setPrefs(prev => ({ ...prev, accountNumber: e.target.value }))}
                                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-deep-purple outline-none transition-all text-xs font-semibold text-deep-purple font-mono"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">eSewa Mobile Number</label>
                            <input
                                type="tel"
                                required
                                value={prefs.esewaNumber}
                                onChange={(e) => setPrefs(prev => ({ ...prev, esewaNumber: e.target.value }))}
                                placeholder="98XXXXXXXX"
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-deep-purple outline-none transition-all text-xs font-semibold text-deep-purple font-mono"
                            />
                        </div>
                    )}
                </section>

                {/* 2. Notification Preferences */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-lg font-bold text-deep-purple flex items-center gap-2 font-serif">
                        <Bell className="text-primary-orange" size={20} />
                        <span>Email Notifications</span>
                    </h4>
                    <p className="text-xs text-gray-400 font-medium">Select when our platform automated alert dispatch system should message your email terminal.</p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                            <div>
                                <h6 className="font-bold text-xs text-deep-purple">New Workshop Booking Alerts</h6>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Receive immediate details when a student purchases a ticket for your session</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePref('notifyOnNewBooking')}
                                className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${prefs.notifyOnNewBooking ? 'bg-deep-purple' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform duration-300 ${prefs.notifyOnNewBooking ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                            <div>
                                <h6 className="font-bold text-xs text-deep-purple">Student Review Notifications</h6>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Alert immediately when ratings and written comments are submitted by students</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePref('notifyOnReview')}
                                className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${prefs.notifyOnReview ? 'bg-deep-purple' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform duration-300 ${prefs.notifyOnReview ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                            <div>
                                <h6 className="font-bold text-xs text-deep-purple">Weekly Financial Digest Reports</h6>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Get a comprehensive email analytics invoice breakdown of sales and earnings every Sunday</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePref('weeklyEarningsReport')}
                                className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${prefs.weeklyEarningsReport ? 'bg-deep-purple' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform duration-300 ${prefs.weeklyEarningsReport ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. Account Protection */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-lg font-bold text-deep-purple flex items-center gap-2 font-serif">
                        <Shield className="text-primary-orange" size={20} />
                        <span>Safety & Login Authentication</span>
                    </h4>

                    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                        <div>
                            <h6 className="font-bold text-xs text-deep-purple">Enable Studio Two-Factor Authentication</h6>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Require an authenticator validation code upon admin dashboard logins</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => togglePref('is2FaEnabled')}
                            className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${prefs.is2FaEnabled ? 'bg-deep-purple' : 'bg-gray-200'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform duration-300 ${prefs.is2FaEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </section>

                {/* Submit Action */}
                <div className="flex justify-start">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3.5 bg-deep-purple hover:bg-deep-purple/95 text-white font-bold rounded-2xl text-xs flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                        {saving ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                        {saving ? 'Saving changes...' : 'Save Settings Preferences'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};
