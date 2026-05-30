import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, CheckCircle2, Clock, Users, Mail, Ticket,
    AlertCircle, Calendar, ChevronDown, ChevronUp, Check,
    Clock3, DollarSign, Award
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';

interface BookingAttendee {
    id: number;
    guestName: string;
    guestEmail: string;
    numberOfSeats: number;
    confirmationCode: string;
    bookingStatus: number | string;
    paymentStatus: number | string;
    bookingDate: string;
    attendanceStatus?: number;
    checkedInAt?: string;
}

interface ScheduleWithBookings {
    id: number;
    workshopId: number;
    workshopTitle: string;
    basePrice: number;
    startDateTime: string;
    endDateTime: string;
    maxCapacity: number;
    availableSeats: number;
    isSoldOut: boolean;
    status: number; // 0=Upcoming, 1=InProgress, 2=Completed, 3=Cancelled
    bookings: BookingAttendee[];
}

const AttendanceStatus = { Pending: 0, CheckedIn: 1, NoShow: 2 } as const;

export const ParticipantBookings: React.FC = () => {
    const [schedules, setSchedules] = useState<ScheduleWithBookings[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
    const [expandedScheduleId, setExpandedScheduleId] = useState<number | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [checkInLoadingId, setCheckInLoadingId] = useState<number | null>(null);
    const [checkInCode, setCheckInCode] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.provider.scheduleWithBookings}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSchedules(data);
                // Expand the first schedule by default if available
                if (data.length > 0) {
                    setExpandedScheduleId(data[0].id);
                }
            } else {
                setErrorMessage('Failed to fetch participant bookings.');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setErrorMessage('An error occurred while loading bookings.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async (scheduleId: number) => {
        if (!window.confirm('Are you sure you want to mark this workshop session as completed? This will allow participants to submit their reviews.')) {
            return;
        }

        try {
            setActionLoadingId(scheduleId);
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.provider.markScheduleComplete(scheduleId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setSuccessMessage('Workshop marked as completed successfully!');
                setTimeout(() => setSuccessMessage(null), 4000);
                
                // Update local state
                setSchedules(prev => prev.map(s => {
                    if (s.id === scheduleId) {
                        return { ...s, status: 2 };
                    }
                    return s;
                }));
            } else {
                const errData = await response.json().catch(() => ({}));
                setErrorMessage(errData.message || 'Failed to update schedule status.');
                setTimeout(() => setErrorMessage(null), 4000);
            }
        } catch (error) {
            console.error('Error marking complete:', error);
            setErrorMessage('An error occurred while updating status.');
            setTimeout(() => setErrorMessage(null), 4000);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCheckIn = async (confirmationCode: string, bookingId?: number) => {
        const code = confirmationCode.trim();
        if (!code) return;

        try {
            setCheckInLoadingId(bookingId ?? -1);
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.provider.checkInBooking, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ confirmationCode: code }),
            });

            if (response.ok) {
                const data = await response.json();
                const updated = data.booking as BookingAttendee;
                setSchedules((prev) =>
                    prev.map((s) => ({
                        ...s,
                        bookings: s.bookings.map((b) =>
                            b.confirmationCode === code || b.id === updated.id
                                ? { ...b, attendanceStatus: AttendanceStatus.CheckedIn, checkedInAt: updated.checkedInAt }
                                : b
                        ),
                    }))
                );
                setCheckInCode('');
                setSuccessMessage(`${updated.guestName} checked in successfully!`);
                setTimeout(() => setSuccessMessage(null), 4000);
            } else {
                const errData = await response.json().catch(() => ({}));
                setErrorMessage(errData.message || 'Check-in failed.');
                setTimeout(() => setErrorMessage(null), 4000);
            }
        } catch (error) {
            console.error('Check-in error:', error);
            setErrorMessage('An error occurred during check-in.');
            setTimeout(() => setErrorMessage(null), 4000);
        } finally {
            setCheckInLoadingId(null);
        }
    };

    const getAttendanceLabel = (status?: number) => {
        switch (status) {
            case AttendanceStatus.CheckedIn:
                return 'Present';
            case AttendanceStatus.NoShow:
                return 'No show';
            default:
                return 'Pending';
        }
    };

    const getAttendanceBadge = (status?: number) => {
        switch (status) {
            case AttendanceStatus.CheckedIn:
                return 'bg-green-50 text-green-700 border-green-100';
            case AttendanceStatus.NoShow:
                return 'bg-red-50 text-red-600 border-red-100';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    // Helper to get readable schedule status
    const getScheduleStatusLabel = (status: number) => {
        switch (status) {
            case 0: return 'Upcoming';
            case 1: return 'In Progress';
            case 2: return 'Completed';
            case 3: return 'Cancelled';
            default: return 'Unknown';
        }
    };

    const getScheduleStatusBadgeStyle = (status: number) => {
        switch (status) {
            case 0: return 'bg-blue-50 text-blue-700 border-blue-100';
            case 1: return 'bg-amber-50 text-amber-700 border-amber-100';
            case 2: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 3: return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getBookingStatusLabel = (status: any) => {
        if (status === 0 || status === 'Pending') return 'Pending';
        if (status === 1 || status === 'Confirmed') return 'Confirmed';
        if (status === 2 || status === 'Cancelled') return 'Cancelled';
        if (status === 3 || status === 'Refunded') return 'Refunded';
        return String(status);
    };

    const getBookingStatusBadgeStyle = (status: any) => {
        const label = getBookingStatusLabel(status);
        switch (label) {
            case 'Confirmed': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
            case 'Cancelled': return 'bg-rose-50 text-rose-700 border border-rose-100';
            case 'Refunded': return 'bg-gray-100 text-gray-700 border border-gray-200';
            default: return 'bg-gray-50 text-gray-700 border border-gray-100';
        }
    };

    const getPaymentStatusLabel = (status: any) => {
        if (status === 0 || status === 'Pending') return 'Pending';
        if (status === 1 || status === 'Paid') return 'Paid';
        if (status === 2 || status === 'Failed') return 'Failed';
        if (status === 3 || status === 'Refunded') return 'Refunded';
        return String(status);
    };

    const getPaymentStatusBadgeStyle = (status: any) => {
        const label = getPaymentStatusLabel(status);
        switch (label) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
            case 'Failed': return 'bg-rose-50 text-rose-700 border border-rose-100';
            default: return 'bg-gray-50 text-gray-700 border border-gray-100';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter schedules and bookings based on inputs
    const filteredSchedules = schedules.filter(schedule => {
        // Status filter
        if (statusFilter === 'upcoming' && schedule.status !== 0 && schedule.status !== 1) return false;
        if (statusFilter === 'completed' && schedule.status !== 2) return false;
        if (statusFilter === 'cancelled' && schedule.status !== 3) return false;

        // Search Query filter (matches Workshop Title, Attendee Name, Confirmation Code, Email)
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        const matchesTitle = schedule.workshopTitle.toLowerCase().includes(query);
        const matchesAttendee = schedule.bookings?.some(b => 
            b.guestName.toLowerCase().includes(query) ||
            b.guestEmail.toLowerCase().includes(query) ||
            b.confirmationCode.toLowerCase().includes(query)
        );

        return matchesTitle || matchesAttendee;
    });

    // Stats calculations
    const totalBookings = schedules.reduce((sum, s) => sum + (s.bookings?.filter(b => getBookingStatusLabel(b.bookingStatus) === 'Confirmed').length || 0), 0);
    const totalSeatsBooked = schedules.reduce((sum, s) => sum + (s.bookings?.filter(b => getBookingStatusLabel(b.bookingStatus) === 'Confirmed').reduce((seatsSum, b) => seatsSum + b.numberOfSeats, 0) || 0), 0);
    const activeSchedulesCount = schedules.filter(s => s.status === 0 || s.status === 1).length;
    const completedSchedulesCount = schedules.filter(s => s.status === 2).length;

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-deep-purple">Participant Bookings</h2>
                    <p className="text-gray-500 mt-1">Keep track of everyone joining your workshops, check confirmations, and mark sessions completed.</p>
                </div>
            </div>

            {/* Notification Messages */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm"
                    >
                        <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
                        <span className="font-semibold text-sm">{successMessage}</span>
                    </motion.div>
                )}

                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm"
                    >
                        <AlertCircle className="text-rose-600 flex-shrink-0" size={20} />
                        <span className="font-semibold text-sm">{errorMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary-orange/5 flex items-center justify-center text-primary-orange">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Bookings</p>
                        <h4 className="text-2xl font-bold text-deep-purple mt-0.5">{totalBookings}</h4>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-deep-purple/5 flex items-center justify-center text-deep-purple">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Tickets Registered</p>
                        <h4 className="text-2xl font-bold text-deep-purple mt-0.5">{totalSeatsBooked}</h4>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Active Schedules</p>
                        <h4 className="text-2xl font-bold text-deep-purple mt-0.5">{activeSchedulesCount}</h4>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Completed Sessions</p>
                        <h4 className="text-2xl font-bold text-deep-purple mt-0.5">{completedSchedulesCount}</h4>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, participant name, or confirmation code..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium placeholder-gray-400 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 gap-1 w-full md:w-auto">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-deep-purple text-white' : 'text-gray-500 hover:text-deep-purple'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('upcoming')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'upcoming' ? 'bg-deep-purple text-white' : 'text-gray-500 hover:text-deep-purple'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setStatusFilter('completed')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'completed' ? 'bg-deep-purple text-white' : 'text-gray-500 hover:text-deep-purple'}`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setStatusFilter('cancelled')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'cancelled' ? 'bg-deep-purple text-white' : 'text-gray-500 hover:text-deep-purple'}`}
                    >
                        Cancelled
                    </button>
                </div>
            </div>

            {/* Bookings & Schedules List */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
                    <p className="text-gray-400 text-sm font-semibold">Retrieving participant records...</p>
                </div>
            ) : filteredSchedules.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 py-24 flex flex-col items-center text-center p-8">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 font-serif text-3xl">
                        <Users size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-deep-purple mb-2">No schedules or bookings found</h3>
                    <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                        There are no bookings matching your current filters or search terms. Try adjusting them or check back later!
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredSchedules.map((schedule) => {
                        const isExpanded = expandedScheduleId === schedule.id;
                        const hasBookings = schedule.bookings && schedule.bookings.length > 0;
                        const confirmedBookings = schedule.bookings?.filter(b => getBookingStatusLabel(b.bookingStatus) === 'Confirmed') || [];
                        const totalTicketsBooked = confirmedBookings.reduce((sum, b) => sum + b.numberOfSeats, 0);

                        return (
                            <div
                                key={schedule.id}
                                className="bg-white rounded-[2.2rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                            >
                                {/* Accordion Header */}
                                <div
                                    onClick={() => setExpandedScheduleId(isExpanded ? null : schedule.id)}
                                    className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer select-none hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getScheduleStatusBadgeStyle(schedule.status)}`}>
                                                {getScheduleStatusLabel(schedule.status)}
                                            </span>
                                            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {formatDate(schedule.startDateTime)}
                                            </span>
                                            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {formatTime(schedule.startDateTime)} - {formatTime(schedule.endDateTime)}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl md:text-2xl font-bold text-deep-purple tracking-tight">{schedule.workshopTitle}</h3>
                                        
                                        <div className="flex items-center gap-6 text-xs font-semibold text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <Users size={14} className="text-primary-orange" />
                                                {totalTicketsBooked} / {schedule.maxCapacity} Seats Booked
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <DollarSign size={14} className="text-emerald-600" />
                                                Rs. {schedule.basePrice} per Seat
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action items and Toggle */}
                                    <div className="flex items-center gap-3 self-stretch md:self-auto justify-between border-t border-gray-50 md:border-none pt-4 md:pt-0">
                                        {schedule.status !== 2 && schedule.status !== 3 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkComplete(schedule.id);
                                                }}
                                                disabled={actionLoadingId === schedule.id}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                            >
                                                {actionLoadingId === schedule.id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <Check size={14} />
                                                )}
                                                <span>Mark Completed</span>
                                            </button>
                                        )}

                                        <div className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-deep-purple transition-all">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion Content (Attendees List) */}
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="border-t border-gray-50 bg-gray-50/20 overflow-hidden"
                                        >
                                            <div className="p-6 md:p-8">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Participant Details</h4>

                                                {hasBookings && schedule.status !== 3 && (
                                                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                                        <input
                                                            type="text"
                                                            value={checkInCode}
                                                            onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
                                                            placeholder="Scan or enter ticket code (BMW-...)"
                                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-primary-orange/30 outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCheckIn(checkInCode)}
                                                            disabled={!checkInCode.trim() || checkInLoadingId !== null}
                                                            className="px-6 py-3 bg-deep-purple text-white rounded-xl text-sm font-bold hover:bg-primary-orange transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            <Check size={16} />
                                                            Check in
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {!hasBookings ? (
                                                    <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center flex flex-col items-center">
                                                        <Clock3 className="text-gray-300 mb-3" size={28} />
                                                        <p className="text-sm font-semibold text-deep-purple">No bookings received yet</p>
                                                        <p className="text-xs text-gray-400 mt-1">Once clients purchase tickets for this session, they will appear right here.</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left border-collapse">
                                                                <thead>
                                                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                                        <th className="py-4 px-6">Participant</th>
                                                                        <th className="py-4 px-6">Confirmation Code</th>
                                                                        <th className="py-4 px-6 text-center">Seats</th>
                                                                        <th className="py-4 px-6">Booking Date</th>
                                                                        <th className="py-4 px-6">Booking Status</th>
                                                                        <th className="py-4 px-6">Payment Status</th>
                                                                        <th className="py-4 px-6">Attendance</th>
                                                                        <th className="py-4 px-6 text-right">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50 text-sm font-medium text-deep-purple">
                                                                    {schedule.bookings.map((booking) => (
                                                                        <tr key={booking.id} className="hover:bg-gray-50/30 transition-colors">
                                                                            <td className="py-4 px-6">
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-bold text-deep-purple">{booking.guestName}</span>
                                                                                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                                                        <Mail size={12} />
                                                                                        {booking.guestEmail || 'N/A'}
                                                                                    </span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-4 px-6">
                                                                                <code className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg text-xs font-mono font-semibold text-deep-purple">
                                                                                    {booking.confirmationCode}
                                                                                </code>
                                                                            </td>
                                                                            <td className="py-4 px-6 text-center">
                                                                                <span className="inline-flex items-center justify-center w-7 h-7 bg-primary-orange/5 text-primary-orange font-bold rounded-lg text-xs">
                                                                                    {booking.numberOfSeats}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-4 px-6 text-xs text-gray-400">
                                                                                {formatDate(booking.bookingDate)}
                                                                            </td>
                                                                            <td className="py-4 px-6">
                                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBookingStatusBadgeStyle(booking.bookingStatus)}`}>
                                                                                    {getBookingStatusLabel(booking.bookingStatus)}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-4 px-6">
                                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPaymentStatusBadgeStyle(booking.paymentStatus)}`}>
                                                                                    {getPaymentStatusLabel(booking.paymentStatus)}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-4 px-6">
                                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getAttendanceBadge(booking.attendanceStatus)}`}>
                                                                                    {getAttendanceLabel(booking.attendanceStatus)}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-4 px-6 text-right">
                                                                                {booking.attendanceStatus !== AttendanceStatus.CheckedIn &&
                                                                                    (booking.paymentStatus === 1 || String(booking.paymentStatus).toLowerCase() === 'paid') && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleCheckIn(booking.confirmationCode, booking.id)}
                                                                                        disabled={checkInLoadingId === booking.id}
                                                                                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100 rounded-lg hover:bg-green-100 disabled:opacity-50"
                                                                                    >
                                                                                        {checkInLoadingId === booking.id ? '...' : 'Mark present'}
                                                                                    </button>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
