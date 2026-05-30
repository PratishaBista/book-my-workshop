import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Gift, MessageSquare, CreditCard, Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { API_ENDPOINTS } from '../../config/api';
import StripeCheckoutModal, {
    useStripeVerify,
    parseStripeInitiateResponse,
    readApiErrorMessage,
} from '../../components/payment/StripeCheckoutModal';

const GIFT_CARD_AMOUNTS = [1000, 2000, 3000, 4000, 5000];

const BuyGiftCard: React.FC = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState<number>(2000);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [personalMessage, setPersonalMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [paymentProvider, setPaymentProvider] = useState<'esewa' | 'stripe'>('esewa');

    // Stripe state
    const [stripeModalOpen, setStripeModalOpen] = useState(false);
    const [stripeClientSecret, setStripeClientSecret] = useState('');
    const [stripePublishableKey, setStripePublishableKey] = useState('');

    const { verifyPayment } = useStripeVerify({
        onVerified: (data) => {
            const type = data.type ?? data.Type;
            const giftCardId = data.giftCardId ?? data.GiftCardId;
            if (type === 'GiftCard' && giftCardId) {
                navigate(`/payment/success?giftCardId=${giftCardId}`);
            } else {
                navigate('/payment/success');
            }
        },
    });

    const validateEmail = (val: string) => {
        if (!val) return 'Recipient email is required';
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(val)) return 'Please enter a valid email address';
        return null;
    };

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

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const mailErr = validateEmail(recipientEmail);
        if (mailErr) {
            setEmailError(mailErr);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate(`/login?redirect=${encodeURIComponent('/gift-cards')}`);
                return;
            }

            if (paymentProvider === 'stripe') {
                // Call the Stripe gift card initiate endpoint
                const response = await fetch(API_ENDPOINTS.payment.initiateStripeGiftCard, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount,
                        recipientEmail,
                        personalMessage: personalMessage || undefined
                    })
                });

                if (response.ok) {
                    const raw = await response.json();
                    const data = parseStripeInitiateResponse(raw);
                    if (!data.clientSecret || !data.publishableKey) {
                        setError(
                            'Stripe did not return payment details. Check that Stripe keys are configured on the API server.'
                        );
                        return;
                    }
                    setStripeClientSecret(data.clientSecret);
                    setStripePublishableKey(data.publishableKey);
                    setStripeModalOpen(true);
                } else {
                    setError(await readApiErrorMessage(response, 'Failed to initiate Stripe payment.'));
                }
            } else {
                // eSewa: existing flow
                const response = await fetch(API_ENDPOINTS.giftCard.purchase, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount,
                        recipientEmail,
                        personalMessage: personalMessage || undefined
                    })
                });

                if (response.ok) {
                    const paymentData = await response.json();
                    submitToEsewa(paymentData);
                } else {
                    setError(await readApiErrorMessage(response, 'Failed to initiate gift card purchase.'));
                }
            }
        } catch (err) {
            console.error("Purchase error:", err);
            setError("A network error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStripeSuccess = async (paymentIntentId: string) => {
        setStripeModalOpen(false);
        setLoading(true);
        try {
            await verifyPayment(paymentIntentId);
        } catch (err: any) {
            setError(err.message || "Verification failed. Please contact support.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col selection:bg-orange-100 selection:text-deep-purple">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-deep-purple">
                            Gift Creative Experiences
                        </h1>
                        <p className="text-lg text-gray-500 font-light leading-relaxed">
                            Send a beautifully printable, virtual gift card to your loved ones. They can redeem it for any workshop on our platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                        {/* Form controls */}
                        <div className="lg:col-span-6 space-y-10">
                            <form onSubmit={handlePurchase} className="space-y-8">
                                {/* Amount Selector */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                        Select Card Value (NRP)
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {GIFT_CARD_AMOUNTS.map((val) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setAmount(val)}
                                                className={`py-4 rounded-xl border font-bold text-sm tracking-tight transition-all duration-300 ${amount === val
                                                        ? 'bg-deep-purple text-cream-base border-deep-purple shadow-lg scale-[1.03]'
                                                        : 'bg-white text-deep-purple border-gray-150 hover:border-deep-purple/40'
                                                    }`}
                                            >
                                                Rs. {val.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Recipient Email */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                        Recipient Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={recipientEmail}
                                            onChange={(e) => {
                                                setRecipientEmail(e.target.value);
                                                if (emailError) setEmailError(null);
                                            }}
                                            placeholder="recipient@example.com"
                                            className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white border ${emailError ? 'border-red-400' : 'border-gray-200'
                                                } focus:outline-none focus:ring-2 focus:ring-primary-orange/50 transition-shadow`}
                                        />
                                    </div>
                                    {emailError && <p className="text-xs text-red-500 font-semibold mt-1">{emailError}</p>}
                                </div>

                                {/* Personal Message */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                        Personal Message (Optional)
                                    </label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                                        <textarea
                                            value={personalMessage}
                                            onChange={(e) => setPersonalMessage(e.target.value)}
                                            placeholder="Write a sweet note here..."
                                            maxLength={200}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 transition-shadow resize-none h-32"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                                        {error}
                                    </div>
                                )}

                                {/* Payment Method Selector */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                        Payment Method
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentProvider('esewa')}
                                            className={`relative py-3 px-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${paymentProvider === 'esewa'
                                                    ? 'border-[#60BB46] bg-[#60BB46]/5'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            {paymentProvider === 'esewa' && (
                                                <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#60BB46]" />
                                            )}
                                            <span className="text-2xl font-black" style={{ color: '#60BB46' }}>e</span>
                                            <span className="text-xs font-bold text-gray-600">eSewa</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentProvider('stripe')}
                                            className={`relative py-3 px-4 rounded-xl border-2 flex flex-col items-center gap-1 ${paymentProvider === 'stripe'
                                                    ? 'border-[#635BFF] bg-[#635BFF]/5'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            {paymentProvider === 'stripe' && (
                                                <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#635BFF]" />
                                            )}
                                            <CreditCard size={20} className={paymentProvider === 'stripe' ? 'text-[#635BFF]' : 'text-gray-400'} />
                                            <span className="text-xs font-bold text-gray-600">Card / Stripe</span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-5 text-white text-lg font-bold rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed ${paymentProvider === 'stripe'
                                            ? 'bg-[#635BFF] hover:bg-[#4F46E5] shadow-[#635BFF]/20'
                                            : 'bg-primary-orange hover:bg-primary-orange/95 shadow-primary-orange/20'
                                        }`}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            <span>
                                                {paymentProvider === 'stripe'
                                                    ? `Pay Rs. ${amount.toLocaleString()} with Card`
                                                    : `Pay Rs. ${amount.toLocaleString()} with eSewa`
                                                }
                                            </span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Live Preview */}
                        <div className="lg:col-span-6 flex flex-col justify-top items-center">
                            <div className="w-full max-w-md space-y-6">

                                {/* Gift Card */}
                                <motion.div
                                    className="aspect-[1.58/1] w-full rounded-[2.5rem] bg-gradient-to-tr from-[#311E43] via-[#b49e47] to-[#8d66b4] p-8 text-cream-base shadow-2xl relative overflow-hidden border border-white/10 flex flex-col justify-between"
                                    layout
                                >
                                    {/* More card styling */}
                                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-xl pointer-events-none" />
                                    <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-pink-500 to-[#311E43] opacity-20 blur-xl pointer-events-none" />

                                    {/* Top Header */}
                                    <div className="flex justify-between items-start z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                                <Gift className="text-white" size={18} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold font-mono tracking-widest uppercase text-amber-400">Gift Voucher</span>
                                                <h4 className="text-[10px] font-sans font-semibold tracking-wider opacity-60">BOOK MY WORKSHOP</h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl md:text-3xl font-serif font-bold text-amber-300">
                                                Rs. {amount.toLocaleString()}
                                            </div>
                                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">NRP Value</span>
                                        </div>
                                    </div>

                                    {/* Middle Personalization */}
                                    <div className="my-6 z-10">
                                        {recipientEmail ? (
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">For Recipient</span>
                                                <p className="text-sm font-semibold truncate max-w-[320px]">{recipientEmail}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm italic opacity-40 font-light">Enter recipient email...</p>
                                        )}

                                        {personalMessage && (
                                            <p className="text-xs italic font-medium opacity-85 mt-2 line-clamp-2 max-w-[320px] leading-relaxed">
                                                "{personalMessage}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Bottom Info / QR */}
                                    <div className="flex justify-between items-end border-t border-white/10 pt-4 z-10">
                                        <div className="text-[8px] font-medium opacity-50 space-y-1">
                                            <p>This voucher is valid for all creative workshops.</p>
                                            <p>© 2026 BookMyWorkshop. All rights reserved.</p>
                                        </div>
                                        {/* Mock QR code container */}
                                        <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-md">
                                            {/* Stylized QR placeholder */}
                                            <div className="w-full h-full border border-dashed border-deep-purple/20 flex flex-wrap gap-0.5 justify-center items-center">
                                                <div className="w-2.5 h-2.5 bg-deep-purple rounded-sm" />
                                                <div className="w-2.5 h-2.5 bg-deep-purple rounded-sm" />
                                                <div className="w-2.5 h-2.5 bg-deep-purple rounded-sm" />
                                                <div className="w-2.5 h-2.5 bg-deep-purple rounded-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Stripe Modal */}
            <StripeCheckoutModal
                isOpen={stripeModalOpen}
                clientSecret={stripeClientSecret}
                publishableKey={stripePublishableKey}
                amount={amount}
                onSuccess={handleStripeSuccess}
                onClose={() => {
                    setStripeModalOpen(false);
                    setLoading(false);
                }}
            />
        </div>
    );
};

export default BuyGiftCard;
