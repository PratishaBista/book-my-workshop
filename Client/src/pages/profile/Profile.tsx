import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Heart, MessageCircle, Star
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import ProfileHeader from './ProfileHeader';
import { API_ENDPOINTS } from '../../config/api';

const formatDateToMonthYear = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
};

const Profile: React.FC = () => {
    const { username: routeUsername } = useParams<{ username?: string }>();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'workshops' | 'reviews' | 'wishlist'>('workshops');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const parts = token.split('.');
                if (parts.length >= 2) {
                    const payload = JSON.parse(atob(parts[1]));
                    setCurrentUser({
                        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
                        username: payload.profileUsername || payload.name
                    });
                }
            } catch (e) {
                console.error("error decoding token", e);
            }
        }
        fetchProfile();
    }, [routeUsername]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = routeUsername
                ? `${API_ENDPOINTS.profile.get}/u/${routeUsername}`
                : API_ENDPOINTS.profile.get;

            const response = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const profileLink = `${window.location.origin}/u/${profile?.profileUsername || ''}`;
        navigator.clipboard.writeText(profileLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShowMoreMenu(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-base flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'workshops', label: 'Workshops', icon: Calendar },
        { id: 'reviews', label: 'Reviews', icon: MessageCircle },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
    ];

    const isOwnProfile = !routeUsername || (profile && currentUser && profile.email === currentUser.email);

    return (
        <div className="min-h-screen bg-cream-base font-sans text-deep-purple selection:bg-primary-orange selection:text-white">
            <Navbar minimal={true} />

            <div className="relative h-[45vh] w-full mt-20 group overflow-hidden">
                <div className="absolute inset-0 bg-deep-purple/10">
                    {profile?.coverImageUrl ? (
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            src={profile.coverImageUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-deep-purple/20 via-primary-orange/10 to-deep-purple/20" />
                    )}
                </div>
                <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-20" />
                <div className="absolute bottom-8 right-8 md:right-12">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/80 font-sans font-light text-xs md:text-sm tracking-[0.1em] uppercase"
                    >
                        Member since {formatDateToMonthYear(profile?.createdAt)}
                    </motion.p>
                </div>
            </div>

            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                showMoreMenu={showMoreMenu}
                setShowMoreMenu={setShowMoreMenu}
                handleCopyLink={handleCopyLink}
                copied={copied}
                moreMenuRef={moreMenuRef}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-12 mt-12 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/40 border border-deep-purple/5 rounded-[2.5rem] p-8 backdrop-blur-sm space-y-8"
                        >
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold font-serif text-deep-purple">Story</h3>
                                <p className="text-deep-purple/70 leading-relaxed text-lg font-medium">
                                    {profile?.bio || "This user is still crafting their story. Stay tuned for more about their workshop journey!"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-deep-purple/5 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star size={16} className="text-primary-orange" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-deep-purple/40">Mastered</span>
                                    </div>
                                    <div className="text-2xl font-bold font-serif text-deep-purple">12 Skills</div>
                                </div>
                                <div className="p-4 bg-deep-purple/5 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageCircle size={16} className="text-primary-orange" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-deep-purple/40">Reviews</span>
                                    </div>
                                    <div className="text-2xl font-bold font-serif text-deep-purple">4.9 / 5.0</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="flex overflow-x-auto pb-6 scrollbar-hide">
                            <div className="flex bg-white/40 p-1.5 rounded-2xl border border-white/40 shadow-sm">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                                ? 'bg-deep-purple text-cream-base shadow-lg'
                                                : 'text-deep-purple/40 hover:text-deep-purple'
                                            }`}
                                    >
                                        <tab.icon size={18} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="aspect-[16/9] w-full bg-white/40 rounded-[2.5rem] border border-dashed border-deep-purple/10 flex flex-col items-center justify-center p-12 text-center group hover:bg-white/60 transition-all duration-500">
                                <div className="w-20 h-20 rounded-3xl bg-deep-purple/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-orange/10 transition-transform">
                                    {activeTab === 'workshops' && <Calendar size={32} className="text-primary-orange" />}
                                    {activeTab === 'reviews' && <MessageCircle size={32} className="text-primary-orange" />}
                                    {activeTab === 'wishlist' && <Heart size={32} className="text-primary-orange" />}
                                </div>
                                <h4 className="text-2xl font-bold font-serif text-deep-purple mb-2">
                                    No {activeTab} yet
                                </h4>
                                <p className="text-deep-purple/40 font-medium max-w-sm">
                                    {isOwnProfile
                                        ? `Start your journey by adding your first ${activeTab.slice(0, -1)}.`
                                        : `This user hasn't shared any ${activeTab} with the community yet.`}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
