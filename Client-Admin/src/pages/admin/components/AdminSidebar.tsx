import React from 'react';
import {
    LayoutGrid, Users, BookOpen, Settings,
    PanelLeftClose, PanelLeftOpen, Activity, MessageSquareWarning
} from 'lucide-react';
import type { AdminTab } from '../../../types/admin';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { type: 'divider', label: 'Verification' },
        { id: 'providers', label: 'Pending Hosts', icon: Users },
        { id: 'workshops', label: 'Pending Workshops', icon: BookOpen },
        { type: 'divider', label: 'Management' },
        { id: 'live_workshops', label: 'Live Marketplace', icon: Activity },
        { id: 'reviews', label: 'Reviews', icon: MessageSquareWarning },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'categories', label: 'Categories', icon: BookOpen },
        { type: 'divider', label: 'System' },
    ];

    return (
        <aside
            className={`${isOpen ? 'w-64' : 'w-20'} bg-[#000000] border-r border-[#1A1A1A] transition-all duration-300 ease-in-out flex flex-col z-30 h-[calc(100vh-80px)]`}
        >
            <nav className="flex-1 w-full px-3 py-6 space-y-1.5 flex flex-col items-center scrollbar-hide overflow-y-auto">
                {navItems.map((item: any, idx) => (
                    item.type === 'divider' ? (
                        isOpen && (
                            <div key={idx} className="w-full text-[10px] text-slate-500 uppercase font-bold tracking-widest px-4 mt-6 mb-2">
                                {item.label}
                            </div>
                        )
                    ) : (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center transition-all ${isOpen
                                ? 'w-full px-4 justify-start py-2.5 rounded-xl'
                                : 'w-10 h-10 justify-center rounded-xl'
                                } ${activeTab === item.id
                                    ? 'bg-[#1A1A1A] text-white shadow-sm font-bold'
                                    : 'text-slate-400 hover:text-white hover:bg-[#111111]'
                                }`}
                            title={!isOpen ? item.label : ''}
                        >
                            <item.icon size={18} className={`${activeTab === item.id ? 'text-[#8183ff]' : ''} flex-shrink-0`} />

                            <span className={`ml-3 text-sm whitespace-nowrap overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                ))}
            </nav>

            <div className={`mt-auto w-full px-3 py-4 border-t border-[#1A1A1A] flex ${isOpen ? 'justify-end pr-4' : 'justify-center'}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                >
                    {isOpen ? (
                        <PanelLeftClose size={18} />
                    ) : (
                        <PanelLeftOpen size={18} />
                    )}
                </button>
            </div>
        </aside>
    );
};
