import { useState, useEffect } from 'react';

export interface UserProfile {
    fullName: string;
    email: string;
    role: string;
    initials: string;
}

export const useUserProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name || 'User';
                const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || 'Guest';
                const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email || '';

                const initials = name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                setProfile({
                    fullName: name,
                    email,
                    role,
                    initials
                });
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
    }, []);

    return profile;
};
