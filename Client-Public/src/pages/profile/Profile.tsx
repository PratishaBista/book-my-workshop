import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Heart, MessageCircle, Star, Ticket, Wallet, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import ProfileHeader from './ProfileHeader';
import { API_ENDPOINTS } from '../../config/api';
import { formatWorkshopDate } from '../../utils/dateTime';

const Profile: React.FC = () => {
    const { username: routeUsername } = useParams<{ username?: string }>();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Tab Data States
    const [activeTab, setActiveTab] = useState<'bookings' | 'reviews' | 'wishlist' | 'wallet'>('bookings');
    const [bookings, setBookings] = useState<any[]>([]);
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [walletData, setWalletData] = useState<any>(null);
    const [walletLoading, setWalletLoading] = useState(false);

    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

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
        fetchBookings();
        fetchWishlistAndWorkshops();
    }, [routeUsername]);

    const fetchWalletData = async () => {
        setWalletLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await fetch(API_ENDPOINTS.wallet.get, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWalletData({
                    ...data,
                    balance: Number(data.balance ?? data.Balance ?? 0),
                    transactions: data.transactions ?? data.Transactions ?? [],
                });
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
        } finally {
            setWalletLoading(false);
        }
    };

    const isOwnProfile = !routeUsername || (profile && currentUser && profile.email === currentUser.email);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'wallet' && isOwnProfile) {
            setActiveTab('wallet');
        }
    }, [location.search, isOwnProfile]);

    useEffect(() => {
        if (activeTab === 'wallet' && isOwnProfile) {
            fetchWalletData();
        }
    }, [activeTab, isOwnProfile]);

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
                const processedProfile = {
                    ...data,
                    fullName: data.fullName || [data.firstName, data.surname].filter(Boolean).join(' ') || ''
                };
                setProfile(processedProfile);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await fetch(API_ENDPOINTS.booking.my, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchWishlistAndWorkshops = async () => {
        setWishlistLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.workshop.all);
            if (response.ok) {
                const data = await response.json();

                // Read from localStorage
                const storedWishlist = localStorage.getItem('wishlist');
                const wishlistIds: number[] = storedWishlist ? JSON.parse(storedWishlist) : [];

                const filtered = data.filter((w: any) => wishlistIds.includes(w.id));
                setWishlistItems(filtered);
            }
        } catch (error) {
            console.error('Error fetching workshops for wishlist:', error);
        } finally {
            setWishlistLoading(false);
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
        { id: 'bookings', label: 'My Bookings', icon: Calendar },
        { id: 'reviews', label: 'My Reviews', icon: MessageCircle },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        ...(isOwnProfile ? [{ id: 'wallet', label: 'My Wallet', icon: Wallet }] : []),
    ];

    const mockReviews = [
        {
            id: 1,
            workshopTitle: "Traditional Wood Carving & Chiseling",
            rating: 5,
            comment: "An absolute masterpiece of a workshop! The master artisan was extremely patient, detailed, and walked me through every chisel stroke. I went home with my own hand-carved wooden bowl. Highly recommend to anyone wanting to explore traditional wood crafts!",
            date: "May 24, 2026"
        },
        {
            id: 2,
            workshopTitle: "Mithila Painting Masterclass",
            rating: 5,
            comment: "Beautiful studio space, vibrant colors, and incredible storytelling about the ancient history of Mithila painting. Perfect weekend activity to unleash creativity. Loved every second of it!",
            date: "May 10, 2026"
        }
    ];

    const getBookingStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getPaymentStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const formatDate = (dateStr: string) =>
        formatWorkshopDate(dateStr, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    return (
        <div className="min-h-screen bg-cream-base font-sans text-deep-purple selection:bg-primary-orange selection:text-white">
            <Navbar minimal={true} />

            {/* Profile Content Container */}
            <div className="max-w-7xl mx-auto px-4 md:px-12 pt-32 pb-24 space-y-12">
                <ProfileHeader
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    showMoreMenu={showMoreMenu}
                    setShowMoreMenu={setShowMoreMenu}
                    handleCopyLink={handleCopyLink}
                    copied={copied}
                    moreMenuRef={moreMenuRef}
                />

                <div className="w-full space-y-8 border-t border-deep-purple/5 pt-8">
                    {/* Navigation Tabs */}
                    <div className="flex bg-white/50 p-1.5 rounded-2xl border border-white/50 shadow-sm w-fit">
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

                    {/* Tab Contents */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        {/* Bookings Tab */}
                        {activeTab === 'bookings' && (
                            bookingsLoading ? (
                                <div className="py-20 flex justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="aspect-[16/6] w-full bg-white/40 rounded-[2.5rem] border border-dashed border-deep-purple/10 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-deep-purple/5 flex items-center justify-center mb-4 text-primary-orange">
                                        <Calendar size={28} />
                                    </div>
                                    <h4 className="text-xl font-bold font-serif text-deep-purple mb-2">No bookings yet</h4>
                                    <p className="text-deep-purple/40 font-medium max-w-xs text-sm">
                                        You haven't booked any workshops yet. Discover amazing artisan experiences today!
                                    </p>
                                    <Link to="/" className="mt-6 px-6 py-2.5 bg-primary-orange text-white rounded-xl text-xs font-bold hover:bg-primary-orange/95 transition-all">
                                        Browse Workshops
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {bookings.map((booking) => (
                                        <div key={booking.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
                                            {/* Thumbnail */}
                                            <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden bg-gray-50 shrink-0 relative">
                                                {booking.workshop?.primaryImageUrl ? (
                                                    <img src={booking.workshop.primaryImageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-primary-orange/5 flex items-center justify-center text-primary-orange">
                                                        <Ticket size={32} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Booking Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-primary-orange uppercase tracking-[0.2em]">Booking Record</span>
                                                    <h4 className="text-lg font-bold text-deep-purple font-serif line-clamp-1">{booking.workshop?.title}</h4>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        <span>{formatDate(booking.schedule?.startDateTime)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Ticket size={14} className="text-gray-400" />
                                                        <span>{booking.numberOfSeats} Tickets</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                                    <span className="text-[10px] font-mono font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                        Code: {booking.confirmationCode}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getBookingStatusBadgeStyle(booking.bookingStatus)}`}>
                                                        {booking.bookingStatus}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getPaymentStatusBadgeStyle(booking.paymentStatus)}`}>
                                                        {booking.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-6 max-w-4xl">
                                {mockReviews.map((review) => (
                                    <div key={review.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 space-y-4 shadow-sm">
                                        <div className="flex flex-wrap justify-between items-start gap-2">
                                            <div>
                                                <span className="text-[9px] font-bold text-primary-orange uppercase tracking-[0.2em]">{review.date}</span>
                                                <h4 className="text-xl font-bold font-serif text-deep-purple mt-0.5">{review.workshopTitle}</h4>
                                            </div>
                                            <div className="flex gap-1">
                                                {Array.from({ length: review.rating }).map((_, i) => (
                                                    <Star key={i} size={16} className="fill-primary-orange text-primary-orange" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-deep-purple/75 leading-relaxed text-sm font-medium italic">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {activeTab === 'wishlist' && (
                            wishlistLoading ? (
                                <div className="py-20 flex justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
                                </div>
                            ) : wishlistItems.length === 0 ? (
                                <div className="aspect-[16/6] w-full bg-white/40 rounded-[2.5rem] border border-dashed border-deep-purple/10 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-deep-purple/5 flex items-center justify-center mb-4 text-primary-orange">
                                        <Heart size={28} />
                                    </div>
                                    <h4 className="text-xl font-bold font-serif text-deep-purple mb-2">Your Wishlist is Empty</h4>
                                    <p className="text-deep-purple/40 font-medium max-w-xs text-sm">
                                        Bookmark interesting workshops in the marketplace, and they'll show up right here!
                                    </p>
                                    <Link to="/" className="mt-6 px-6 py-2.5 bg-primary-orange text-white rounded-xl text-xs font-bold hover:bg-primary-orange/95 transition-all">
                                        Explore Workshops
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {wishlistItems.map((item) => (
                                        <Link key={item.id} to={`/workshop/${item.slug || item.id}`} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                                            <div className="aspect-[16/10] w-full bg-gray-100 relative overflow-hidden shrink-0">
                                                {item.primaryImageUrl ? (
                                                    <img src={item.primaryImageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-primary-orange/5 flex items-center justify-center text-primary-orange">
                                                        <Heart size={36} />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold text-primary-orange uppercase tracking-wider border border-primary-orange/10">
                                                    Rs. {item.basePrice}
                                                </div>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-bold text-primary-orange uppercase tracking-widest">{item.categoryName || 'Workshop'}</span>
                                                    <h4 className="text-lg font-serif font-bold text-deep-purple line-clamp-2 leading-tight group-hover:text-primary-orange transition-colors">{item.title}</h4>
                                                </div>

                                                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 border-t border-gray-50 pt-4">
                                                    <span className="line-clamp-1">{item.locationName}</span>
                                                    {item.averageRating && (
                                                        <span className="flex items-center gap-1 text-primary-orange">
                                                            ★ {item.averageRating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Wallet Tab */}
                        {activeTab === 'wallet' && isOwnProfile && (
                            walletLoading ? (
                                <div className="py-20 flex justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {/* Wallet Balance Card — matches gift voucher styling (BuyGiftCard / ClaimGiftCard) */}
                                    <div className="max-w-md">
                                        <div className="aspect-[1.58/1] w-full rounded-[2.5rem] bg-gradient-to-tr from-[#311E43] via-[#b49e47] to-[#8d66b4] p-8 text-cream-base shadow-2xl relative overflow-hidden border border-white/10 flex flex-col justify-between">
                                            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-xl pointer-events-none" />
                                            <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-pink-500 opacity-20 blur-xl pointer-events-none" />

                                            <div className="flex justify-between items-start z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                                        <Wallet className="text-white" size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold font-mono tracking-widest uppercase text-amber-400">My Wallet</span>
                                                        <h4 className="text-[10px] font-sans font-semibold tracking-wider opacity-60">BOOK MY WORKSHOP</h4>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl md:text-3xl font-serif font-bold text-amber-300">
                                                        Rs. {(walletData?.balance || 0).toLocaleString()}
                                                    </div>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">NRP Value</span>
                                                </div>
                                            </div>

                                            <div className="my-4 z-10">
                                                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Available Balance</span>
                                                <p className="text-sm font-semibold opacity-90 mt-1">
                                                    Use at checkout for workshop bookings
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-end border-t border-white/10 pt-4 z-10 text-[8px] font-medium opacity-50">
                                                <div>
                                                    <p>Refunds from cancellations are credited here.</p>
                                                    <p>© 2026 BookMyWorkshop.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transactions List */}
                                    <div className="space-y-6 max-w-4xl">
                                        <h3 className="text-2xl font-serif font-bold tracking-tight text-deep-purple">Transaction History</h3>

                                        {(!walletData?.transactions || walletData.transactions.length === 0) ? (
                                            <div className="aspect-[16/6] w-full bg-white/40 rounded-[2.5rem] border border-dashed border-deep-purple/10 flex flex-col items-center justify-center p-12 text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-deep-purple/5 flex items-center justify-center mb-4 text-primary-orange">
                                                    <Wallet size={28} />
                                                </div>
                                                <h4 className="text-xl font-bold font-serif text-deep-purple mb-2">No transactions yet</h4>
                                                <p className="text-deep-purple/40 font-medium max-w-xs text-sm">
                                                    Your transaction history is empty. Claim a gift card or request refunds to see wallet activity.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
                                                {walletData.transactions.map((tx: any) => {
                                                    const isCredit = tx.type === 'GiftCardClaim' || tx.type === 'BookingRefund';
                                                    return (
                                                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                                    }`}>
                                                                    {isCredit ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h4 className="font-bold text-sm text-deep-purple">
                                                                        {tx.type === 'GiftCardClaim' && 'Gift Card Claimed'}
                                                                        {tx.type === 'BookingPayment' && 'Booking Payment'}
                                                                        {tx.type === 'BookingRefund' && 'Refund Credited'}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-400 font-medium">{tx.description}</p>
                                                                    <p className="text-[10px] text-gray-300 font-medium">
                                                                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`text-base font-bold font-mono ${isCredit ? 'text-emerald-600' : 'text-rose-600'
                                                                    }`}>
                                                                    {isCredit ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 font-medium">
                                                                    Balance: Rs. {tx.balanceAfter.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </motion.div>
                </div>
            </div >
            <Footer />
        </div >
    );
};

export default Profile;
