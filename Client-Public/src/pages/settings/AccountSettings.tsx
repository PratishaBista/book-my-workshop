import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Mail, Phone, Shield, 
    Loader2, CheckCircle2, ExternalLink
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Toast from '../../components/ui/Toast';
import type { ToastType } from '../../components/ui/Toast';

const AccountSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    
    // Toast State
    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const initialDataRef = React.useRef({ email: '', phone: '' });

    useEffect(() => {
        fetchAccountData();
        
        const handleGlobalReset = () => {
             setEmail(initialDataRef.current.email);
             setPhone(initialDataRef.current.phone);
        };
        
        const handleGlobalSave = () => handleSave();

        window.addEventListener('settings-reset', handleGlobalReset);
        window.addEventListener('settings-save', handleGlobalSave);
        
        return () => {
            window.removeEventListener('settings-reset', handleGlobalReset);
            window.removeEventListener('settings-save', handleGlobalSave);
        };
    }, []);

    const fetchAccountData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.get, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setEmail(data.email || '');
                setPhone(data.phoneNumber || '');
                setIsEmailVerified(data.emailConfirmed || false);
                setIsGoogleConnected(!!data.googleId);
                
                initialDataRef.current = {
                    email: data.email || '',
                    phone: data.phoneNumber || ''
                };
            }
        } catch (error) {
            console.error('Error fetching account data:', error);
            showToast('Failed to load account details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.update, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    phoneNumber: phone
                })
            });

            if (response.ok) {
                initialDataRef.current = { email, phone };
                showToast('Account settings updated successfully', 'success');
            } else {
                const err = await response.text();
                showToast(`Update failed: ${err}`, 'error');
            }
        } catch (error) {
            showToast('Network error during save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm('Deactivating your account will hide your profile and workshops. You can reactivate anytime by logging back in. Proceed?')) {
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.deactivate, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showToast('Account deactivated. Logging out...', 'success');
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/';
                }, 2000);
            }
        } catch (error) {
            showToast('Deactivation failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('This will start a 30-day deletion countdown. Your account will be hidden immediately and permanently purged after 30 days. Proceed?')) {
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.delete, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showToast('Deletion scheduled. Logging out...', 'success');
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/';
                }, 2000);
            }
        } catch (error) {
            showToast('Deletion failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-orange" size={24} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl"
        >
            <div className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-deep-purple mb-3">Account Management</h1>
                <p className="text-deep-purple/60 text-lg">
                    Manage your core account identity and connected services.
                </p>
            </div>

            {saving && (
                <div className="mb-6 animate-pulse text-deep-purple/40 font-bold flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Updating account identity...</span>
                </div>
            )}

            <div className="space-y-12">
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1">Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 text-deep-purple/20 group-focus-within:text-primary-orange transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all shadow-sm font-medium"
                                    placeholder="your@email.com"
                                />
                                {isEmailVerified && (
                                    <div className="absolute right-4 top-4 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight border border-emerald-100">
                                        <CheckCircle2 size={12} /> Verified
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-deep-purple/40 ml-1 mt-1.5 leading-relaxed">
                                Used for login and important workshop updates. Changing this will require a confirmation link.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Mobile Phone</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-4 text-deep-purple/20 group-focus-within:text-primary-orange transition-colors" size={20} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all shadow-sm font-medium"
                                    placeholder="+977-9800000000"
                                />
                            </div>
                            <p className="text-[10px] text-deep-purple/40 ml-1 mt-1.5 leading-relaxed">
                                Used for emergency alerts and SMS notifications. Only shared with hosts after a booking.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1">Safety & Security</h3>
                    <div className="bg-white/40 border border-deep-purple/5 rounded-3xl p-8 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary-orange shadow-sm border border-primary-orange/5">
                                <Shield size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold text-deep-purple text-lg">Your Password</h4>
                                <p className="text-sm text-deep-purple/40">Last changed recently. Keeping it fresh keeps you safe.</p>
                            </div>
                        </div>
                        <button className="px-8 py-3 bg-deep-purple text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-deep-purple/20 transition-all flex items-center gap-2">
                            Manage Security <ExternalLink size={16} />
                        </button>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1">Linked Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-6 rounded-3xl border transition-all ${isGoogleConnected ? 'bg-white border-deep-purple/5 shadow-sm' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${isGoogleConnected ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {isGoogleConnected ? 'Connected' : 'Not Linked'}
                                </span>
                            </div>
                            <h5 className="font-bold text-deep-purple mb-1">Google Identity</h5>
                            <p className="text-xs text-deep-purple/40 mb-4 leading-relaxed">Sign in with one click next time.</p>
                            <button className="text-xs font-bold text-primary-orange hover:text-deep-purple transition-colors flex items-center gap-1.5">
                                {isGoogleConnected ? 'Disconnect Account' : 'Link Google Account'}
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-6 ml-1">Account Lifecycle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-orange-100 bg-orange-50/20 rounded-3xl p-8 flex flex-col justify-between gap-6">
                            <div>
                                <h4 className="font-bold text-orange-700 text-lg flex items-center gap-2">
                                    Deactivate Account
                                </h4>
                                <p className="text-sm text-orange-600/60 mt-2">
                                    Temporarily hide your profile and workshops. You can come back and reactive everything anytime.
                                </p>
                            </div>
                            <button 
                                onClick={handleDeactivate}
                                className="w-full py-4 bg-white border border-orange-200 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all active:scale-95 shadow-sm"
                            >
                                Deactivate Temporarily
                            </button>
                        </div>

                        <div className="border border-red-100 bg-red-50/30 rounded-3xl p-8 flex flex-col justify-between gap-6">
                            <div>
                                <h4 className="font-bold text-red-600 text-lg">Permanent Deletion</h4>
                                <p className="text-sm text-red-400 mt-2">
                                    This will start a 30-day countdown to purge all data. Logging back in cancels this request.
                                </p>
                            </div>
                            <button 
                                onClick={handleDeleteAccount}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-red-200 transition-all active:scale-95"
                            >
                                Start 30-Day Deletion
                            </button>
                        </div>
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

export default AccountSettings;
