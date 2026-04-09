import { useState, useEffect, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_ENDPOINTS } from '../config/api';

export interface AppNotification {
    id: number;
    title: string;
    message: string;
    type: 'Info' | 'Success' | 'Warning' | 'Alert';
    actionUrl?: string;
    createdAt: string;
    isRead: boolean;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(API_ENDPOINTS.notifications.base, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: AppNotification) => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        const token = localStorage.getItem('token');
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(API_ENDPOINTS.hubs.notifications, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);
    }, [fetchNotifications]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected to Notification Hub');
                    connection.on('ReceiveNotification', (notification: AppNotification) => {
                        setNotifications(prev => [notification, ...prev]);
                        setUnreadCount(prev => prev + 1);
                        
                        // Play a subtle notification sound if needed
                    });
                })
                .catch(err => console.error('SignalR Connection Error: ', err));

            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    const markAsRead = async (id: number) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(API_ENDPOINTS.notifications.read(id), {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNotifications(prev => 
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(API_ENDPOINTS.notifications.readAll, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    };
};
