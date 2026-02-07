import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MapPin, Calendar, Clock,
    ChevronRight, Search,
    Loader2, AlertCircle, RefreshCcw,
    ArrowRight, CreditCard, Ticket,
    CheckCircle2, Clock3, Ban
} from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { API_ENDPOINTS } from '../../config/api';

const BookingStatus = {
    Pending: 0,
    Confirmed: 1,
    Cancelled: 2,
    Refunded: 3
} as const;

type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

const PaymentStatus = {
    Pending: 0,
    Paid: 1,
    Failed: 2,
    Refunded: 3
} as const;

type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

interface Booking {
    id: number;
    numberOfSeats: number;
    totalAmount: number;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    confirmationCode: string;
    bookingDate: string;
    schedule: {
        id: number;
        startDateTime: string;
        endDateTime: string;
        status: number;
    };
    workshop: {
        id: number;
        title: string;
        slug: string;
        locationAddress: string;
        primaryImageUrl: string;
    };
}

const MyBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.booking.my, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            } else {
                setError('Failed to load your bookings. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Something went wrong. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'TBD';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr: string | undefined) => {
        if (!dateStr) return 'TBD';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid Time';
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isUpcoming = (dateStr: string | undefined) => {
        if (!dateStr) return false;
        return new Date(dateStr) > new Date();
    };

    const getStatusStyles = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.Confirmed:
                return { label: 'Confirmed', icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' };
            case BookingStatus.Cancelled:
            case BookingStatus.Refunded:
                return { label: status === BookingStatus.Refunded ? 'Refunded' : 'Cancelled', icon: Ban, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
            default:
                return { label: 'Pending', icon: Clock3, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
        }
    };

    const sortedBookings = [...bookings].sort((a, b) => {
        const dateA = new Date(a.schedule?.startDateTime || 0).getTime();
        const dateB = new Date(b.schedule?.startDateTime || 0).getTime();
        return filter === 'past' ? dateB - dateA : dateA - dateB;
    });

    const filteredBookings = sortedBookings.filter(booking => {
        if (filter === 'all') return true;
        const upcoming = isUpcoming(booking.schedule?.startDateTime);
        if (filter === 'upcoming') return upcoming;
        if (filter === 'past') return !upcoming;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col selection:bg-orange-100">
            <Navbar minimal={true} />

            <main className="flex-grow pt-32 pb-32 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">

                    <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <h1 className="text-6xl font-serif font-bold tracking-tight">Your Experiences</h1>
                            <p className="text-xl text-gray-500 font-light max-w-lg">
                                Tracking your creative journey, one workshop at a time.
                            </p>
                        </div>

                        <div className="flex gap-2 p-1.5 bg-gray-100/50 backdrop-blur-sm rounded-2xl w-fit border border-gray-100/50">
                            {(['upcoming', 'past', 'all'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${filter === t
                                        ? 'bg-white text-deep-purple shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-6 text-gray-300">
                            <Loader2 className="animate-spin" size={40} strokeWidth={1} />
                            <p className="text-xl font-serif italic text-gray-400">Loading your history...</p>
                        </div>
                    ) : error ? (
                        <div className="py-24 text-center max-w-md mx-auto space-y-8">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50">
                                <AlertCircle size={36} />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-serif font-bold">Failed to load</h2>
                                <p className="text-gray-500 text-lg leading-relaxed">{error}</p>
                            </div>
                            <button
                                onClick={fetchBookings}
                                className="inline-flex items-center gap-3 px-10 py-4 bg-deep-purple text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-deep-purple/20 transition-all active:scale-95"
                            >
                                <RefreshCcw size={20} /> Try Again
                            </button>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="py-32 text-center border border-dashed border-gray-200 rounded-[4rem] bg-gray-50/30">
                            <div className="w-24 h-24 bg-white text-gray-200 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm">
                                <Search size={40} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-4 mb-12">
                                <h2 className="text-4xl font-serif font-bold">No {filter !== 'all' ? filter : ''} experiences</h2>
                                <p className="text-gray-400 text-xl font-light max-w-sm mx-auto leading-relaxed">
                                    Your list is currently empty. Start your next adventure today!
                                </p>
                            </div>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-3 px-12 py-5 bg-primary-orange text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary-orange/30 transition-all active:scale-95"
                            >
                                Find a workshop <ArrowRight size={20} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            <AnimatePresence mode="popLayout">
                                {filteredBookings.map((booking) => {
                                    const status = getStatusStyles(booking.bookingStatus);
                                    const StatusIcon = status.icon;

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            key={booking.id}
                                            className="group flex flex-col lg:flex-row items-stretch lg:items-center gap-12 py-12 border-b border-gray-100 last:border-0 hover:bg-white/40 transition-colors"
                                        >
                                            <div className="hidden lg:flex flex-col items-center gap-3 w-12">
                                                <div className={`w-3 h-3 rounded-full ${status.bg} border-2 ${status.border} ${status.text}`} />
                                                <div className="flex-grow w-[1px] bg-gray-100" />
                                            </div>

                                            <div className="lg:w-48 shrink-0">
                                                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                                                    {isUpcoming(booking.schedule?.startDateTime) ? 'Starts' : 'Completed'}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-2xl font-serif font-bold text-deep-purple leading-tight">
                                                        <Calendar size={20} className="text-gray-300 shrink-0" />
                                                        {formatDate(booking.schedule?.startDateTime)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                                        <Clock size={16} className="text-gray-300 shrink-0" />
                                                        {formatTime(booking.schedule?.startDateTime)} — {formatTime(booking.schedule?.endDateTime)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`px-4 py-1 rounded-full ${status.bg} border ${status.border} ${status.text} text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit`}>
                                                        <StatusIcon size={12} strokeWidth={3} />
                                                        {status.label}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                        <Ticket size={12} />
                                                        ID: {booking.confirmationCode}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <Link
                                                        to={`/workshop/${booking.workshop?.slug}`}
                                                        className="block text-3xl md:text-4xl font-serif font-bold text-deep-purple hover:text-primary-orange transition-colors"
                                                    >
                                                        {booking.workshop?.title}
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-gray-400 group/loc">
                                                        <MapPin size={18} className="shrink-0 transition-colors group-hover/loc:text-primary-orange" />
                                                        <span className="text-lg font-light leading-snug">{booking.workshop?.locationAddress}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:w-64 lg:pl-12 lg:border-l lg:border-gray-50 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-10">
                                                <div className="text-left lg:text-right space-y-1">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center lg:justify-end gap-2">
                                                        <CreditCard size={12} />
                                                        {booking.paymentStatus === PaymentStatus.Paid ? 'Payment Confirmed' : 'Payment Required'}
                                                    </div>
                                                    <p className="text-3xl font-serif font-bold text-deep-purple leading-none">
                                                        Rs {booking.totalAmount.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        {booking.numberOfSeats} Guest{booking.numberOfSeats > 1 ? 's' : ''} reserved
                                                    </p>
                                                </div>

                                                <Link
                                                    to={`/workshop/${booking.workshop?.slug}`}
                                                    className="w-14 h-14 rounded-full bg-deep-purple text-white flex items-center justify-center hover:bg-primary-orange hover:shadow-xl hover:shadow-primary-orange/20 transition-all duration-300 active:scale-90"
                                                >
                                                    <ChevronRight size={24} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MyBookings;
