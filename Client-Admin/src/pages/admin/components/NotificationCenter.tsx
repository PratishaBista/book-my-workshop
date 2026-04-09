import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, Info, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications, type AppNotification } from '../../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Success': return <CheckCircle className="text-emerald-500" size={16} />;
            case 'Warning': return <AlertTriangle className="text-amber-500" size={16} />;
            case 'Alert': return <ShieldAlert className="text-red-500" size={16} />;
            default: return <Info className="text-blue-500" size={16} />;
        }
    };

    const handleNotificationClick = (n: AppNotification) => {
        if (!n.isRead) markAsRead(n.id);
        if (n.actionUrl) {
            navigate(n.actionUrl);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 transition-all rounded-full ${
                    isOpen ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
                }`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                    >
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-700 text-sm">System Alerts</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    <Check size={12} /> Clear all
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell size={20} className="text-slate-300" />
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">No new alerts</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-indigo-50/20' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1">
                                                    {getTypeIcon(n.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-xs font-bold ${!n.isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                                                            {n.title}
                                                        </h4>
                                                        <span className="text-[9px] text-slate-400 font-medium pt-0.5">
                                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    {n.actionUrl && (
                                                        <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Take Action <ExternalLink size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {!n.isRead && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
                                View all logs
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
