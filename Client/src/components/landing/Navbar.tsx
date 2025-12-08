import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
    const [communityOpen, setCommunityOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const isLoggedIn = false; // TODO: Replace with actual auth state

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    const communityItems = [
        { label: 'Our Impact', color: '#73A757' },
        { label: 'Help Center', color: '#0E0E0C' },
        { label: 'Contact Us', color: '#AF82C5' }
    ];

    const userMenuItems = isLoggedIn
        ? [
            { label: 'My Dashboard', color: '#73A757', link: '/dashboard' },
            { label: 'My Bookings', color: '#0E0E0C', link: '/bookings' },
            { label: 'Saved Workshops', color: '#AF82C5', link: '/saved' },
            { label: 'Settings', color: '#73A757', link: '/settings' },
            { label: 'Log Out', color: '#0E0E0C', link: '/logout' }
        ]
        : [
            { label: 'Login / Sign Up', color: '#73A757', link: '/login' },
            { label: 'Become a Host', color: '#AF82C5', link: '/become-host' }
        ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-base/95 backdrop-blur-sm border-b border-deep-purple/5">
            <div className="px-8 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="z-50">
                    <motion.img
                        layoutId="brand-logo"
                        src="/Badge.svg"
                        alt="Book My Workshop"
                        className="h-28 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-12">

                    {/* Explore Link */}
                    <Link
                        to="/explore"
                        className="font-sans text-base font-semibold text-[#0E0E0C] hover:text-primary-orange transition-colors"
                    >
                        Explore
                    </Link>

                    {/* Community Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setCommunityOpen(true)}
                        onMouseLeave={() => setCommunityOpen(false)}
                    >
                        <button className="flex items-center gap-2 font-sans text-base font-semibold text-[#0E0E0C]">
                            Community
                            <motion.div
                                animate={{ rotate: communityOpen ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown size={18} />
                            </motion.div>
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {communityOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 mt-4 w-56 bg-cream-offwhite rounded-2xl shadow-xl border border-deep-purple/10 py-3 px-2"
                                >
                                    {communityItems.map((item, index) => (
                                        <Link
                                            key={index}
                                            to={`/${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg group"
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full transition-all group-hover:scale-75"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="font-sans text-base font-semibold text-[#0E0E0C] group-hover:text-gray-500">
                                                {item.label}
                                            </span>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Become a Host Button */}
                    <Link
                        to="/become-host"
                        className="px-6 py-2.5 bg-primary-orange text-white font-sans text-sm font-semibold rounded-full hover:bg-primary-orange/90 transition-all hover:scale-105 active:scale-95"
                    >
                        Become a Host
                    </Link>
                </div>

                {/* User Menu (Hamburger) */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="p-2 hover:bg-deep-purple/5 rounded-lg transition-colors"
                    >
                        <Menu size={24} className="text-deep-purple" />
                    </button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="absolute top-full right-0 mt-4 w-64 bg-cream-offwhite rounded-2xl shadow-xl border border-deep-purple/10 py-3 px-2"
                            >
                                {userMenuItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.link}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cream-base transition-colors group text-left"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <span className="font-sans text-base font-semibold text-[#0E0E0C] transition-colors">
                                            {item.label}
                                        </span>
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;