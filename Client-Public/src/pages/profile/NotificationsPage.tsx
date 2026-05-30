import React, { useEffect, useState } from 'react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { Bell, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5242';
            const response = await fetch(`${apiUrl}/api/notification`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5242';
            await fetch(`${apiUrl}/api/notification/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications(); // Refresh list
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5242';
            await fetch(`${apiUrl}/api/notification/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-cream-offwhite">
            <Navbar />
            
            <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-32">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-serif font-bold text-deep-purple">Notifications</h1>
                    
                    {notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-sm font-semibold text-primary-orange hover:text-deep-purple transition-colors flex items-center gap-1"
                        >
                            <Check size={16} /> Mark all as read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-deep-purple" size={32} />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-deep-purple/10">
                        <div className="w-16 h-16 bg-cream-base rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-deep-purple/40" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-deep-purple mb-2">No Notifications Yet</h3>
                        <p className="text-deep-purple/60">You're all caught up! Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={notif.id}
                                className={`bg-white rounded-2xl p-6 border ${notif.isRead ? 'border-deep-purple/10' : 'border-primary-orange shadow-sm'} relative`}
                            >
                                {!notif.isRead && (
                                    <div className="absolute top-6 right-6 w-3 h-3 bg-primary-orange rounded-full"></div>
                                )}
                                <h3 className={`text-lg font-bold ${notif.isRead ? 'text-deep-purple/80' : 'text-deep-purple'} pr-8`}>
                                    {notif.title}
                                </h3>
                                <p className="text-deep-purple/70 mt-2 whitespace-pre-wrap">{notif.message}</p>
                                
                                <div className="mt-4 flex items-center justify-between text-xs text-deep-purple/50 font-medium">
                                    <span>{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}</span>
                                    
                                    {!notif.isRead && (
                                        <button 
                                            onClick={() => markAsRead(notif.id)}
                                            className="text-primary-orange hover:underline font-semibold"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default NotificationsPage;
