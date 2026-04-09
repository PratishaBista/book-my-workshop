import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Percent,
    Wallet,
    LogOut,
    BookOpen,
    History
} from 'lucide-react';

const navItems = [
    { to: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/journal', label: 'The Journal', icon: BookOpen },
    { to: '/dashboard/transactions', label: 'Financial Ledger', icon: History },
    { to: '/dashboard/commission', label: 'Commission', icon: Percent },
    { to: '/dashboard/payouts', label: 'Host Payouts', icon: Wallet },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('superadmin_token');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#0d0614] text-white">
            {/* Sidebar */}
            <aside className="w-56 flex flex-col py-10 px-6 shrink-0">
                <div className="mb-10">
                    <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Super Admin</p>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${isActive
                                    ? 'text-white bg-white/5'
                                    : 'text-white/40 hover:text-white/70'
                                }`
                            }
                        >
                            <Icon size={15} strokeWidth={1.8} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                    <LogOut size={15} strokeWidth={1.8} />
                    Sign out
                </button>
            </aside>

            {/* Divider */}
            <div className="w-px bg-white/5" />

            {/* Main */}
            <main className="flex-1 px-12 py-10 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
