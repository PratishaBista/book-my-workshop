import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, ArrowRight } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
    minimal?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ minimal = false }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    // Derived state from context
    const isCustomer = user?.role === 'User';
    const isProvider = user?.role === 'Provider';
    const isAdmin = user?.role === 'Admin';

    const [communityOpen, setCommunityOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);

    const [selectedLocation, setSelectedLocation] = useState('Kathmandu');
    const [locationOpen, setLocationOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);

    const fetchNavbarProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(API_ENDPOINTS.profile.get, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfilePic(data.profilePictureUrl);
                setUsername(data.profileUsername);
                setFullName(data.fullName);
            }
        } catch (e) {
            console.error("error fetching navbar profile", e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNavbarProfile();
        }

        const handleUpdate = () => fetchNavbarProfile();
        window.addEventListener('profile-updated', handleUpdate);
        return () => window.removeEventListener('profile-updated', handleUpdate);
    }, [isAuthenticated]);

    const popularCities = [
        'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar',
        'Birgunj', 'Dharan', 'Hetauda', 'Butwal', 'Janakpur'
    ];

    const filteredCities = popularCities.filter(city =>
        city.toLowerCase().includes(locationSearch.toLowerCase())
    );

    // Get first initial from name
    const getFirstInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

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

    // Close location dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
                setLocationOpen(false);
            }
        };

        if (locationOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [locationOpen]);

    const communityItems = [
        { label: 'Our Impact', color: '#73A757' },
        { label: 'Help Center', color: '#0E0E0C' },
        { label: 'Contact Us', color: '#AF82C5' }
    ];


    const getLogoLink = () => {
        if (isAdmin) return '/admin';
        if (isProvider) return '/host/dashboard';
        return '/';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-base/95 backdrop-blur-sm border-b border-deep-purple/5">
            <div className="px-8 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link to={getLogoLink()} className="z-50">
                    <motion.img
                        layoutId="brand-logo"
                        src="/Badge.svg"
                        alt="Book My Workshop"
                        className="h-20 w-auto object-contain"
                    />
                </Link>

                {!minimal && (
                    <div className="hidden md:flex items-center gap-16">
                        <Link
                            to="/explore"
                            className="font-sans text-base font-semibold text-[#0E0E0C] hover:text-primary-orange transition-colors"
                        >
                            Explore
                        </Link>

                        <div
                            className="relative"
                            onMouseEnter={() => setCommunityOpen(true)}
                            onMouseLeave={() => setCommunityOpen(false)}
                        >
                            <button className="flex items-center gap-2 font-sans text-base font-semibold text-[#0E0E0C]">
                                About Us
                                <motion.div animate={{ rotate: communityOpen ? 180 : 0 }}>
                                    <ChevronDown size={18} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {communityOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 mt-4 w-56 bg-cream-offwhite rounded-2xl shadow-xl border border-deep-purple/10 py-3 px-2"
                                    >
                                        {communityItems.map((item, index) => (
                                            <Link
                                                key={index}
                                                to={`/${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg group"
                                            >
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="font-sans text-base font-semibold text-[#0E0E0C] group-hover:text-gray-500">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center gap-6">
                        {!minimal && (
                            <Link
                                to="/host-workshop"
                                className="px-6 py-2.5 bg-primary-orange text-white font-sans text-sm font-semibold rounded-full hover:bg-primary-orange/90 transition-all active:scale-95"
                            >
                                Become a Host
                            </Link>
                        )}

                        <div className={`flex items-center border rounded-lg px-4 py-2 transition-all duration-300 ${minimal ? 'bg-[#efefef] border-transparent w-[30rem]' : 'bg-white border-deep-purple/20'
                            }`}>
                            <div className="relative border-r border-deep-purple/10 pr-3 mr-3" ref={locationDropdownRef}>
                                <button onClick={() => setLocationOpen(!locationOpen)} className="flex items-center gap-2 text-xs font-semibold text-deep-purple uppercase tracking-wider">
                                    {selectedLocation}
                                    <ChevronDown size={14} />
                                </button>
                                <AnimatePresence>
                                    {locationOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-4 w-48 bg-white border border-deep-purple/10 shadow-xl rounded-xl overflow-hidden py-2"
                                        >
                                            <div className="px-3 pb-2 mb-2 border-b border-deep-purple/5">
                                                <input
                                                    type="text"
                                                    value={locationSearch}
                                                    onChange={(e) => setLocationSearch(e.target.value)}
                                                    placeholder="Find city..."
                                                    className="w-full text-xs p-2 bg-cream-base/50 rounded-md outline-none"
                                                />
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                {filteredCities.map((city) => (
                                                    <button key={city} onClick={() => { setSelectedLocation(city); setLocationOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-deep-purple">
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <input type="text" placeholder="Search workshops..." className="w-full bg-transparent outline-none text-sm font-sans text-deep-purple placeholder:text-deep-purple/40" />
                                <ArrowRight size={18} className="text-deep-purple" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        {isAuthenticated && user && isCustomer && (
                            <Link
                                to={username ? `/u/${username}` : '/settings/edit-profile'}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden bg-primary-orange/10 group cursor-pointer ring-2 ring-transparent hover:ring-primary-orange/50 transition-all"
                            >
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#73A757]">
                                        {getFirstInitial(fullName || user.name)}
                                    </div>
                                )}
                            </Link>
                        )}


                        <div className="relative" ref={userMenuRef}>
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 hover:bg-deep-purple/5 rounded-lg transition-colors">
                                <Menu size={24} className="text-deep-purple" />
                            </button>
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="absolute top-full right-0 mt-4 w-64 bg-cream-offwhite rounded-2xl shadow-xl border border-deep-purple/10 py-3 px-2"
                                    >
                                        {isAuthenticated && isCustomer ? (
                                            <>
                                                <Link to={username ? `/u/${username}` : '/settings/edit-profile'} onClick={() => setUserMenuOpen(false)} className="w-full block px-4 py-3 rounded-lg hover:bg-cream-base text-left font-semibold">
                                                    My Profile
                                                </Link>
                                                <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="w-full block px-4 py-3 rounded-lg hover:bg-cream-base text-left font-semibold">
                                                    Settings
                                                </Link>

                                                <button onClick={handleLogout} className="w-full block px-4 py-3 rounded-lg hover:bg-cream-base text-left font-semibold text-red-500">
                                                    Log Out
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/login"
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        // If a Host/Admin is viewing this (isAuthenticated=true but falls into this block),
                                                        // force clear their session so they can actually access the login page
                                                        // without being redirected back to their dashboard.
                                                        if (isAuthenticated) {
                                                            logout();
                                                        }
                                                    }}
                                                    className="w-full block px-4 py-3 rounded-lg hover:bg-cream-base text-left font-semibold"
                                                >
                                                    Login / Sign Up
                                                </Link>
                                                <Link to="/host-workshop" onClick={() => setUserMenuOpen(false)} className="w-full block px-4 py-3 rounded-lg hover:bg-cream-base text-left font-semibold">
                                                    Become a Host
                                                </Link>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;