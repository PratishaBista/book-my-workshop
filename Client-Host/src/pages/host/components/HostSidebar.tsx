import React from 'react';
import {
    LayoutGrid, BookOpen, Calendar, DollarSign,
    MessageCircle, User, HelpCircle, Settings,
    PanelLeftClose, PanelLeftOpen, ShieldCheck
} from 'lucide-react';
import type { HostTab } from '../../../types/host';

interface HostSidebarProps {
    activeTab: HostTab;
    setActiveTab: (tab: HostTab) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const HostSidebar: React.FC<HostSidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
        { type: 'divider', label: 'My Business' },
        { id: 'workshops', label: 'My Workshops', icon: BookOpen },
        { id: 'schedules', label: 'Schedules', icon: Calendar },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
        { type: 'divider', label: 'Community' },
        { id: 'reviews', label: 'Reviews', icon: MessageCircle },
        { type: 'divider', label: 'Preferences' },
        { id: 'profile', label: 'Business Profile', icon: User },
        { id: 'verification', label: 'Security & Verification', icon: ShieldCheck },
        { id: 'support', label: 'Support', icon: HelpCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside
            className={`${isOpen ? 'w-64' : 'w-20'} bg-deep-purple transition-all duration-300 ease-in-out flex flex-col shadow-inner z-30 h-[calc(100vh-80px)]`}
        >
            <nav className="flex-1 w-full px-3 py-6 space-y-1.5 flex flex-col items-center custom-scrollbar overflow-y-auto">
                {navItems.map((item: any, idx) => (
                    item.type === 'divider' ? (
                        isOpen && (
                            <div key={idx} className="w-full text-[10px] text-white/40 uppercase font-bold tracking-widest px-4 mt-6 mb-2 animate-in fade-in slide-in-from-left-2">
                                {item.label}
                            </div>
                        )
                    ) : (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center transition-all ${isOpen
                                ? 'w-full px-4 justify-start py-2.5 rounded-lg'
                                : 'w-10 h-10 justify-center rounded-lg'
                                } ${activeTab === item.id
                                    ? 'bg-primary-orange text-white shadow-lg font-bold'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                            title={!isOpen ? item.label : ''}
                        >
                            <item.icon size={20} className="flex-shrink-0" />

                            <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                ))}
            </nav>

            <div className={`mt-auto w-full px-3 py-4 border-t border-white/10 flex ${isOpen ? 'justify-end pr-4' : 'justify-center'}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-white/40 hover:text-white transition-colors focus:outline-none"
                >
                    {isOpen ? (
                        <PanelLeftClose size={20} />
                    ) : (
                        <PanelLeftOpen size={20} />
                    )}
                </button>
            </div>
        </aside>
    );
};
