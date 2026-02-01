import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, ArrowRight, Palette, ChefHat, Heart, Code, Camera, Music, Briefcase, Languages, Hammer, Baby, Compass, X } from 'lucide-react';
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

    const [exploreOpen, setExploreOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const exploreRef = useRef<HTMLDivElement>(null);

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

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.category);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (e) {
            console.error("error fetching categories", e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNavbarProfile();
        }
        fetchCategories();

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

    // Close explore dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
                setExploreOpen(false);
            }
        };

        if (exploreOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [exploreOpen]);

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

    const categoryIconMap: Record<string, any> = {
        "Art & Craft": Palette,
        "Cooking & Baking": ChefHat,
        "Wellness & Fitness": Heart,
        "Technology & Programming": Code,
        "Photography & Videography": Camera,
        "Music & Dance": Music,
        "Business & Entrepreneurship": Briefcase,
        "Language Learning": Languages,
        "DIY & Home Improvement": Hammer,
        "Kids & Family": Baby,
    };

    const getCategoryIcon = (name: string) => {
        return categoryIconMap[name] || Compass;
    };


    const getLogoLink = () => {
        if (isAdmin) return '/admin';
        if (isProvider) return '/host/dashboard';
        return '/';
    };

    return (
        <nav className="absolute top-0 left-0 right-0 z-50 bg-cream-base/95 backdrop-blur-sm border-b border-deep-purple/5">
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
                        <div className="relative" ref={exploreRef}>
                            <button
                                onClick={() => setExploreOpen(!exploreOpen)}
                                className={`flex items-center gap-2 font-sans text-base font-semibold transition-colors ${exploreOpen ? 'text-primary-orange' : 'text-[#0E0E0C] hover:text-primary-orange'}`}
                            >
                                Explore
                                <motion.div animate={{ rotate: exploreOpen ? 180 : 0 }}>
                                    <ChevronDown size={18} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {exploreOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 mt-4 w-[600px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-deep-purple/5 p-8 z-[60]"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <button
                                                onClick={() => setExploreOpen(false)}
                                                className="p-2 rounded-full transition-colors"
                                            >
                                                <X size={20} className="text-deep-purple/40" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {categories.length > 0 ? (
                                                categories.map((category) => {
                                                    const Icon = getCategoryIcon(category.name);
                                                    return (
                                                        <Link
                                                            key={category.id}
                                                            to={`/explore?category=${encodeURIComponent(category.name)}`}
                                                            onClick={() => setExploreOpen(false)}
                                                            className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                                                        >
                                                            <div className="w-12 h-12 rounded-xl bg-primary-orange/5 flex items-center justify-center text-primary-orange transition-all">
                                                                <Icon size={24} />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-sans font-bold text-[#0E0E0C] text-sm">
                                                                    {category.name}
                                                                </h3>
                                                                <p className="text-xs text-deep-purple/50 line-clamp-1">
                                                                    {category.description}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    );
                                                })
                                            ) : (
                                                <div className="col-span-2 py-8 text-center text-deep-purple/40 font-semibold">
                                                    Loading categories...
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

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
                                        {/* Mobile Search/Explore Links */}
                                        <div className="md:hidden border-b border-deep-purple/5 mb-2 pb-2">
                                            <button
                                                onClick={() => setExploreOpen(!exploreOpen)}
                                                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-cream-base text-left font-semibold"
                                            >
                                                Explore Categories
                                                <ChevronDown size={18} className={`transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {exploreOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden px-4"
                                                    >
                                                        {categories.map((category) => (
                                                            <Link
                                                                key={category.id}
                                                                to={`/explore?category=${encodeURIComponent(category.name)}`}
                                                                onClick={() => {
                                                                    setExploreOpen(false);
                                                                    setUserMenuOpen(false);
                                                                }}
                                                                className="block py-2 text-sm font-medium text-deep-purple/70 hover:text-primary-orange"
                                                            >
                                                                {category.name}
                                                            </Link>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

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