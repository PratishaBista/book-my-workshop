import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, QrCode, Smartphone, LogOut, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import type { ToastType } from '../../components/ui/Toast';

interface Session {
    id: string;
    device: string;
    location: string;
    ip: string;
    activeTime: string;
    isCurrent: boolean;
}

const INITIAL_SESSIONS: Session[] = [
    { id: '1', device: 'Windows 11 PC - Chrome browser', location: 'Kathmandu, Nepal', ip: '103.104.28.19', activeTime: 'Active now', isCurrent: true },
    { id: '2', device: 'iPhone 15 Pro - Safari Mobile', location: 'Lalitpur, Nepal', ip: '202.166.220.10', activeTime: '3 days ago', isCurrent: false },
    { id: '3', device: 'iPad Air 5 - BookMyWorkshop Native App', location: 'Pokhara, Nepal', ip: '103.104.29.5', activeTime: '1 week ago', isCurrent: false }
];

const SecuritySettings: React.FC = () => {
    const [is2FaEnabled, setIs2FaEnabled] = useState(false);
    const [show2FaSetup, setShow2FaSetup] = useState(false);
    const [qrCodeVerified, setQrCodeVerified] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
    const [verifying, setVerifying] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    useEffect(() => {
        const saved2Fa = localStorage.getItem('security_2fa_enabled');
        if (saved2Fa === 'true') {
            setIs2FaEnabled(true);
        }
    }, []);

    const handleToggle2Fa = () => {
        if (is2FaEnabled) {
            // Disable 2FA directly
            localStorage.setItem('security_2fa_enabled', 'false');
            setIs2FaEnabled(false);
            showToast('Two-factor authentication disabled', 'info');
        } else {
            // Open setup modal
            setShow2FaSetup(true);
        }
    };

    const handleVerify2FaSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (twoFactorCode.length !== 6 || isNaN(Number(twoFactorCode))) {
            showToast('Please enter a valid 6-digit numerical code', 'error');
            return;
        }

        setVerifying(true);
        await new Promise(resolve => setTimeout(resolve, 1200)); // Premium verification loader
        setVerifying(false);

        localStorage.setItem('security_2fa_enabled', 'true');
        setIs2FaEnabled(true);
        setShow2FaSetup(false);
        setTwoFactorCode('');
        showToast('Two-factor authentication setup completed successfully!', 'success');
    };

    const handleRevokeSessions = async () => {
        if (!confirm('Are you sure you want to end all other active sessions? You will be signed out from your other devices.')) return;
        setRevoking(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRevoking(false);
        setSessions(prev => prev.filter(s => s.isCurrent));
        showToast('Ended all other sessions successfully', 'success');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl"
        >
            <div className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-deep-purple mb-3">Security Settings</h1>
                <p className="text-deep-purple/60 text-lg">
                    Add robust protective layers to your account and manage active login terminals.
                </p>
            </div>

            <div className="space-y-12">
                {/* 2FA Section */}
                <section className="bg-white/50 border border-deep-purple/5 p-6 rounded-3xl backdrop-blur-sm shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${is2FaEnabled ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-primary-orange'}`}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h5 className="font-bold text-base text-deep-purple flex items-center gap-2">
                                    Two-Factor Authentication (2FA)
                                    {is2FaEnabled && (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>
                                    )}
                                </h5>
                                <p className="text-xs text-deep-purple/40 font-medium mt-1 leading-relaxed max-w-lg">
                                    Secure your account by requiring an authenticator code (like Google Authenticator or Duo) in addition to your username and password when logging in.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggle2Fa}
                            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 flex-shrink-0 cursor-pointer ${is2FaEnabled ? 'bg-green-600' : 'bg-gray-200'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${is2FaEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Setup steps if triggered */}
                    <AnimatePresence>
                        {show2FaSetup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-8 pt-8 border-t border-deep-purple/5 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-deep-purple/5 shadow-inner">
                                        <div className="relative p-3 bg-white border border-gray-100 rounded-xl">
                                            <QrCode size={120} className="text-deep-purple" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/95 opacity-0 hover:opacity-100 transition-opacity p-2 text-center text-[10px] font-bold text-deep-purple">
                                                Scan with Google Authenticator
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-deep-purple/40 mt-3 uppercase tracking-widest">Step 1: Scan QR Code</span>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <h6 className="font-bold text-sm text-deep-purple flex items-center gap-1.5">
                                            <Smartphone size={16} className="text-primary-orange" /> Configure Authenticator App
                                        </h6>
                                        <p className="text-xs text-deep-purple/60 leading-relaxed">
                                            Can't scan? Use this unique setup key in your mobile app:<br />
                                            <code className="bg-cream-base px-3 py-1.5 rounded-lg text-primary-orange font-mono font-bold text-xs inline-block mt-2 tracking-wider">
                                                BMW2FA 7XKJ 9LQP 8820
                                            </code>
                                        </p>

                                        <form onSubmit={handleVerify2FaSetup} className="space-y-3 pt-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-deep-purple/40 block">Step 2: Enter Verification Code</label>
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    required
                                                    placeholder="000000"
                                                    value={twoFactorCode}
                                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                                    className="px-4 py-3 bg-white rounded-xl border border-deep-purple/10 focus:border-primary-orange outline-none text-center font-mono font-bold text-lg w-36 tracking-widest"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={verifying || twoFactorCode.length !== 6}
                                                    className="px-6 bg-deep-purple hover:bg-deep-purple/90 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40"
                                                >
                                                    {verifying ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                                                    {verifying ? 'Verifying...' : 'Verify & Enable'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShow2FaSetup(false); setTwoFactorCode(''); }}
                                                    className="px-4 text-xs font-bold text-deep-purple/40 hover:text-deep-purple"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* Session Management */}
                <section>
                    <div className="flex items-center justify-between mb-6 ml-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 flex items-center gap-2">
                            <Key size={14} /> Session Management
                        </h3>
                        {sessions.length > 1 && (
                            <button
                                onClick={handleRevokeSessions}
                                disabled={revoking}
                                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                                {revoking ? <Loader2 className="animate-spin" size={12} /> : <LogOut size={12} />}
                                Revoke Other Terminals
                            </button>
                        )}
                    </div>

                    <div className="space-y-4 max-w-2xl">
                        {sessions.map((session) => (
                            <div key={session.id} className="p-5 bg-white/60 border border-deep-purple/5 rounded-2xl flex justify-between items-center shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-deep-purple/40">
                                        <Smartphone size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h6 className="font-bold text-sm text-deep-purple">{session.device}</h6>
                                            {session.isCurrent && (
                                                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">Current</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-deep-purple/40 font-medium mt-1">
                                            {session.location} • IP: <code className="font-mono text-[10px] bg-cream-base px-1 rounded">{session.ip}</code>
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-deep-purple/30 uppercase">{session.activeTime}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="h-20" />

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </motion.div>
    );
};

export default SecuritySettings;
