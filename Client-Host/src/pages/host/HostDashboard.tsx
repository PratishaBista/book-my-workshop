import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HostHeader } from './components/HostHeader';
import { HostSidebar } from './components/HostSidebar';
import { HostOverview } from './views/HostOverview';
import { MyWorkshops } from './views/MyWorkshops';
import { ScheduleManagement } from './views/ScheduleManagement';
import { BusinessProfile } from './views/BusinessProfile';
import { Earnings } from './views/Earnings';
import { VerificationCenter } from './views/VerificationCenter';
import { PlaceholderView } from './views/PlaceholderView';
import type { HostTab, ProviderProfile } from '../../types/host';
import { ProviderStatus } from '../../types/host';


import { API_ENDPOINTS } from '../../config/api';

const HostDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = new URLSearchParams(location.search).get('tab') as HostTab;
    const [activeTab, setActiveTab] = useState<HostTab>(initialTab || 'overview');

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab') as HostTab;
        if (tab) setActiveTab(tab);
    }, [location.search]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [profile, setProfile] = useState<ProviderProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Auth & Permission Check
    useEffect(() => {
        const checkAuthAndFetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const rawRoles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;

                // Handle both single string and array of roles
                const userRoles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

                if (!userRoles.includes('Provider') && !userRoles.includes('Admin')) {
                    navigate('/');
                    return;
                }

                const response = await fetch(`${API_ENDPOINTS.provider.profile}?_t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("DEBUG: Profile Loaded", {
                        status: data.status,
                        isApproved: data.isApproved,
                        typeOfStatus: typeof data.status
                    });
                    setProfile(data);
                    localStorage.setItem('isApproved', (data.isApproved || data.status === 2).toString());
                } else if (response.status === 403) {
                    console.error("Access Forbidden: Your session might be outdated.");
                    localStorage.removeItem('token');
                    navigate('/login?error=session_outdated');
                } else if (response.status === 404) {
                    console.error("Provider profile not found.");
                    navigate('/');
                } else {
                    console.error("Dashboard fetch failed:", response.status);
                    navigate('/login');
                }
            } catch (err) {
                console.error("Dashboard auth/fetch failed:", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchProfile();
    }, [navigate]);

    const renderContent = () => {
        if (!profile) return null;

        const isApproved = profile.isApproved || profile.status === ProviderStatus.Approved;
        console.log("DEBUG: Final isApproved for render:", isApproved);

        switch (activeTab) {
            case 'overview': return (
                <HostOverview
                    status={profile.status}
                    onStartOnboarding={() => setActiveTab('profile')}
                    onStartVerification={() => setActiveTab('verification')}
                />
            );
            case 'workshops': return <MyWorkshops isApproved={isApproved} />;
            case 'schedules': return <ScheduleManagement />;
            case 'bookings':
                return <PlaceholderView
                    title="Participant Bookings"
                    description="Keep track of everyone joining your workshops. You'll be able to mark attendance and manage groups here."
                />;
            case 'earnings':
                return <Earnings />;
            case 'reviews':
                return <PlaceholderView
                    title="Student Reviews"
                    description="See what your participants are saying. Respond to feedback and build your reputation as a top artisan."
                />;
            case 'profile':
                return <BusinessProfile profile={profile} onUpdate={(updated) => setProfile(updated)} />;
            case 'verification':
                return <VerificationCenter profile={profile} onUpdate={(updated) => setProfile(updated)} />;
            case 'support':
                return <PlaceholderView
                    title="Host Support"
                    description="Need help? Raise a ticket or chat with our community managers to optimize your workshop business."
                />;
            case 'settings':
                return <PlaceholderView
                    title="Account Settings"
                    description="Manage your notification preferences, security settings, and shared platform credentials."
                />;
            default: return (
                <HostOverview
                    status={profile.status}
                    onStartOnboarding={() => setActiveTab('profile')}
                />
            );
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-cream-base flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-cream-base font-sans text-deep-purple overflow-hidden border-none shadow-none">
            <HostHeader />

            <div className="flex flex-1 overflow-hidden">
                <HostSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative scrollbar-hide">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl -z-10 -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-deep-purple/5 rounded-full blur-3xl -z-10 -ml-48 -mb-48" />

                    <div className="max-w-7xl mx-auto h-full">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HostDashboard;
