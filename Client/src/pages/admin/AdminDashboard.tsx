import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { Overview } from './views/Overview';
import { PendingProviders } from './views/PendingProviders';
import { PendingWorkshops } from './views/PendingWorkshops';
import { UsersView } from './views/AllUsers';
import type { AdminTab } from '../../types/admin';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/admin/pxvywv'); return; }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
            if (roles !== 'Admin') navigate('/');
        } catch { navigate('/admin/pxvywv'); }
    }, [navigate]);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <Overview />;
            case 'providers': return <PendingProviders />;
            case 'workshops': return <PendingWorkshops />;
            case 'users': return <UsersView />;
            default: return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <p>Module under development</p>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#FDFBF7] font-sans text-slate-800 overflow-hidden">
            <AdminHeader />

            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

                <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 relative">
                    <div className="max-w-7xl mx-auto h-full">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
