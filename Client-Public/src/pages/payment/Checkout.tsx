import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import StripeCheckoutModal, {
    useStripeVerify,
    parseStripeInitiateResponse,
    readApiErrorMessage,
} from '../../components/payment/StripeCheckoutModal';
import {
    Calendar, MapPin, Clock, ArrowLeft, ShieldCheck,
    CreditCard, Loader2, Mail, User as UserIcon, Wallet, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

type PaymentProvider = 'esewa' | 'stripe';

const Checkout: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useWallet, setUseWallet] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('esewa');

    // Stripe state
    const [stripeModalOpen, setStripeModalOpen] = useState(false);
    const [stripeClientSecret, setStripeClientSecret] = useState('');
    const [stripePublishableKey, setStripePublishableKey] = useState('');

    useEffect(() => {
        if (!state?.workshop || !state?.schedule) {
            navigate('/', { replace: true });
        }
    }, [state, navigate]);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await fetch(API_ENDPOINTS.wallet.get, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setWalletBalance(data.balance);
                }
            } catch (err) {
                console.error("Error fetching wallet balance:", err);
            }
        };
        fetchWallet();
    }, []);

    // Stripe verification hook
    const { verifyPayment } = useStripeVerify({
        onVerified: (data) => {
            const type = data.type ?? data.Type;
            const bookingId = data.bookingId ?? data.BookingId;
            if (type === 'Booking' && bookingId) {
                navigate(`/payment/success?bookingId=${bookingId}`);
            } else {
                navigate('/payment/success');
            }
        },
    });

    if (!state?.workshop || !state?.schedule) return null;

    const { workshop, schedule, numberOfSeats = 1 } = state;
    const workshopDate = new Date(schedule.startDateTime);
    const totalPrice = workshop.pricing.basePrice * numberOfSeats;
    const walletAppliedAmount = useWallet ? Math.min(walletBalance, totalPrice) : 0;
    const finalPrice = totalPrice - walletAppliedAmount;

    // eSewa redirect 
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

    // Main payment handler 
    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            const bookingPayload = {
                workshopScheduleId: schedule.id,
                numberOfSeats: numberOfSeats,
                useWallet: useWallet,
            };

            const endpoint = paymentProvider === 'stripe'
                ? API_ENDPOINTS.payment.initiateStripe
                : API_ENDPOINTS.payment.initiate;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bookingPayload),
            });

            if (!response.ok) {
                setError(await readApiErrorMessage(response, 'Failed to initiate payment. Please try again.'));
                setLoading(false);
                return;
            }

            const paymentData = parseStripeInitiateResponse(await response.json());

            // Wallet covered everything
            if (paymentData.isFullyPaid) {
                const bookingId = paymentData.transactionUuid.replace('wallet-', '');
                navigate(`/payment/success?bookingId=${bookingId}`);
                return;
            }

            if (paymentProvider === 'stripe') {
                if (!paymentData.clientSecret || !paymentData.publishableKey) {
                    setError(
                        'Stripe did not return payment details. Check Stripe:SecretKey and Stripe:PublishableKey in API appsettings.'
                    );
                    setLoading(false);
                    return;
                }
                setStripeClientSecret(paymentData.clientSecret);
                setStripePublishableKey(paymentData.publishableKey);
                setStripeModalOpen(true);
                setLoading(false);
            } else {
                // Redirect to eSewa
                submitToEsewa(paymentData);
            }
        } catch (err) {
            console.error("Payment Error:", err);
            setError("Network error. Please check your connection.");
            setLoading(false);
        }
    };

    // Called when Stripe payment element succeeds
    const handleStripeSuccess = async (paymentIntentId: string) => {
        setStripeModalOpen(false);
        setLoading(true);
        setError(null);
        try {
            await verifyPayment(paymentIntentId);
        } catch (err: any) {
            setError(err.message || "Verification failed. Please contact support.");
        } finally {
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
                                {/* Contact Details */}
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

                                {/* Payment Section */}
                                <div className="pt-8 space-y-6">
                                    <h3 className="text-lg font-serif font-bold flex items-center gap-3">
                                        <span className="w-8 h-[1px] bg-deep-purple"></span>
                                        Payment
                                    </h3>

                                    {/* Wallet Balance */}
                                    {walletBalance > 0 && (
                                        <div className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useWallet}
                                                    onChange={(e) => setUseWallet(e.target.checked)}
                                                    className="w-4 h-4 rounded text-primary-orange focus:ring-primary-orange/50 border-gray-300"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-deep-purple flex items-center gap-1.5">
                                                        <Wallet size={14} className="text-emerald-500" />
                                                        Use Wallet Balance
                                                    </span>
                                                    <p className="text-xs text-gray-400 font-medium">Available: Rs. {walletBalance.toLocaleString()}</p>
                                                </div>
                                            </label>
                                            <span className="text-sm font-bold text-emerald-600">
                                                - Rs. {walletAppliedAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Payment Provider Selector and only show if there's a remaining amount */}
                                    {finalPrice > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Choose Payment Method</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* eSewa */}
                                                <button
                                                    onClick={() => setPaymentProvider('esewa')}
                                                    className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                                                        paymentProvider === 'esewa'
                                                            ? 'border-[#60BB46] bg-[#60BB46]/5 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    {paymentProvider === 'esewa' && (
                                                        <CheckCircle2 size={16} className="absolute top-2 right-2 text-[#60BB46]" />
                                                    )}
                                                    {/* eSewa logo text */}
                                                    <span className="text-2xl font-black" style={{ color: '#60BB46' }}>e</span>
                                                    <span className="text-xs font-bold text-gray-600">eSewa</span>
                                                    <span className="text-[10px] text-gray-400">Digital Wallet</span>
                                                </button>

                                                {/* Stripe */}
                                                <button
                                                    onClick={() => setPaymentProvider('stripe')}
                                                    className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                                                        paymentProvider === 'stripe'
                                                            ? 'border-[#635BFF] bg-[#635BFF]/5 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    {paymentProvider === 'stripe' && (
                                                        <CheckCircle2 size={16} className="absolute top-2 right-2 text-[#635BFF]" />
                                                    )}
                                                    <CreditCard size={22} className={paymentProvider === 'stripe' ? 'text-[#635BFF]' : 'text-gray-400'} />
                                                    <span className="text-xs font-bold text-gray-600">Card / Stripe</span>
                                                    <span className="text-[10px] text-gray-400">Visa, Mastercard</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Price Breakdown */}
                                    <div className="space-y-3 border-t border-b border-gray-100 py-4">
                                        <div className="flex justify-between text-sm font-semibold text-gray-500">
                                            <span>Subtotal</span>
                                            <span>Rs. {totalPrice.toLocaleString()}</span>
                                        </div>
                                        {useWallet && walletAppliedAmount > 0 && (
                                            <div className="flex justify-between text-sm font-semibold text-emerald-600">
                                                <span>Wallet Balance Applied</span>
                                                <span>- Rs. {walletAppliedAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-baseline pt-2">
                                            <span className="text-base font-bold">Total to Pay</span>
                                            <span className="text-3xl font-serif font-bold text-deep-purple">
                                                Rs. {finalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    {/* Pay Button */}
                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className={`w-full py-5 text-white text-lg font-bold rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden ${
                                            finalPrice === 0
                                                ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:opacity-95 shadow-xl shadow-emerald-600/10'
                                                : paymentProvider === 'stripe'
                                                    ? 'bg-[#635BFF] hover:bg-[#4F46E5] shadow-xl shadow-[#635BFF]/20'
                                                    : 'bg-deep-purple hover:bg-deep-purple/90'
                                        }`}
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <span className="relative z-10 flex items-center gap-2">
                                                {finalPrice === 0
                                                    ? 'Book Workshop with Wallet'
                                                    : paymentProvider === 'stripe'
                                                        ? 'Continue to Card Payment'
                                                        : 'Confirm & Pay with eSewa'
                                                }
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

            {/* Stripe Payment Modal */}
            <StripeCheckoutModal
                isOpen={stripeModalOpen}
                clientSecret={stripeClientSecret}
                publishableKey={stripePublishableKey}
                amount={finalPrice}
                onSuccess={handleStripeSuccess}
                onClose={() => {
                    setStripeModalOpen(false);
                    setLoading(false);
                }}
            />
        </div>
    );
};

export default Checkout;
