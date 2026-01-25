import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingHost } from './components/OnboardingHost';
import { API_ENDPOINTS } from '../../config/api';
import type { ProviderProfile } from '../../types/host';

export const HostOnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ProviderProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch(API_ENDPOINTS.provider.profile, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <OnboardingHost
            profile={profile}
            onComplete={() => navigate('/dashboard')}
        />
    );
};
