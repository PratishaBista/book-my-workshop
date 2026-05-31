import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { formatWorkshopDate, formatWorkshopTime, parseApiDateTime } from '../../utils/dateTime';
import { Check, Loader2, ArrowRight, Sparkles, Ticket, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');
    const [bookingDetails, setBookingDetails] = useState<{
        workshopTitle?: string;
        workshopSlug?: string;
        startDateTime?: string;
        customerName?: string;
        confirmationCode?: string;
        numberOfSeats?: number;
        bookingId?: number;
    } | null>(null);

    const [giftCardDetails, setGiftCardDetails] = useState<{
        amount?: number;
        recipientEmail?: string;
        code?: string;
    } | null>(null);

    useEffect(() => {
        const data = searchParams.get('data');
        const bookingId = searchParams.get('bookingId');
        const paymentType = searchParams.get('type');

        if (paymentType === 'giftcard' || searchParams.get('giftCardId')) {
            const amountParam = searchParams.get('amount');
            setGiftCardDetails({
                amount: amountParam ? Number(amountParam) : undefined,
                recipientEmail: searchParams.get('recipientEmail') ?? undefined,
                code: searchParams.get('code') ?? undefined,
            });
            setStatus('success');
            setMessage(
                'Your gift card payment was successful. We emailed the recipient a link to claim their voucher.'
            );
            return;
        }

        if (bookingId) {
            fetchBookingDetailsDirectly(parseInt(bookingId, 10));
        } else if (data) {
            verifyPayment(data);
        } else {
            setStatus('error');
            setMessage('No payment data received.');
        }
    }, [searchParams]);

    const fetchBookingDetailsDirectly = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.booking.byId(id), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setStatus('success');
                setBookingDetails({
                    workshopTitle: result.workshop?.title || result.workshopTitle,
                    workshopSlug: result.workshop?.slug || result.workshopSlug,
                    startDateTime: result.schedule?.startDateTime || result.startDateTime,
                    customerName: result.userName || result.customerName,
                    confirmationCode: result.confirmationCode,
                    numberOfSeats: result.numberOfSeats,
                    bookingId: result.id,
                });
                setMessage('Your spot is officially reserved. Check your email for your ticket with QR code — or view it below.');
            } else {
                setStatus('error');
                setMessage('Failed to retrieve booking details.');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('An unexpected error occurred during verification.');
        }
    };

    const verifyPayment = async (data: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.payment.verify, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data })
            });

            if (response.ok) {
                const result = await response.json();
                setStatus('success');
                setBookingDetails({
                    workshopTitle: result.workshopTitle,
                    workshopSlug: result.workshopSlug,
                    startDateTime: result.startDateTime,
                    customerName: result.customerName,
                    confirmationCode: result.confirmationCode,
                    numberOfSeats: result.numberOfSeats,
                    bookingId: result.bookingId,
                });
                setMessage('Your spot is officially reserved. Check your email for your ticket with QR code or view it below.');
            } else {
                const result = await response.json();
                setStatus('error');
                setMessage(result.message || 'Payment verification failed.');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('An unexpected error occurred during verification.');
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col selection:bg-orange-100">
            <Navbar />

            <main className="flex-grow flex items-center justify-center pt-32 pb-32 px-6">
                <div className="max-w-xl w-full text-center">
                    {status === 'verifying' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="relative inline-block">
                                <Loader2 className="animate-spin text-primary-orange" size={48} />
                                <div className="absolute inset-0 animate-ping bg-primary-orange/20 rounded-full"></div>
                            </div>
                            <h1 className="text-3xl font-serif font-bold italic">Confirming your spot...</h1>
                            <p className="text-gray-500">Please don't close this window while we secure your reservation.</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white"
                                >
                                    <Check size={48} strokeWidth={3} />
                                </motion.div>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-4 -right-4 text-primary-orange"
                                >
                                    <Sparkles size={32} />
                                </motion.div>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight">Success!</h1>
                                <p className="text-xl text-gray-500 leading-relaxed max-w-md mx-auto">
                                    {message}
                                </p>
                            </div>

                            {giftCardDetails && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md mx-auto space-y-4 text-left"
                                >
                                    <div className="flex items-center gap-3 text-primary-orange">
                                        <Gift size={28} />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Gift card sent</p>
                                    </div>
                                    {giftCardDetails.amount != null && !Number.isNaN(giftCardDetails.amount) && (
                                        <p className="text-2xl font-serif font-bold text-deep-purple">
                                            Rs. {giftCardDetails.amount.toLocaleString()}
                                        </p>
                                    )}
                                    {giftCardDetails.recipientEmail && (
                                        <p className="text-sm text-gray-500">
                                            Sent to <span className="font-semibold text-deep-purple">{giftCardDetails.recipientEmail}</span>
                                        </p>
                                    )}
                                    {giftCardDetails.code && (
                                        <p className="text-xs font-mono text-gray-400">Code: {giftCardDetails.code}</p>
                                    )}
                                </motion.div>
                            )}

                            {bookingDetails && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md mx-auto space-y-4"
                                >
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-orange mb-1">Confirmed Experience</p>
                                        <h3 className="text-2xl font-serif font-bold text-deep-purple">{bookingDetails.workshopTitle}</h3>
                                        <p className="text-gray-500 mt-2">
                                            {bookingDetails.startDateTime ? (
                                                <>
                                                    {formatWorkshopDate(bookingDetails.startDateTime, {
                                                        weekday: 'long', month: 'long', day: 'numeric'
                                                    })} at {formatWorkshopTime(bookingDetails.startDateTime)}
                                                </>
                                            ) : 'Date & Time loading...'}
                                        </p>
                                    </div>
                                    {bookingDetails.confirmationCode && (
                                        <div className="flex flex-col items-center gap-3 py-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <QRCodeSVG
                                                    value={`${window.location.origin}/ticket/${bookingDetails.confirmationCode}`}
                                                    size={160}
                                                    level="M"
                                                />
                                            </div>
                                            <p className="text-[10px] font-mono font-bold text-gray-400 tracking-widest">
                                                {bookingDetails.confirmationCode}
                                            </p>
                                            {bookingDetails.numberOfSeats != null && (
                                                <p className="text-sm text-gray-500">
                                                    {bookingDetails.numberOfSeats} seat{bookingDetails.numberOfSeats > 1 ? 's' : ''} · {bookingDetails.customerName}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
                                        {bookingDetails.confirmationCode && (
                                            <Link
                                                to={`/ticket/${bookingDetails.confirmationCode}`}
                                                className="text-deep-purple font-bold hover:underline flex items-center gap-1"
                                            >
                                                <Ticket size={14} /> Open full ticket
                                            </Link>
                                        )}
                                        <Link to={`/workshop/${bookingDetails.workshopSlug}`} className="text-primary-orange font-bold hover:underline flex items-center gap-1">
                                            Workshop page <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/"
                                    className="w-full sm:w-auto px-8 py-4 bg-deep-purple text-white rounded-2xl font-bold hover:bg-deep-purple/90 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Explore More
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/profile?tab=bookings"
                                    className="w-full sm:w-auto px-8 py-4 border border-gray-200 text-deep-purple rounded-2xl font-bold hover:bg-white transition-all"
                                >
                                    View Tickets
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center">
                                <span className="text-4xl">!</span>
                            </div>
                            <h2 className="text-3xl font-serif font-bold">Something went wrong</h2>
                            <p className="text-gray-500 max-w-sm mx-auto">{message}</p>
                            <Link
                                to="/"
                                className="inline-block px-8 py-4 bg-deep-purple text-white rounded-2xl font-bold hover:bg-deep-purple/90 transition-all"
                            >
                                Return Home
                            </Link>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentSuccess;
