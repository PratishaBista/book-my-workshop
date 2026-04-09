import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { API_ENDPOINTS } from '../../config/api';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const email = query.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (password.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword: password })
            });

            const data = await response.json();

            if (!response.ok) {
                let msg = 'Failed to reset password. The link might be expired.';
                if (data.message) msg = data.message;
                else if (Array.isArray(data)) msg = data[0]?.description || msg;
                else if (typeof data === 'string') msg = data;
                throw new Error(msg);
            }

            setSuccessMsg('Your password has been successfully reset.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <>
                <Navbar />
                <div className="min-h-[70vh] bg-cream-base flex items-center justify-center px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-deep-purple mb-4">Invalid Reset Link</h2>
                        <p className="text-deep-purple/70 mb-6">This password reset link is invalid or has expired.</p>
                        <Link to="/forgot-password" className="px-6 py-3 bg-primary-orange text-white rounded-lg hover:bg-primary-orange/90 transition-colors">
                            Request New Link
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#2D1B3E] relative flex items-center justify-center px-4 py-32 overflow-hidden">
                <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M20 20l15-5-5 15zM70 40l20-10-10 20zM120 20l15-5-5 15zM40 80l20-10-10 20zM100 80l20-10-10 20zM20 140l15-5-5 15zM70 140l20-10-10 20zM120 140l15-5-5 15zM20 80h5v5h-5zM120 80h5v5h-5zM70 90h5v5h-5zM10 50l10-5-5 10zM110 50l10-5-5 10zM50 110l10-5-5 10z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="bg-cream-offwhite rounded-3xl shadow-2xl border border-white/10 p-8">
                        <h1 className="text-3xl font-serif font-bold text-deep-purple mb-2">Reset Password</h1>
                        <p className="text-deep-purple/60 mb-8">
                            Please enter your new password below.
                        </p>

                        {successMsg && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-start gap-3 border border-green-200">
                                <CheckCircle className="shrink-0 mt-0.5" size={18} />
                                <p className="text-sm">{successMsg}<br/>Redirecting to login...</p>
                            </motion.div>
                        )}

                        {errorMsg && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-200">
                                <XCircle className="shrink-0 mt-0.5" size={18} />
                                <p className="text-sm">{errorMsg}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-deep-purple mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-deep-purple/20 focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all bg-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-deep-purple"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-deep-purple mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-deep-purple/20 focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all bg-white"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword || !!successMsg}
                                className="w-full py-3 bg-primary-orange text-white font-semibold rounded-xl hover:bg-primary-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </>
    );
};

export default ResetPassword;
