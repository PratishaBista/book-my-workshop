import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, ArrowRight } from 'lucide-react';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [communityOpen, setCommunityOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);

    // Search states
    const [selectedLocation, setSelectedLocation] = useState('Kathmandu');
    const [locationOpen, setLocationOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');

    const popularCities = [
        'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar',
        'Birgunj', 'Dharan', 'Hetauda', 'Butwal', 'Janakpur'
    ];

    const filteredCities = popularCities.filter(city =>
        city.toLowerCase().includes(locationSearch.toLowerCase())
    );

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    // Get user info from token (decode JWT)
    const getUserInfo = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name || 'User',
                email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email || ''
            };
        } catch {
            return null;
        }
    };

    const userInfo = getUserInfo();

    // if (userInfo) {
    //     console.log('Logged in user:', {
    //         name: userInfo.name,
    //         email: userInfo.email
    //     });
    // }

    // Debug: Log full token payload
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Full JWT payload:', payload);
        } catch (e) {
            console.error('Error decoding token:', e);
        }
    }

    // Get first initial from name
    const getFirstInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        setUserMenuOpen(false);
        navigate('/');
        // window.location.reload(); 
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

    const userMenuItems = isLoggedIn
        ? [
            // { label: 'My Dashboard', link: '/dashboard' },
            // { label: 'My Bookings', link: '/bookings' },
            // { label: 'Saved Workshops', link: '/saved' },
            { label: 'Settings', link: '/settings' },
            { label: 'Log Out', link: '#', onClick: handleLogout }
        ]
        : [
            { label: 'Login / Sign Up', link: '/login' },
            { label: 'Become a Host', link: '/become-host' }
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
                <div className="hidden md:flex items-center gap-16">

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

                    {/* Search Bar - Compact Navbar Version */}
                    <div className="bg-white/60 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-deep-purple/10 hover:border-deep-purple/20 transition-colors">
                        <div className="flex items-center gap-1">

                            {/* Location Selector */}
                            <div className="relative" ref={locationDropdownRef}>
                                <button
                                    onClick={() => setLocationOpen(!locationOpen)}
                                    className="flex items-center gap-1.5 px-3 py-2 border-r border-deep-purple/10 hover:bg-deep-purple/5 transition-colors rounded-l-lg"
                                >
                                    <svg className="w-3.5 h-3.5 text-deep-purple/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-xs font-medium text-deep-purple whitespace-nowrap">{selectedLocation}</span>
                                    <ChevronDown size={12} className={`text-deep-purple/40 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Location Dropdown */}
                                <AnimatePresence>
                                    {locationOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-deep-purple/10 overflow-hidden z-50"
                                        >
                                            {/* Search Input */}
                                            <div className="p-2.5 border-b border-deep-purple/10">
                                                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-cream-base/50 rounded-lg">
                                                    <Search size={13} className="text-deep-purple/30" />
                                                    <input
                                                        type="text"
                                                        value={locationSearch}
                                                        onChange={(e) => setLocationSearch(e.target.value)}
                                                        placeholder="Search city..."
                                                        className="flex-1 bg-transparent outline-none text-xs text-deep-purple placeholder:text-deep-purple/30"
                                                    />
                                                </div>
                                            </div>

                                            {/* Cities List */}
                                            <div className="max-h-56 overflow-y-auto location-dropdown-scroll">
                                                {filteredCities.length > 0 ? (
                                                    filteredCities.map((city) => (
                                                        <button
                                                            key={city}
                                                            onClick={() => {
                                                                setSelectedLocation(city);
                                                                setLocationOpen(false);
                                                                setLocationSearch('');
                                                            }}
                                                            className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${selectedLocation === city
                                                                ? 'bg-primary-orange/10 text-primary-orange font-medium'
                                                                : 'text-deep-purple hover:bg-cream-base'
                                                                }`}
                                                        >
                                                            {city}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-3.5 py-6 text-center text-xs text-deep-purple/40">
                                                        No cities found
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Search Input */}
                            <div className="flex items-center gap-2 px-3">
                                <Search size={14} className="text-deep-purple/30" strokeWidth={1.5} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-32 py-2 bg-transparent outline-none font-sans text-deep-purple placeholder:text-deep-purple/30 text-xs"
                                />
                            </div>

                            {/* Search Button with Arrow */}
                            <button className="bg-deep-purple hover:bg-primary-orange text-white p-2 rounded-lg transition-all duration-300">
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Profile + Hamburger */}
                <div className="flex items-center gap-4">

                    {/* Profile Picture (only when logged in) */}
                    {isLoggedIn && userInfo && (
                        <Link
                            to="/profile"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform text-white font-semibold text-lg"
                            style={{ backgroundColor: '#73A757' }}
                        >
                            {getFirstInitial(userInfo.name)}
                        </Link>
                    )}

                    {/* Hamburger Menu */}
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
                                        item.onClick ? (
                                            <button
                                                key={index}
                                                onClick={item.onClick}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cream-base transition-colors group text-left"
                                            >
                                                <span className="font-sans text-base font-semibold text-[#0E0E0C] transition-colors">
                                                    {item.label}
                                                </span>
                                            </button>
                                        ) : (
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
                                        )
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;