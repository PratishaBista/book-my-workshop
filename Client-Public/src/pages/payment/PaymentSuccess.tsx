import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { Check, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');
    const [bookingDetails, setBookingDetails] = useState<{
        workshopTitle?: string;
        workshopSlug?: string;
        startDateTime?: string;
        customerName?: string;
    } | null>(null);

    useEffect(() => {
        const data = searchParams.get('data');
        if (!data) {
            setStatus('error');
            setMessage('No payment data received.');
            return;
        }
        verifyPayment(data);
    }, [searchParams]);

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
                    customerName: result.customerName
                });
                setMessage('Your spot is officially reserved. We\'ve sent the details to your email.');
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
                                                    {new Date(bookingDetails.startDateTime).toLocaleDateString('en-US', {
                                                        weekday: 'long', month: 'long', day: 'numeric'
                                                    })} at {new Date(bookingDetails.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </>
                                            ) : 'Date & Time loading...'}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                                        <Link to="/profile/bookings" className="text-deep-purple font-bold hover:underline">
                                            View Ticket Details
                                        </Link>
                                        <Link to={`/workshop/${bookingDetails.workshopSlug}`} className="text-primary-orange font-bold hover:underline flex items-center gap-1">
                                            Back to Workshop <ArrowRight size={14} />
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
                                    to="/profile/bookings"
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
