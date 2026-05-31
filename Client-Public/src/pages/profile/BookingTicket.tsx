import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Loader2, Ticket, Users, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { API_ENDPOINTS } from '../../config/api';
import { formatWorkshopDate, formatWorkshopTime } from '../../utils/dateTime';

interface TicketData {
    bookingId: number;
    confirmationCode: string;
    guestName: string;
    numberOfSeats: number;
    workshopTitle: string;
    workshopSlug?: string;
    workshopImageUrl?: string;
    startDateTime: string;
    endDateTime: string;
    locationAddress: string;
    locationName?: string;
    ticketUrl: string;
    qrPayload: string;
    attendanceStatus: number;
}

const BookingTicket: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) return;
        const fetchTicket = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view your ticket.');
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(API_ENDPOINTS.booking.ticketByCode(code), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    setTicket(await res.json());
                } else {
                    setError('Ticket not found or payment not confirmed.');
                }
            } catch {
                setError('Could not load your ticket.');
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [code]);

    const formatDate = (iso: string) =>
        formatWorkshopDate(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const formatTime = formatWorkshopTime;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col">
            <Navbar minimal />

            <main className="flex-grow pt-28 pb-24 px-6">
                <div className="max-w-lg mx-auto">
                    {loading ? (
                        <div className="py-32 flex justify-center">
                            <Loader2 className="animate-spin text-primary-orange" size={40} />
                        </div>
                    ) : error || !ticket ? (
                        <div className="text-center py-24 space-y-6">
                            <p className="text-gray-500">{error}</p>
                            <Link to="/login" className="text-primary-orange font-bold">Log in</Link>
                            <span className="text-gray-300"> · </span>
                            <Link to="/profile?tab=bookings" className="text-primary-orange font-bold">My bookings</Link>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden"
                        >
                            {ticket.workshopImageUrl && (
                                <div className="h-40 overflow-hidden">
                                    <img src={ticket.workshopImageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="p-10 space-y-8">
                                <div className="text-center space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-orange">
                                        Workshop ticket
                                    </span>
                                    <h1 className="text-3xl font-serif font-bold leading-tight">{ticket.workshopTitle}</h1>
                                    <p className="text-gray-500">Hi {ticket.guestName} — see you there!</p>
                                </div>

                                <div className="flex justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <QRCodeSVG value={ticket.qrPayload} size={200} level="M" includeMargin />
                                </div>

                                <p className="text-center text-xs text-gray-400 font-mono tracking-widest">
                                    {ticket.confirmationCode}
                                </p>

                                {ticket.attendanceStatus === 1 && (
                                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 rounded-2xl text-sm font-bold">
                                        <CheckCircle2 size={18} /> Checked in at venue
                                    </div>
                                )}

                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="text-gray-300 shrink-0 mt-0.5" size={18} />
                                        <span>{formatDate(ticket.startDateTime)}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="text-gray-300 shrink-0 mt-0.5" size={18} />
                                        <span>{formatTime(ticket.startDateTime)} – {formatTime(ticket.endDateTime)}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-gray-300 shrink-0 mt-0.5" size={18} />
                                        <span>
                                            {ticket.locationName && <strong className="block">{ticket.locationName}</strong>}
                                            {ticket.locationAddress}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="text-gray-300 shrink-0" size={18} />
                                        <span>
                                            {ticket.numberOfSeats} seat{ticket.numberOfSeats > 1 ? 's' : ''} reserved
                                        </span>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-gray-400 leading-relaxed border-t border-gray-50 pt-6">
                                    Show this QR code at the venue. Your host will check you in so you can leave a review after the session.
                                </p>

                                <Link
                                    to="/profile?tab=bookings"
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-deep-purple text-white rounded-2xl font-bold hover:bg-primary-orange transition-colors"
                                >
                                    <Ticket size={18} /> Back to my bookings
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingTicket;
