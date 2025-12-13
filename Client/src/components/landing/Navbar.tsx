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
            // console.log('Full JWT payload:', payload);
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
                        className="h-20 w-auto object-contain"
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
                        className="px-6 py-2.5 bg-primary-orange text-white font-sans text-sm font-semibold rounded-full hover:bg-primary-orange/90 transition-all active:scale-95"
                    >
                        Become a Host
                    </Link>

                    <div className="flex items-center border border-deep-purple/20 rounded-lg px-4 py-2 bg-white hover:border-deep-purple transition-all duration-300 group focus-within:border-primary-orange focus-within:ring-1 focus-within:ring-primary-orange/20">

                        {/* Location Selector */}
                        <div className="relative border-r border-deep-purple/10 pr-3 mr-3" ref={locationDropdownRef}>
                            <button
                                onClick={() => setLocationOpen(!locationOpen)}
                                className="flex items-center gap-2 text-xs font-semibold text-deep-purple uppercase tracking-wider hover:text-primary-orange transition-colors"
                            >
                                {selectedLocation}
                                <ChevronDown size={14} className={`transition-transform duration-300 ${locationOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {locationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="absolute top-full left-0 mt-4 w-48 bg-white border border-deep-purple/10 shadow-xl rounded-xl overflow-hidden py-2"
                                    >
                                        <div className="px-3 pb-2 mb-2 border-b border-deep-purple/5">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={locationSearch}
                                                onChange={(e) => setLocationSearch(e.target.value)}
                                                placeholder="Find city..."
                                                className="w-full text-xs p-2 bg-cream-base/50 rounded-md outline-none text-deep-purple"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredCities.map((city) => (
                                                <button
                                                    key={city}
                                                    onClick={() => {
                                                        setSelectedLocation(city);
                                                        setLocationOpen(false);
                                                        setLocationSearch('');
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedLocation === city ? 'text-primary-orange font-medium bg-primary-orange/5' : 'text-deep-purple/80 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {city}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Search Input */}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search workshops..."
                                className="w-40 bg-transparent outline-none text-sm font-sans text-deep-purple placeholder:text-deep-purple/40"
                            />
                            <button className="text-deep-purple hover:text-primary-orange transition-colors p-1">
                                <ArrowRight size={18} strokeWidth={2} />
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