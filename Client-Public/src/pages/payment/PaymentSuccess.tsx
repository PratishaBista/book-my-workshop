import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

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

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Payment confirmed! Your spot is reserved. Redirecting...');
                setTimeout(() => navigate('/profile/bookings'), 3000);
            } else {
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
        <div className="min-h-screen bg-cream-base flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-6">

                    {status === 'verifying' && (
                        <>
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary-orange/10 flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary-orange" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-deep-purple">Processing...</h2>
                            <p className="text-gray-500">Please wait while we confirm your payment securely.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="text-green-600" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-deep-purple">Booking Confirmed!</h2>
                            <p className="text-gray-500">{message}</p>
                            <Link
                                to="/"
                                className="inline-block mt-4 px-8 py-3 bg-deep-purple text-white rounded-xl font-bold hover:bg-deep-purple/90 transition-all"
                            >
                                Continue Exploring
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="text-red-600" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-deep-purple">Verification Failed</h2>
                            <p className="text-gray-500">{message}</p>
                            <Link
                                to="/"
                                className="inline-block mt-4 px-8 py-3 border border-deep-purple/20 text-deep-purple rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Return Home
                            </Link>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentSuccess;
