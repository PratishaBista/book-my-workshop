import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MapPin, Calendar, Clock,
    ChevronRight, Search,
    Loader2, AlertCircle, RefreshCcw,
    ArrowRight, CreditCard, Ticket,
    CheckCircle2, Clock3, Ban, X, AlertTriangle, Receipt,
    Star, StarHalf
} from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { API_ENDPOINTS } from '../../config/api';

const BookingStatus = {
    Pending: 'Pending',
    Confirmed: 'Confirmed',
    Cancelled: 'Cancelled',
    Refunded: 'Refunded'
} as const;

type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

const PaymentStatus = {
    Pending: 'Pending',
    Paid: 'Paid',
    Failed: 'Failed',
    Refunded: 'Refunded'
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
    cancelledAt?: string;
    cancellationReason?: string;
    refundAmount?: number;
    refundPercentage?: number;
    cancelledBy?: string;
    hasReviewed?: boolean;
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
    
    // Cancellation Modal State
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    
    // Review Modal State
    const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

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

    const calculateRefundPrediction = (startDateTime: string, totalAmount: number) => {
        const hoursNotice = (new Date(startDateTime).getTime() - new Date().getTime()) / (1000 * 60 * 60);
        if (hoursNotice >= 24) return { percentage: 100, amount: totalAmount, tier: 'Full Refund (>24h notice)' };
        return { percentage: 0, amount: 0, tier: 'No Refund (<24h notice)' };
    };

    const handleCancelSubmit = async () => {
        if (!bookingToCancel) return;
        try {
            setIsCancelling(true);
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.booking.cancel(bookingToCancel.id), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: cancelReason })
            });

            if (response.ok) {
                const result = await response.json();
                // Update local list
                setBookings(prev => prev.map(b => b.id === bookingToCancel.id ? { 
                    ...b, 
                    bookingStatus: result.refundAmount > 0 ? BookingStatus.Refunded : BookingStatus.Cancelled,
                    refundAmount: result.refundAmount,
                    refundPercentage: result.refundPercentage
                } : b));
                setBookingToCancel(null);
                setCancelReason('');
            } else {
                alert('Failed to cancel booking. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('A network error occurred.');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!bookingToReview || reviewRating === 0) return;
        
        try {
            setIsSubmittingReview(true);
            const token = localStorage.getItem('token');
            // Backend endpoint: api/workshop/{workshopId}/review
            const response = await fetch(`${API_ENDPOINTS.workshop.base}/${bookingToReview.workshop.id}/review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating: reviewRating,
                    comment: reviewComment,
                    bookingId: bookingToReview.id
                })
            });

            if (response.ok) {
                // Update local state to mark it as reviewed
                setBookings(prev => prev.map(b => b.id === bookingToReview.id ? { ...b, hasReviewed: true } : b));
                setBookingToReview(null);
                setReviewRating(0);
                setReviewComment('');
                alert('Thank you for your review!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to submit review.');
            }
        } catch (err) {
            console.error(err);
            alert('A network error occurred.');
        } finally {
            setIsSubmittingReview(false);
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
                                                    
                                                    {/* Refund info for cancelled bookings */}
                                                    {(booking.bookingStatus === BookingStatus.Cancelled || booking.bookingStatus === BookingStatus.Refunded) && booking.refundAmount !== undefined && (
                                                        <div className="mt-2 text-xs font-bold px-3 py-1 bg-gray-50 text-gray-500 rounded-lg inline-flex items-center gap-1.5 border border-gray-100">
                                                            <Receipt size={12} />
                                                            Rs {booking.refundAmount.toLocaleString()} Refunded ({booking.refundPercentage}%)
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {(booking.bookingStatus === BookingStatus.Confirmed || booking.bookingStatus === BookingStatus.Pending) && isUpcoming(booking.schedule?.startDateTime) && (
                                                        <button 
                                                            onClick={() => setBookingToCancel(booking)}
                                                            className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                    {booking.bookingStatus === BookingStatus.Confirmed && !isUpcoming(booking.schedule?.startDateTime) && !booking.hasReviewed && (
                                                        <button 
                                                            onClick={() => setBookingToReview(booking)}
                                                            className="px-4 py-2 text-sm font-bold text-primary-orange bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors flex items-center gap-2"
                                                        >
                                                            <Star size={14} fill="currentColor" />
                                                            Rate Experience
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/workshop/${booking.workshop?.slug}`}
                                                        className="w-14 h-14 rounded-full bg-deep-purple text-white flex items-center justify-center hover:bg-primary-orange hover:shadow-xl hover:shadow-primary-orange/20 transition-all duration-300 active:scale-90"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}

                    <AnimatePresence>
                        {bookingToCancel && (
                             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-deep-purple/40 backdrop-blur-sm"
                                    onClick={() => setBookingToCancel(null)}
                                />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl border border-red-100"
                                >
                                    <button 
                                        onClick={() => setBookingToCancel(null)}
                                        className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-deep-purple transition-colors"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mb-6 transform -rotate-6">
                                        <AlertTriangle size={32} />
                                    </div>

                                    <h2 className="text-3xl font-serif font-bold text-deep-purple mb-2">Cancel Booking?</h2>
                                    <p className="text-gray-500 mb-6">You are about to cancel your reservation for <span className="font-bold text-deep-purple">{bookingToCancel.workshop.title}</span>.</p>

                                    {(() => {
                                        const refund = calculateRefundPrediction(bookingToCancel.schedule.startDateTime, bookingToCancel.totalAmount);
                                        return (
                                            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 mb-6">
                                                <div className="text-xs font-bold uppercase tracking-widest text-primary-orange mb-3 flex items-center gap-2">
                                                    <CreditCard size={14} /> Refund Policy Engine
                                                </div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <div className="text-sm font-medium text-gray-600">{refund.tier}</div>
                                                    <div className="text-xs font-bold text-gray-400">{refund.percentage}% Eligibility</div>
                                                </div>
                                                <div className="flex items-baseline justify-between pt-3 border-t border-orange-100/50">
                                                    <div className="text-sm font-bold text-gray-400">Estimated Refund</div>
                                                    <div className={`text-2xl font-serif font-bold ${refund.amount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                        Rs {refund.amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="mb-8 space-y-2">
                                        <label className="text-sm font-bold text-deep-purple ml-1">Reason for cancellation (Optional)</label>
                                        <textarea 
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            placeholder="Why are you cancelling?"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-deep-purple focus:ring-2 focus:ring-primary-orange/50 transition-shadow resize-none h-24"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setBookingToCancel(null)}
                                            className="flex-1 py-4 font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                                        >
                                            Keep Booking
                                        </button>
                                        <button 
                                            onClick={handleCancelSubmit}
                                            disabled={isCancelling}
                                            className="flex-1 py-4 font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 rounded-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            {isCancelling ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Cancel'}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {bookingToReview && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-deep-purple/40 backdrop-blur-sm"
                                    onClick={() => setBookingToReview(null)}
                                />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white rounded-[2rem] p-8 md:p-12 max-w-xl w-full relative z-10 shadow-2xl border border-gray-100"
                                >
                                    <button 
                                        onClick={() => setBookingToReview(null)}
                                        className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-deep-purple transition-colors"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-orange font-mono">Feedback Loop</span>
                                            <h2 className="text-4xl font-serif font-bold text-deep-purple leading-tight">Rate Your Experience</h2>
                                            <p className="text-gray-500 italic">How was your time at <span className="font-bold text-deep-purple not-italic">"{bookingToReview.workshop.title}"</span>?</p>
                                        </div>

                                        <div className="flex justify-center gap-4 py-8 border-y border-gray-50 mb-8">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    onMouseEnter={() => setHoverRating(s)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setReviewRating(s)}
                                                    className="transition-all duration-300 transform hover:scale-125 hover:-translate-y-1"
                                                >
                                                    <Star 
                                                        size={48} 
                                                        strokeWidth={1.5}
                                                        className={`transition-colors duration-300 ${
                                                            (hoverRating || reviewRating) >= s 
                                                            ? 'fill-primary-orange text-primary-orange' 
                                                            : 'text-gray-200'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Write a Review</label>
                                            <textarea 
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder="Tell us about the atmosphere, the host, or what you learned..."
                                                className="w-full bg-gray-50 border-none rounded-3xl px-8 py-6 text-deep-purple focus:ring-2 focus:ring-primary-orange/50 transition-shadow resize-none h-40 text-lg leading-relaxed placeholder:text-gray-300"
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <button 
                                                onClick={handleReviewSubmit}
                                                disabled={isSubmittingReview || reviewRating === 0}
                                                className="w-full py-6 font-bold text-white bg-deep-purple rounded-2xl shadow-xl shadow-deep-purple/20 hover:bg-primary-orange hover:shadow-primary-orange/20 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-4 text-xl active:scale-95"
                                            >
                                                {isSubmittingReview ? (
                                                    <Loader2 size={24} className="animate-spin" />
                                                ) : (
                                                    <>Submit Feedback <ArrowRight size={24} /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MyBookings;
