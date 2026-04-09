import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { Overview } from './views/Overview';
import { PendingProviders } from './views/PendingProviders';
import { PendingWorkshops } from './views/PendingWorkshops';
import { UsersView } from './views/AllUsers';
import { CategoriesView } from './views/CategoriesView';
import { LiveWorkshops } from './views/LiveWorkshops';
import type { AdminTab } from '../../types/admin';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
            if (roles !== 'Admin') navigate('/');
        } catch { navigate('/login'); }
    }, [navigate]);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <Overview />;
            case 'providers': return <PendingProviders />;
            case 'workshops': return <PendingWorkshops />;
            case 'live_workshops': return <LiveWorkshops />;
            case 'users': return <UsersView />;
            case 'categories': return <CategoriesView />;
            default: return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <p>Module under development</p>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#050505] font-sans text-slate-100 overflow-hidden">
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

                <main className="flex-1 overflow-y-auto p-8 bg-[#050505] relative">
                    <div className="max-w-7xl mx-auto h-full">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
