import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, MapPin, Palette, ChefHat, Heart, Code, Camera, Music, Briefcase, Languages, Hammer, Baby, Compass } from 'lucide-react';
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

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);

    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [locationOpen, setLocationOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);

    const [exploreOpen, setExploreOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const exploreRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

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
        'All Locations', 'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar',
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

    // Live Search effect
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            try {
                const url = API_ENDPOINTS.workshop.search(searchQuery, selectedLocation);
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                }
            } catch (e) {
                console.error("error fetching search results", e);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSearchResults();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedLocation]);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        };

        if (searchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchOpen]);


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
                    <div className="hidden md:flex items-center gap-12">
                        {/* Primary Navigation Links */}
                        <div className="flex items-center gap-10">
                            <Link
                                to="/workshops"
                                className="font-sans text-sm font-bold text-[#0E0E0C] transition-colors tracking-tight"
                            >
                                Workshops
                            </Link>
                            <Link
                                to="/gift-cards"
                                className="font-sans text-sm font-bold text-[#0E0E0C] transition-colors tracking-tight"
                            >
                                Gift Cards
                            </Link>
                            <Link
                                to="/articles"
                                className="font-sans text-sm font-bold text-[#0E0E0C] transition-colors tracking-tight"
                            >
                                Stories
                            </Link>
                            <Link
                                to="/about"
                                className="font-sans text-sm font-bold text-[#0E0E0C] transition-colors tracking-tight"
                            >
                                About
                            </Link>
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

                        {/* 1. Location Picker (Outside, to the Left) */}
                        <div className="relative flex items-center gap-3 cursor-pointer pr-4" ref={locationDropdownRef}>
                            <button onClick={() => setLocationOpen(!locationOpen)} className="flex items-center gap-2">
                                <MapPin size={20} className="text-black/40" />
                                <span className="text-[15px] font-bold text-black/80 whitespace-nowrap">{selectedLocation}</span>
                            </button>
                            <AnimatePresence>
                                {locationOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full -left-2 mt-5 w-48 bg-white border border-deep-purple/10 shadow-2xl rounded-2xl overflow-hidden py-0.5 z-[70]"
                                    >
                                        <div className="px-3 pb-2 mb-2 border-b border-deep-purple/5">
                                            <input
                                                type="text"
                                                value={locationSearch}
                                                onChange={(e) => setLocationSearch(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const cityToSelect = filteredCities.length > 0 ? filteredCities[0] : locationSearch;
                                                        setSelectedLocation(cityToSelect);
                                                        setLocationOpen(false);
                                                    }
                                                }}
                                                placeholder="Find city"
                                                className="w-full text-xs p-3 bg-cream-base/50 rounded-xl outline-none focus:bg-cream-base transition-colors"
                                            />
                                        </div>
                                        <div className="max-h-[70vh] overflow-y-auto hide-scrollbar">
                                            {filteredCities.map((city) => (
                                                <button key={city} onClick={() => { setSelectedLocation(city); setLocationOpen(false); }} className="w-full text-left px-5 py-2 text-[13px] font-bold text-deep-purple hover:bg-cream-base hover:text-primary-orange transition-all">
                                                    {city}
                                                </button>
                                            ))}
                                            {filteredCities.length === 0 && locationSearch.trim() && (
                                                <button
                                                    onClick={() => { setSelectedLocation(locationSearch); setLocationOpen(false); }}
                                                    className="w-full text-left px-5 py-3 text-[13px] font-bold text-primary-orange bg-primary-orange/5 hover:bg-primary-orange/10 transition-all border-t border-primary-orange/10"
                                                >
                                                    Search in "{locationSearch}"
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 2. Wide Search Bar */}
                        <div className="flex-1 flex items-center border rounded-xl px-5 py-3 transition-all duration-300 bg-[#FAF8E7] border-black/5 focus-within:border-black/20 shadow-sm max-w-4xl">
                            <div className="relative flex items-center gap-3 flex-1" ref={searchRef}>
                                <Search size={20} className="text-black/40" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSearchOpen(true);
                                    }}
                                    onFocus={() => {
                                        if (searchQuery.trim()) setSearchOpen(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchQuery.trim()) {
                                            setSearchOpen(false);
                                            navigate(`/search?q=${encodeURIComponent(searchQuery)}${selectedLocation !== 'All Locations' ? `&loc=${encodeURIComponent(selectedLocation)}` : ''}`);
                                        }
                                    }}
                                    className="w-full bg-transparent outline-none text-[15px] font-sans text-black placeholder:text-black/30 font-medium"
                                />

                                <AnimatePresence>
                                    {searchOpen && searchQuery.trim() && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-5 w-full max-w-[500px] bg-white border border-deep-purple/10 shadow-2xl rounded-2xl overflow-hidden py-4 z-[60]"
                                        >
                                            {/* Categories Match */}
                                            {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                                                <div className="mb-4">
                                                    <div className="px-4 text-[10px] font-bold text-deep-purple/50 uppercase tracking-widest mb-2">
                                                        Topics
                                                    </div>
                                                    {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(category => (
                                                        <Link
                                                            key={category.id}
                                                            to={`/workshops?category=${encodeURIComponent(category.name)}`}
                                                            onClick={() => setSearchOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-2 hover:bg-cream-base transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-[#D94F80]/10 flex items-center justify-center text-[#D94F80]">
                                                                {React.createElement(getCategoryIcon(category.name), { size: 16 })}
                                                            </div>
                                                            <div className="text-sm font-bold text-deep-purple uppercase tracking-wider">
                                                                {category.name} <span className="text-deep-purple/40 font-normal">CLASSES</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Workshop Results */}
                                            <div>
                                                <div className="px-4 text-[10px] font-bold text-deep-purple/50 uppercase tracking-widest mb-2 border-t border-deep-purple/5 pt-3">
                                                    In-Person Classes (Top Results)
                                                </div>

                                                {isSearching ? (
                                                    <div className="px-4 py-6 text-center text-sm text-deep-purple/50 font-semibold">
                                                        Searching...
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    <>
                                                        {searchResults.slice(0, 4).map(workshop => (
                                                            <Link
                                                                key={workshop.id}
                                                                to={`/workshop/${workshop.slug}`}
                                                                onClick={() => setSearchOpen(false)}
                                                                className="flex gap-4 px-4 py-3 hover:bg-cream-base transition-colors group"
                                                            >
                                                                <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                                                    {workshop.media && workshop.media.length > 0 ? (
                                                                        <img src={workshop.media[0].fileUrl} alt={workshop.title} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-primary-orange/10 flex items-center justify-center text-primary-orange/50">
                                                                            <Camera size={16} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-xs font-bold text-deep-purple uppercase tracking-wider mb-1 line-clamp-1 group-hover:text-primary-orange transition-colors">
                                                                        {workshop.title}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-xs text-deep-purple/60">
                                                                        <span className="font-bold text-[#D94F80]">
                                                                            {/* Workshop avg rating mock */ '4.9'} <span className="text-[10px]">★</span>
                                                                        </span>
                                                                        <span>({/* Workshop reviews count mock */ Math.floor(Math.random() * 300) + 10})</span>
                                                                        <span className="text-deep-purple/30">•</span>
                                                                        <span className="line-clamp-1">{workshop.locationAddress || selectedLocation}</span>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}

                                                        {/* See all results button */}
                                                        <div className="px-4 pt-4 mt-2 border-t border-deep-purple/5">
                                                            <Link
                                                                to={`/search?q=${encodeURIComponent(searchQuery)}${selectedLocation !== 'All Locations' ? `&loc=${encodeURIComponent(selectedLocation)}` : ''}`}
                                                                onClick={() => setSearchOpen(false)}
                                                                className="inline-block px-4 py-1.5 border border-[#D94F80] text-[#D94F80] hover:bg-[#D94F80] hover:text-white rounded font-bold text-sm transition-all"
                                                            >
                                                                See all results
                                                            </Link>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="px-4 py-6 text-center text-sm text-deep-purple/50 font-semibold">
                                                        No classes found for "{searchQuery}"
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 rounded-lg transition-colors">
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
                                                                to={`/workshops?category=${encodeURIComponent(category.name)}`}
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
                                                <Link to="/profile/bookings" onClick={() => setUserMenuOpen(false)} className="w-full block px-4 py-3 rounded-lg hover:bg-cream-base text-left font-semibold">
                                                    My Bookings
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