import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    const hasRun = React.useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const verifyEmail = async () => {
            const token = searchParams.get('token');
            const email = searchParams.get('email');

            if (!token || !email) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                const response = await fetch('https://localhost:7166/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, token })
                });

                let rawData = await response.text();
                let parsedData: any = {};
                try {
                    parsedData = JSON.parse(rawData);
                } catch (e) {
                    // Ignore
                }

                if (response.ok) {
                    setStatus('success');
                    setMessage('Email verified successfully! Redirecting to login...');
                    setTimeout(() => {
                        if (parsedData.isProvider) {
                            window.location.href = 'http://localhost:5174/login';
                        } else {
                            navigate('/login');
                        }
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(parsedData.message || rawData || 'Verification failed. Please try again.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error. Please try again later.');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-cream-base flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
            >
                {status === 'verifying' && (
                    <>
                        <Loader className="w-16 h-16 mx-auto text-primary-orange animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-deep-purple mb-2">Verifying...</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                        <h2 className="text-2xl font-bold text-deep-purple mb-2">Success!</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
                        <h2 className="text-2xl font-bold text-deep-purple mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-primary-orange text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                        >
                            Go to Login
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
