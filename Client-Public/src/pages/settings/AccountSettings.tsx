import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mail, Phone, Shield,
    Loader2, CheckCircle2,
    Trash2, Power as PowerIcon
} from 'lucide-react';
import { API_ENDPOINTS, GOOGLE_CLIENT_ID } from '../../config/api';
import Toast from '../../components/ui/Toast';
import type { ToastType } from '../../components/ui/Toast';

declare global {
    interface Window {
        google: any;
    }
}

const AccountSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'email' | 'phone'>('email');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: '',
        type: 'info' as 'info' | 'danger' | 'warning'
    });

    // Toast State
    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const isGoogleInitRef = React.useRef(false);
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

        // Initialize Google
        const initGoogle = () => {
            if (window.google && GOOGLE_CLIENT_ID && !isGoogleInitRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleLinkResponse,
                    use_fedcm_for_prompt: true
                });
                isGoogleInitRef.current = true;
            }
        };

        if (window.google) {
            initGoogle();
        } else {
            const interval = setInterval(() => {
                if (window.google) {
                    initGoogle();
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }

        return () => {
            window.removeEventListener('settings-reset', handleGlobalReset);
            window.removeEventListener('settings-save', handleGlobalSave);
        };
    }, []);

    const handleGoogleLinkResponse = async (response: any) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.profile.linkGoogle, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ idToken: response.credential })
            });

            if (res.ok) {
                setIsGoogleConnected(true);
                showToast('Google account linked successfully!');
            } else {
                const err = await res.json();
                showToast(err.message || 'Linking failed', 'error');
            }
        } catch (error) {
            showToast('Network error during Google link', 'error');
        } finally {
            setSaving(false);
        }
    };

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
                setHasPassword(data.hasPassword || false);

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
        setConfirmModal({
            isOpen: true,
            title: 'Deactivate Account?',
            message: 'Deactivating your account will hide your profile and workshops. You can reactivate anytime by logging back in. Proceed?',
            confirmText: 'Deactivate',
            type: 'warning',
            onConfirm: async () => {
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
            }
        });
    };

    const handleDeleteAccount = async () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Account?',
            message: 'This will permanently remove all your personal identity, bio, and linked accounts. This action is immediate and cannot be undone. Are you sure?',
            confirmText: 'Permanently Delete',
            type: 'danger',
            onConfirm: async () => {
                setSaving(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(API_ENDPOINTS.profile.delete, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        showToast('Account permanently deleted. All personal data removed.', 'success');
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
            }
        });
    };

    const handleDisconnectGoogle = async () => {
        if (!hasPassword) {
            showToast('Please set a password before disconnecting Google to avoid account lockout.', 'error');
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Disconnect Google?',
            message: 'Are you sure you want to disconnect your Google account? You will need to use your email and password to login next time.',
            confirmText: 'Disconnect',
            type: 'info',
            onConfirm: async () => {
                setSaving(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(API_ENDPOINTS.profile.disconnectGoogle, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        setIsGoogleConnected(false);
                        showToast('Google account disconnected successfully');
                    } else {
                        const err = await response.json();
                        showToast(err.message || 'Disconnect failed', 'error');
                    }
                } catch (error) {
                    showToast('Network error during disconnect', 'error');
                } finally {
                    setSaving(false);
                }
            }
        });
    };

    const handleTriggerGoogleLink = () => {
        if (window.google) {
            // Ensure initialized
            if (!isGoogleInitRef.current && GOOGLE_CLIENT_ID) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleLinkResponse,
                    use_fedcm_for_prompt: true
                });
                isGoogleInitRef.current = true;
            }
            window.google.accounts.id.prompt();
        } else {
            showToast('Google services are still loading...', 'info');
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
                    <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email Trigger */}
                        <button 
                            onClick={() => { setModalMode('email'); setIsContactModalOpen(true); }}
                            className="group text-left"
                        >
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1 mb-2 block">Email Address</label>
                            <div className="p-4 bg-white/60 border border-deep-purple/5 rounded-2xl flex items-center justify-between group-hover:border-primary-orange/30 group-hover:bg-white transition-all shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Mail className="text-deep-purple/20 group-hover:text-primary-orange" size={20} />
                                    <span className="font-medium text-deep-purple">{email}</span>
                                </div>
                                {isEmailVerified ? (
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                ) : (
                                    <span className="text-[10px] font-bold text-primary-orange uppercase">Verify</span>
                                )}
                            </div>
                            <p className="text-[10px] text-deep-purple/40 ml-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">Click to change email address</p>
                        </button>

                        {/* Phone Trigger */}
                        <button 
                            onClick={() => { setModalMode('phone'); setIsContactModalOpen(true); }}
                            className="group text-left"
                        >
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1 mb-2 block">Mobile Phone</label>
                            <div className="p-4 bg-white/60 border border-deep-purple/5 rounded-2xl flex items-center justify-between group-hover:border-primary-orange/30 group-hover:bg-white transition-all shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Phone className="text-deep-purple/20 group-hover:text-primary-orange" size={20} />
                                    <span className="font-medium text-deep-purple">{phone || 'Add phone number'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-deep-purple/30 uppercase">Change</span>
                            </div>
                            <p className="text-[10px] text-deep-purple/40 ml-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">Click to update phone number</p>
                        </button>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1">Safety & Security</h3>
                    <div className="max-w-xl">
                        <div className="flex items-center justify-between p-4 bg-white/40 border border-deep-purple/5 rounded-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0 text-primary-orange">
                                    <Shield size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h5 className="font-bold text-sm text-deep-purple">{hasPassword ? 'Account Password' : 'Setup Password'}</h5>
                                    <p className="text-[10px] text-deep-purple/40 truncate font-medium">
                                        {hasPassword ? 'Last changed recently' : 'Set a password for extra security'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSecurityModalOpen(true)}
                                className="text-xs font-bold text-deep-purple hover:bg-deep-purple/5 px-4 py-2 rounded-lg transition-colors"
                            >
                                {hasPassword ? 'Manage' : 'Setup'}
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1">Connected Accounts</h3>
                    <div className="max-w-xl">
                        <div className="flex items-center justify-between p-4 bg-white/40 border border-deep-purple/5 rounded-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h5 className="font-bold text-sm text-deep-purple">Google Account</h5>
                                    {isGoogleConnected && (
                                        <p className="text-[10px] text-deep-purple/40 truncate font-medium">{email}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={isGoogleConnected ? handleDisconnectGoogle : handleTriggerGoogleLink}
                                className={`text-xs font-bold px-4 py-2 rounded-lg ${isGoogleConnected
                                        ? 'text-primary-orange hover:bg-primary-orange/5'
                                        : 'text-blue-800'
                                    }`}
                            >
                                {isGoogleConnected ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1">Account Lifecycle</h3>
                    <div className="space-y-4">
                        <button
                            onClick={handleDeactivate}
                            className="flex items-center gap-3 text-deep-purple/60 hover:text-orange-600 transition-colors py-2 px-1 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                                <PowerIcon size={18} />
                            </div>
                            <span className="font-bold text-sm">Deactivate Account Temporarily</span>
                        </button>

                        <button
                            onClick={handleDeleteAccount}
                            className="flex items-center gap-3 text-red-500/60 hover:text-red-600 transition-colors py-2 px-1 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50/50 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                                <Trash2 size={18} />
                            </div>
                            <span className="font-bold text-sm">Permanently Delete Account</span>
                        </button>
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

            <SecurityModal
                isOpen={isSecurityModalOpen}
                onClose={() => setIsSecurityModalOpen(false)}
                hasPassword={hasPassword}
                onSuccess={(msg) => {
                    showToast(msg);
                    setHasPassword(true);
                }}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
            />

            <ContactModal 
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                mode={modalMode}
                currentValue={modalMode === 'email' ? email : phone}
                onSuccess={(newValue) => {
                    if (modalMode === 'email') setEmail(newValue);
                    else setPhone(newValue);
                    showToast(`${modalMode === 'email' ? 'Email' : 'Phone'} updated successfully`);
                }}
            />
        </motion.div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info' }) => {
    if (!isOpen) return null;

    const accentColor = type === 'danger' ? 'bg-red-600' : type === 'warning' ? 'bg-orange-500' : 'bg-deep-purple';
    const shadowColor = type === 'danger' ? 'shadow-red-200' : type === 'warning' ? 'shadow-orange-200' : 'shadow-deep-purple/20';

    return (
        <div className="fixed inset-0 bg-deep-purple/20 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 max-w-[340px] w-full shadow-2xl overflow-hidden relative"
            >
                <div className="text-center">
                    <h3 className="text-2xl font-serif font-bold text-deep-purple mb-3">{title}</h3>
                    <p className="text-deep-purple/60 text-sm leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 text-deep-purple rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 ${accentColor} text-white rounded-xl font-bold text-sm hover:shadow-xl ${shadowColor} transition-all active:scale-95`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const SecurityModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    hasPassword: boolean;
    onSuccess: (msg: string) => void;
}> = ({ isOpen, onClose, hasPassword, onSuccess }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.setPassword, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: hasPassword ? currentPassword : null,
                    newPassword
                })
            });

            if (response.ok) {
                onSuccess(hasPassword ? 'Password changed successfully' : 'Password set successfully');
                onClose();
            } else {
                const err = await response.json();
                const errorMsg = Array.isArray(err) ? err[0]?.description : (err.message || 'Failed to update password');
                alert(errorMsg);
            }
        } catch (error) {
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-deep-purple/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-serif font-bold text-deep-purple">
                        {hasPassword ? 'Change Password' : 'Setup Password'}
                    </h3>
                    <button onClick={onClose} className="text-deep-purple/40 hover:text-deep-purple p-2">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {hasPassword && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Current Password</label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all"
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">New Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-deep-purple text-white rounded-2xl font-bold mt-4 hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : (hasPassword ? 'Update Password' : 'Set Password')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const ContactModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    mode: 'email' | 'phone';
    currentValue: string;
    onSuccess: (newValue: string) => void;
}> = ({ isOpen, onClose, mode, currentValue, onSuccess }) => {
    const [value, setValue] = useState(currentValue);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setValue(currentValue);
    }, [currentValue, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.update, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    [mode]: value
                })
            });

            if (response.ok) {
                onSuccess(value);
                onClose();
            } else {
                const text = await response.text();
                alert(`Failed to update: ${text}`);
            }
        } catch (error) {
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-deep-purple/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-deep-purple">
                        Update {mode === 'email' ? 'Email' : 'Phone'}
                    </h3>
                    <button onClick={onClose} className="text-deep-purple/40 hover:text-deep-purple p-2">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">
                            {mode === 'email' ? 'New Email Address' : 'New Mobile Phone'}
                        </label>
                        <div className="relative">
                            <input
                                type={mode === 'email' ? 'email' : 'tel'}
                                required
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all font-medium"
                                placeholder={mode === 'email' ? 'your@email.com' : '+977-98...'}
                                autoFocus
                            />
                        </div>
                    </div>
                    {mode === 'email' && (
                        <p className="text-[10px] text-deep-purple/40 leading-relaxed px-1">
                            We'll send a confirmation link to this email to verify ownership.
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading || value === currentValue}
                        className="w-full py-4 bg-deep-purple text-white rounded-2xl font-bold mt-2 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
                    >
                        {loading ? 'Saving...' : 'Update Information'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AccountSettings;
