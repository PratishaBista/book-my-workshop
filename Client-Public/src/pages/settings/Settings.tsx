import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import {
    ChevronRight
} from 'lucide-react';
import Navbar from '../../components/landing/Navbar';

import EditProfile from './EditProfile';
import InterestsSettings from './InterestsSettings';
import AccountSettings from './AccountSettings';
import PlaceholderSection from './PlaceholderSection';

const Settings: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Edit profile', path: '/settings/edit-profile' },
        { label: 'Your interests', path: '/settings/interests' },
        { label: 'Account management', path: '/settings/account' },
        { label: 'Profile visibility', path: '/settings/visibility' },
        { label: 'Notifications', path: '/settings/notifications' },
        { label: 'Privacy and data', path: '/settings/privacy' },
        { label: 'Security', path: '/settings/security' },
    ];

    const handleSave = () => {
        window.dispatchEvent(new CustomEvent('settings-save'));
    };

    const handleReset = () => {
        window.dispatchEvent(new CustomEvent('settings-reset'));
    };

    return (
        <div className="min-h-screen bg-cream-base flex flex-col font-sans text-deep-purple">
            <Navbar minimal={true} />

            <div className="h-28" />

            <div className="flex flex-1 pb-32">
                <div className="w-full max-w-7xl mx-auto flex px-4 md:px-8 gap-12">

                    <aside className="w-64 flex-shrink-0 sticky top-32 h-fit">
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`px-4 py-2 rounded-xl transition-all ${isActive
                                            ? 'bg-deep-purple text-white shadow-lg'
                                            : 'text-deep-purple/60 hover:bg-white hover:text-deep-purple'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{item.label}</span>
                                            {isActive && <ChevronRight size={16} />}
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <main className="flex-1">
                        <AnimatePresence mode="wait">
                            <Routes location={location} key={location.pathname}>
                                <Route path="/" element={<Navigate to="edit-profile" replace />} />
                                <Route path="edit-profile" element={<EditProfile />} />
                                <Route path="interests" element={<InterestsSettings />} />
                                <Route path="account" element={<AccountSettings />} />
                                <Route path="visibility" element={<PlaceholderSection title="Profile Visibility" desc="Control who can see your profile and workshops." />} />
                                <Route path="notifications" element={<PlaceholderSection title="Notifications" desc="Choose which notifications you want to receive." />} />
                                <Route path="privacy" element={<PlaceholderSection title="Privacy and Data" desc="Manage your data and privacy preferences." />} />
                                <Route path="security" element={<PlaceholderSection title="Security" desc="Secure your account with multi-factor authentication." />} />
                            </Routes>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            <footer className="fixed bottom-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-md flex items-center justify-center border-t border-deep-purple/5 z-50">
                <div className="flex gap-4">
                    <button
                        className="px-8 py-3 bg-gray-100 text-deep-purple font-bold rounded-full hover:bg-gray-200 transition-colors"
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                    <button
                        className="px-8 py-3 bg-deep-purple text-white font-bold rounded-full hover:shadow-lg transition-all active:scale-95"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Settings;
