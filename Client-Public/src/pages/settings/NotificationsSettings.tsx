import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, MessageSquare, Volume2, VolumeX, ShieldAlert, Loader2 } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import type { ToastType } from '../../components/ui/Toast';

interface NotificationPreferences {
    emailBookings: boolean;
    emailUpdates: boolean;
    emailMarketing: boolean;
    pushChat: boolean;
    pushReminders: boolean;
    muteAll: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
    emailBookings: true,
    emailUpdates: true,
    emailMarketing: false,
    pushChat: true,
    pushReminders: true,
    muteAll: false
};

const NotificationsSettings: React.FC = () => {
    const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    useEffect(() => {
        // Load from localStorage for quick persistence
        try {
            const saved = localStorage.getItem('notification_preferences');
            if (saved) {
                setPrefs(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Error loading notification preferences:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const togglePref = (key: keyof NotificationPreferences) => {
        setPrefs(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            // If muteAll is enabled, it takes precedence but doesn't overwrite individual choices
            return updated;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        try {
            localStorage.setItem('notification_preferences', JSON.stringify(prefs));
            showToast('Notification preferences updated successfully', 'success');
        } catch (e) {
            showToast('Failed to save preferences', 'error');
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
                <h1 className="text-4xl font-serif font-bold text-deep-purple mb-3">Notifications</h1>
                <p className="text-deep-purple/60 text-lg">
                    Choose how and when you want to receive alerts about your bookings, workshops, and messages.
                </p>
            </div>

            {saving && (
                <div className="mb-6 animate-pulse text-deep-purple/40 font-bold flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Saving your preferences...</span>
                </div>
            )}

            <div className="space-y-12">
                {/* Master Mute Option */}
                <section className="bg-white/40 border border-deep-purple/5 p-6 rounded-3xl backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${prefs.muteAll ? 'bg-orange-50 text-primary-orange' : 'bg-white text-deep-purple/40'}`}>
                                {prefs.muteAll ? <VolumeX size={22} /> : <Volume2 size={22} />}
                            </div>
                            <div>
                                <h5 className="font-bold text-base text-deep-purple">Do Not Disturb</h5>
                                <p className="text-xs text-deep-purple/40 font-medium">Temporarily pause all email and push notifications</p>
                            </div>
                        </div>
                        <button
                            onClick={() => togglePref('muteAll')}
                            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${prefs.muteAll ? 'bg-primary-orange' : 'bg-gray-200'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${prefs.muteAll ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </section>

                <div className={`space-y-10 transition-opacity duration-300 ${prefs.muteAll ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    {/* Email Notifications */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1 flex items-center gap-2">
                            <Mail size={14} /> Email Notification
                        </h3>
                        <div className="space-y-4 max-w-2xl">
                            {/* Option 1 */}
                            <div className="flex items-center justify-between p-5 bg-white/60 border border-deep-purple/5 rounded-2xl hover:bg-white transition-all shadow-sm">
                                <div>
                                    <h6 className="font-bold text-sm text-deep-purple">Booking Confirmations & Invoices</h6>
                                    <p className="text-xs text-deep-purple/40 font-medium mt-0.5">Receive immediate receipt and access links when you book a workshop</p>
                                </div>
                                <button
                                    onClick={() => togglePref('emailBookings')}
                                    className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${prefs.emailBookings ? 'bg-deep-purple' : 'bg-gray-200'}`}
                                >
                                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${prefs.emailBookings ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Option 2 */}
                            <div className="flex items-center justify-between p-5 bg-white/60 border border-deep-purple/5 rounded-2xl hover:bg-white transition-all shadow-sm">
                                <div>
                                    <h6 className="font-bold text-sm text-deep-purple">Workshop & Schedule Updates</h6>
                                    <p className="text-xs text-deep-purple/40 font-medium mt-0.5">Get notified if an instructor changes the date, location, or content of a session</p>
                                </div>
                                <button
                                    onClick={() => togglePref('emailUpdates')}
                                    className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${prefs.emailUpdates ? 'bg-deep-purple' : 'bg-gray-200'}`}
                                >
                                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${prefs.emailUpdates ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Option 3 */}
                            <div className="flex items-center justify-between p-5 bg-white/60 border border-deep-purple/5 rounded-2xl hover:bg-white transition-all shadow-sm">
                                <div>
                                    <h6 className="font-bold text-sm text-deep-purple">Newsletter, Promos & Handcrafted Deals</h6>
                                    <p className="text-xs text-deep-purple/40 font-medium mt-0.5">Exclusive discounts, local trending workshops, and newsletter digests</p>
                                </div>
                                <button
                                    onClick={() => togglePref('emailMarketing')}
                                    className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${prefs.emailMarketing ? 'bg-deep-purple' : 'bg-gray-200'}`}
                                >
                                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${prefs.emailMarketing ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Push Notifications */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-deep-purple/30 mb-6 ml-1 flex items-center gap-2">
                            <Smartphone size={14} /> Push / In-App Alerts
                        </h3>
                        <div className="space-y-4 max-w-2xl">
                            {/* <div className="flex items-center justify-between p-5 bg-white/60 border border-deep-purple/5 rounded-2xl hover:bg-white transition-all shadow-sm">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 text-deep-purple/70">
                                        <MessageSquare size={18} />
                                    </div>
                                    <div>
                                        <h6 className="font-bold text-sm text-deep-purple">Real-Time Messaging Chat Alerts</h6>
                                        <p className="text-xs text-deep-purple/40 font-medium mt-0.5">Instant popup notifications when workshop organizers or hosts send you direct messages</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePref('pushChat')}
                                    className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${prefs.pushChat ? 'bg-deep-purple' : 'bg-gray-200'}`}
                                >
                                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${prefs.pushChat ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div> */}

                            {/* Push Reminders */}
                            <div className="flex items-center justify-between p-5 bg-white/60 border border-deep-purple/5 rounded-2xl hover:bg-white transition-all shadow-sm">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-primary-orange">
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <h6 className="font-bold text-sm text-deep-purple">Upcoming Workshop Reminders</h6>
                                        <p className="text-xs text-deep-purple/40 font-medium mt-0.5">Receive timely alarms and never miss your scheduled slot</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePref('pushReminders')}
                                    className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 flex-shrink-0 ${prefs.pushReminders ? 'bg-deep-purple' : 'bg-gray-200'}`}
                                >
                                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${prefs.pushReminders ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="flex justify-start mt-10">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3.5 bg-deep-purple text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-deep-purple/10 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Notification Preferences'}
                </button>
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

export default NotificationsSettings;
