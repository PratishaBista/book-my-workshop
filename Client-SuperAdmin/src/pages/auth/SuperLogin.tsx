import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const SuperLogin: React.FC = () => {
    const [step, setStep] = useState<'login' | 'mfa'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data || 'Unauthorized Access');
            }

            if (data.requiresMFA) {
                setStep('mfa');
            } else {
                throw new Error('Unauthorized Account');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMfa = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-superadmin-mfa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: mfaCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data || 'Verification Failed');
            }

            localStorage.setItem('superadmin_token', data.token);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-super-dark flex items-center justify-center p-6 text-white text-center selection:bg-white selection:text-black">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[400px] w-full">
                    <CheckCircle2 size={40} className="mx-auto mb-10 opacity-20" />
                    <h1 className="text-3xl font-serif font-bold tracking-tight mb-3">Welcome Back</h1>
                    <p className="text-sm text-white/50">Redirecting to dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-super-dark flex items-center justify-center p-6 text-white selection:bg-white selection:text-black">
            <div className="max-w-[400px] w-full">
                {/* Identity Section */}
                <div className="mb-12">
                    <h2 className="text-4xl font-serif font-bold tracking-tight leading-none mb-2">Super Admin</h2>
                    <p className="text-sm text-white/50">Sign in to manage the platform</p>
                </div>

                <div className="space-y-12">
                    <AnimatePresence mode="wait">
                        {step === 'login' ? (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleLogin}
                                className="space-y-8"
                            >
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <label className="block text-xs font-medium text-white/50 mb-2 group-focus-within:text-white transition-colors">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-base outline-none focus:border-white transition-all placeholder:text-white/5"
                                            placeholder="name@example.com"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-medium text-white/50 mb-2 group-focus-within:text-white transition-colors">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-base outline-none focus:border-white transition-all placeholder:text-white/5"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-xs text-red-400 bg-red-400/10 p-3 rounded">
                                        {error}
                                    </div>
                                )}

                                <button
                                    disabled={loading}
                                    className="w-full py-4 bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-all disabled:opacity-50 rounded"
                                >
                                    {loading ? "Signing in..." : "Sign In"}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="mfa"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleVerifyMfa}
                                className="space-y-8"
                            >
                                <div className="bg-white/5 p-6 rounded text-center border border-white/10">
                                    <p className="text-xs text-white/50 mb-1">We sent a code to</p>
                                    <p className="text-sm font-medium text-white">{email}</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-medium text-white/50 text-center">Enter 6-digit Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                        required
                                        className="w-full bg-transparent border-b-2 border-white/20 text-center text-4xl tracking-[0.5em] py-4 outline-none focus:border-white transition-all font-light"
                                        placeholder="000000"
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="text-xs text-red-400 bg-red-400/10 p-3 rounded">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-all disabled:opacity-50 rounded"
                                    >
                                        {loading ? "Verifying..." : "Verify Code"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('login')}
                                        className="w-full text-xs text-white/40 hover:text-white transition-colors"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SuperLogin;
