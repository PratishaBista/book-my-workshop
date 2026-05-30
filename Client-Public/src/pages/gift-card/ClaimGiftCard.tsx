import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Wallet, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

const ClaimGiftCard: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    
    const code = searchParams.get('code');
    const [giftCard, setGiftCard] = useState<any>(null);
    const [fetchingCard, setFetchingCard] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        
        if (!code) {
            setError("No gift card code was provided.");
            setFetchingCard(false);
            return;
        }

        if (!isAuthenticated) {
            // Redirect to login/signup and return here after successful authentication
            const currentPath = window.location.pathname + window.location.search;
            navigate(`/login?tab=signup&redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        fetchGiftCardDetails();
    }, [isAuthenticated, authLoading, code, navigate]);

    const fetchGiftCardDetails = async () => {
        try {
            setFetchingCard(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.giftCard.getByCode(code!), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGiftCard(data);
                if (data.status === 2) { 
                    setError("This gift card has already been claimed.");
                }
            } else {
                const errData = await response.json();
                setError(errData.message || "Failed to fetch gift card details. Make sure the code is correct.");
            }
        } catch (err) {
            console.error(err);
            setError("A network error occurred. Please refresh the page.");
        } finally {
            setFetchingCard(false);
        }
    };

    const handleClaim = async () => {
        if (!code) return;
        try {
            setClaiming(true);
            setError(null);
            const token = localStorage.getItem('token');

            const response = await fetch(API_ENDPOINTS.giftCard.claim, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            if (response.ok) {
                setClaimed(true);
            } else {
                const errData = await response.json();
                setError(errData.message || "Failed to claim the gift card.");
            }
        } catch (err) {
            console.error(err);
            setError("A network error occurred. Please try again.");
        } finally {
            setClaiming(false);
        }
    };

    const handleGoToWallet = () => {
        // Find user username from token or state to redirect to profile
        const token = localStorage.getItem('token');
        let username = '';
        if (token) {
            try {
                const parts = token.split('.');
                if (parts.length >= 2) {
                    const payload = JSON.parse(atob(parts[1]));
                    username = payload.profileUsername || payload.name;
                }
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
        if (username) {
            navigate(`/u/${username}?tab=wallet`);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col selection:bg-orange-100 selection:text-deep-purple">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <AnimatePresence mode="wait">
                        {fetchingCard || authLoading ? (
                            <motion.div 
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 space-y-4"
                            >
                                <Loader2 className="animate-spin text-primary-orange" size={40} />
                                <p className="text-gray-400 font-serif italic text-sm">Retrieving your gift voucher...</p>
                            </motion.div>
                        ) : error && !giftCard ? (
                            <motion.div 
                                key="error"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2rem] border border-red-100 p-8 text-center shadow-lg space-y-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                                    <AlertCircle size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-serif font-bold">Voucher Issue</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">{error}</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/')} 
                                    className="w-full py-4 bg-deep-purple text-white font-bold rounded-xl text-xs hover:bg-deep-purple/90 transition-colors"
                                >
                                    Go to Homepage
                                </button>
                            </motion.div>
                        ) : claimed ? (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2.5rem] border border-green-100 p-10 text-center shadow-xl space-y-8"
                            >
                                <div className="w-20 h-20 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={48} strokeWidth={2} />
                                </div>
                                <div className="space-y-3">
                                    <span className="text-[10px] font-mono font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
                                        Success
                                    </span>
                                    <h2 className="text-3xl font-serif font-bold text-deep-purple">
                                        Balance Claimed!
                                    </h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Rs. {giftCard?.amount.toLocaleString()} has been successfully added to your wallet. You can now use it on checkout!
                                    </p>
                                </div>
                                <button
                                    onClick={handleGoToWallet}
                                    className="w-full py-5 bg-deep-purple text-white text-base font-bold rounded-2xl shadow-xl shadow-deep-purple/10 hover:bg-primary-orange hover:shadow-primary-orange/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <Wallet size={18} />
                                    <span>View Wallet Balance</span>
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="gift-card-view"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {/* Voucher card */}
                                <div className="aspect-[1.58/1] w-full rounded-[2.5rem] bg-gradient-to-tr from-[#311E43] via-[#482869] to-[#6c3a9d] p-8 text-cream-base shadow-2xl relative overflow-hidden border border-white/10 flex flex-col justify-between">
                                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-xl pointer-events-none" />
                                    
                                    <div className="flex justify-between items-start z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                                <Gift className="text-white" size={18} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-mono font-bold tracking-widest text-amber-400">Voucher</span>
                                                <h4 className="text-[10px] font-semibold opacity-60">BOOK MY WORKSHOP</h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-serif font-bold text-amber-300">
                                                Rs. {giftCard?.amount.toLocaleString()}
                                            </div>
                                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">NRP Value</span>
                                        </div>
                                    </div>

                                    <div className="my-4 z-10">
                                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">From Sender</span>
                                        <p className="text-sm font-semibold truncate">{giftCard?.senderName || 'A generous sender'}</p>
                                        
                                        {giftCard?.personalMessage && (
                                            <p className="text-xs italic font-medium opacity-85 mt-2 line-clamp-2 leading-relaxed">
                                                "{giftCard.personalMessage}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/10 pt-4 z-10 text-[8px] font-medium opacity-50">
                                        <div>
                                            <p>Voucher code: {code}</p>
                                            <p>© 2026 BookMyWorkshop.</p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {giftCard?.status === 1 ? ( // Active
                                    <button
                                        onClick={handleClaim}
                                        disabled={claiming}
                                        className="w-full py-5 bg-primary-orange text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary-orange/20 hover:bg-primary-orange/95 hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-75"
                                    >
                                        {claiming ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Wallet size={20} />
                                                <span>Claim Voucher to Wallet</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="p-4 bg-gray-50 border border-gray-150 text-gray-500 rounded-xl text-center font-bold text-sm">
                                        This gift voucher is {giftCard?.status === 2 ? 'Already Claimed' : 'Inactive'}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ClaimGiftCard;
