import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';

const HostDashboardNavbar: React.FC = () => {
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const token = localStorage.getItem('token');
    const getUserInfo = () => {
        if (!token) return null;
        try {
            const parts = token.split('.');
            if (parts.length < 2) return null;

            const payload = JSON.parse(atob(parts[1]));
            return {
                name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name || 'Host',
                email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email || ''
            };
        } catch {
            return null;
        }
    };
    const userInfo = getUserInfo();

    const getFirstInitial = (name: string) => name.charAt(0).toUpperCase();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
            <div className="px-8 py-3 flex items-center justify-between">

                <Link to="/host/dashboard" className="flex items-center gap-2">
                    <img
                        src="/Badge.svg"
                        alt="Book My Workshop"
                        className="h-10 w-auto object-contain"
                    />
                    <span className="font-serif text-lg font-bold text-deep-purple hidden md:block">
                        Host
                    </span>
                </Link>

                <div className="flex items-center gap-6">

                    <Link to="/host/help" className="text-sm font-medium text-gray-500 hover:text-primary-orange transition-colors hidden md:block">
                        Help
                    </Link>

                    {/* Profile Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                        >
                            <span className="text-sm font-semibold text-deep-purple hidden md:block">
                                {userInfo?.name}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-deep-purple text-white flex items-center justify-center text-sm font-medium">
                                {userInfo ? getFirstInitial(userInfo.name) : 'H'}
                            </div>
                        </button>

                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2"
                                >
                                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                                        <p className="text-sm font-bold text-gray-800">{userInfo?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{userInfo?.email}</p>
                                    </div>

                                    <Link to="/host/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-deep-purple transition-colors">
                                        <User size={16} />
                                        Profile
                                    </Link>
                                    <Link to="/host/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-deep-purple transition-colors">
                                        <Settings size={16} />
                                        Settings
                                    </Link>

                                    <div className="h-px bg-gray-50 my-2"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut size={16} />
                                        Log Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default HostDashboardNavbar;
