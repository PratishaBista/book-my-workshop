import React, { useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Loader2, X, ShieldCheck, CreditCard } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';

interface StripeFormProps {
    onSuccess: (paymentIntentId: string) => void;
    onCancel: () => void;
    amount: number;
}

const StripeForm: React.FC<StripeFormProps> = ({ onSuccess, onCancel, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message ?? 'Payment submission failed.');
            setProcessing(false);
            return;
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (confirmError) {
            setError(confirmError.message ?? 'Payment failed. Please try again.');
            setProcessing(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            setError('Payment did not complete. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                    }}
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Powered by Stripe · 256-bit encrypted</span>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="flex-1 py-3 rounded-2xl bg-[#635BFF] hover:bg-[#4F46E5] text-white font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#635BFF]/20"
                >
                    {processing ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            <CreditCard size={18} />
                            Pay Rs. {amount.toLocaleString()}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

interface StripeCheckoutModalProps {
    isOpen: boolean;
    clientSecret: string;
    publishableKey: string;
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    onClose: () => void;
}

/** Normalize API JSON (camelCase or PascalCase) from Stripe initiate endpoints. */
export function parseStripeInitiateResponse(data: Record<string, unknown>) {
    return {
        clientSecret: String(data.clientSecret ?? data.ClientSecret ?? ''),
        publishableKey: String(data.publishableKey ?? data.PublishableKey ?? ''),
        paymentIntentId: String(data.paymentIntentId ?? data.PaymentIntentId ?? ''),
        isFullyPaid: Boolean(data.isFullyPaid ?? data.IsFullyPaid),
        transactionUuid: String(data.transactionUuid ?? data.TransactionUuid ?? ''),
    };
}

export async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
    const text = await response.text();
    if (!text) return fallback;
    try {
        const body = JSON.parse(text);
        return (
            body.message ||
            body.Message ||
            body.title ||
            (Array.isArray(body.errors) ? body.errors.join(', ') : null) ||
            fallback
        );
    } catch {
        return text.length > 200 ? `${text.slice(0, 200)}…` : text;
    }
}

const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
    isOpen,
    clientSecret,
    publishableKey,
    amount,
    onSuccess,
    onClose,
}) => {
    const stripePromise = useMemo(
        () => (publishableKey?.trim() ? loadStripe(publishableKey.trim()) : null),
        [publishableKey]
    );

    if (!isOpen || !clientSecret?.trim() || !publishableKey?.trim() || !stripePromise) return null;

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#635BFF',
            colorBackground: '#ffffff',
            colorText: '#1a1a2e',
            borderRadius: '12px',
            fontFamily: '"Inter", system-ui, sans-serif',
        },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-xl bg-[#635BFF]/10 flex items-center justify-center">
                                    <CreditCard size={16} className="text-[#635BFF]" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Pay with Card</h2>
                            </div>
                            <p className="text-sm text-gray-400 ml-11">
                                Secure payment via Stripe
                            </p>
                        </div>

                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret, appearance }}
                        >
                            <StripeForm
                                amount={amount}
                                onSuccess={onSuccess}
                                onCancel={onClose}
                            />
                        </Elements>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// initiate Stripe payment intent for a booking

interface UseStripePaymentOptions {
    onVerified: (data: any) => void;
}

export function useStripeVerify({ onVerified }: UseStripePaymentOptions) {
    const verifyPayment = async (paymentIntentId: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.payment.verifyStripe, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ paymentIntentId }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Stripe verification failed.');
        }

        const data = await response.json();
        onVerified(data);
    };

    return { verifyPayment };
}

export default StripeCheckoutModal;
