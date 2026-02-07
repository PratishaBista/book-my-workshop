import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import {
    Calendar, MapPin, Clock, ArrowLeft, ShieldCheck,
    CreditCard, Loader2, Mail, User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

const Checkout: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!state?.workshop || !state?.schedule) {
            navigate('/', { replace: true });
        }
    }, [state, navigate]);

    if (!state?.workshop || !state?.schedule) return null;

    const { workshop, schedule, numberOfSeats = 1 } = state;
    const workshopDate = new Date(schedule.startDateTime);
    const totalPrice = workshop.pricing.basePrice * numberOfSeats;

    const submitToEsewa = (params: any) => {
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", params.esewaUrl);

        const fieldMap: { [key: string]: string } = {
            amount: 'amount',
            taxAmount: 'tax_amount',
            totalAmount: 'total_amount',
            transactionUuid: 'transaction_uuid',
            productCode: 'product_code',
            productServiceCharge: 'product_service_charge',
            productDeliveryCharge: 'product_delivery_charge',
            successUrl: 'success_url',
            failureUrl: 'failure_url',
            signedFieldNames: 'signed_field_names',
            signature: 'signature',
        };

        for (const key in fieldMap) {
            if (params[key] !== undefined) {
                const hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", fieldMap[key]);
                hiddenField.setAttribute("value", params[key]);
                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form.submit();
    };

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            const response = await fetch(API_ENDPOINTS.payment.initiate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    workshopScheduleId: schedule.id,
                    numberOfSeats: numberOfSeats
                })
            });

            if (response.ok) {
                const paymentData = await response.json();
                submitToEsewa(paymentData);
            } else {
                const errorText = await response.text();
                setError(errorText || "Failed to initiate payment. Please try again.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Payment Error:", err);
            setError("Network error. Please check your connection.");
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col selection:bg-orange-100 selection:text-deep-purple">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-deep-purple transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-deep-purple transition-colors">
                                <ArrowLeft size={14} />
                            </div>
                            <span>Go back</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                        <div className="lg:col-span-7 space-y-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
                                    {workshop.title}
                                </h1>
                                <p className="text-xl text-gray-500 font-serif italic mb-8">
                                    Hosted by {workshop.provider.businessName}
                                </p>

                                <div className="aspect-[16/9] w-full bg-gray-100 rounded-[2rem] overflow-hidden shadow-sm mb-10">
                                    {workshop.media && workshop.media.filter((m: any) => m.mediaType === 0).length > 0 ? (
                                        <img
                                            src={workshop.media.find((m: any) => m.mediaType === 0 && m.isPrimary)?.url ||
                                                workshop.media.filter((m: any) => m.mediaType === 0)[0]?.url}
                                            alt={workshop.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                            <Calendar size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                                            <Calendar size={14} />
                                            <span>Date</span>
                                        </div>
                                        <p className="text-lg font-medium">{formatDate(workshopDate)}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                                            <Clock size={14} />
                                            <span>Time</span>
                                        </div>
                                        <p className="text-lg font-medium">{formatTime(schedule.startDateTime)} — {formatTime(schedule.endDateTime)}</p>
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                                            <MapPin size={14} />
                                            <span>Location</span>
                                        </div>
                                        <p className="text-lg font-medium leading-relaxed">{workshop.locationAddress}</p>
                                        {workshop.locationName && (
                                            <p className="text-gray-500">{workshop.locationName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-16 pt-12 border-t border-gray-200/60 space-y-12">
                                    {workshop.whatsIncluded && (
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">What's Included</h4>
                                            <p className="text-gray-600 leading-relaxed font-serif italic text-lg">
                                                "{workshop.whatsIncluded}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 p-6 bg-green-50/50 rounded-[1.5rem] border border-green-100/50 text-green-800 text-sm leading-relaxed max-w-lg">
                                        <ShieldCheck className="shrink-0 text-green-600" size={20} />
                                        <div>
                                            <p className="font-bold mb-1">Flexible Cancellation</p>
                                            <p className="text-green-700/80">
                                                {workshop.cancellationPolicy || `Cancel up to ${workshop.bookingCutoffHours || 24} hours before the start time for a full refund.`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="sticky top-32 space-y-10"
                            >
                                <div>
                                    <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-3">
                                        <span className="w-8 h-[1px] bg-deep-purple"></span>
                                        Contact Details
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Name</label>
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                                                <UserIcon size={18} className="text-gray-400" />
                                                <span className="text-lg text-deep-purple">{user?.name}</span>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                                                <Mail size={18} className="text-gray-400" />
                                                <span className="text-lg text-deep-purple">{user?.email}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                {numberOfSeats} {numberOfSeats === 1 ? 'Guest Ticket' : 'Guest Tickets'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-3">
                                        <span className="w-8 h-[1px] bg-deep-purple"></span>
                                        Payment
                                    </h3>

                                    <div className="flex items-baseline justify-between mb-8">
                                        <span className="text-3xl font-serif font-bold">
                                            <span className="text-lg font-sans font-normal text-gray-400 mr-2">{workshop.pricing.currency}</span>
                                            {totalPrice.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-400">Total inc. taxes</span>
                                    </div>

                                    {error && (
                                        <div className="mb-6 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="w-full py-5 bg-deep-purple text-white text-lg font-medium rounded-2xl hover:bg-deep-purple/90 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <span className="relative z-10 flex items-center gap-2">
                                                Confirm & Pay with eSewa
                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </span>
                                        )}
                                    </button>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <CreditCard size={12} />
                                        <span>Secure 256-bit encrypted payment</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Checkout;
