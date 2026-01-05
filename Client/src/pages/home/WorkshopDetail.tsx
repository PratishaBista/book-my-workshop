import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Share2, Heart, Clock,
    Users, Star, ShieldCheck, CheckCircle2,
    Calendar, ArrowRight, Play, Maximize2
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

interface WorkshopDetail {
    id: number;
    title: string;
    tagline?: string;
    description: string;
    duration: string;
    maxCapacity: number;
    minCapacity?: number;
    locationAddress: string;
    locationName?: string;
    category: { name: string };
    provider: { businessName: string; logoUrl?: string };
    pricing: { basePrice: number; currency: string };
    media: { id: number; mediaType: number; url: string; isPrimary: boolean }[];
    upcomingSchedules: { id: number; startDateTime: string; availableSeats: number }[];
    averageRating?: number;
    reviewCount: number;
    whatsIncluded?: string;
    safetyRequirements?: string;
}

const WorkshopDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [workshop, setWorkshop] = useState<WorkshopDetail | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);

    const [showLoginToast, setShowLoginToast] = useState(false);

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

    const handleReserve = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setShowLoginToast(true);
            setTimeout(() => {
                navigate('/login', { state: { from: location } });
            }, 1500);
            return;
        }

        let scheduleId = selectedScheduleId;

        if (!scheduleId) {
            if (workshop?.upcomingSchedules.length === 0) {
                if (!confirm("No live schedules available. Attempt to use Test ID 1?")) return;
                scheduleId = 1;
            } else {
                alert("Please select a date and time for your workshop.");
                return;
            }
        }

        try {
            setLoading(true); 
            console.log("Initiating payment for schedule:", scheduleId);

            const response = await fetch(API_ENDPOINTS.payment.initiate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    workshopScheduleId: scheduleId,
                    numberOfSeats: 1
                })
            });

            if (response.ok) {
                const paymentData = await response.json();
                console.log("Payment initialized, redirecting to eSewa...", paymentData);
                submitToEsewa(paymentData);
            } else {
                const errorText = await response.text();
                alert(`Booking Failed: ${errorText}`);
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert("Failed to initiate payment flow.");
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchWorkshop = async () => {
            try {
                const response = await fetch(`${API_ENDPOINTS.workshop.public}/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setWorkshop(data);
                }
            } catch (error) {
                console.error('Error fetching workshop details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkshop();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-cream-base">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
        </div>
    );

    if (!workshop) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream-base p-10 text-center">
            <h1 className="text-4xl font-serif text-deep-purple mb-4">Workshop Not Found</h1>
            <button onClick={() => navigate('/')} className="text-primary-orange font-bold hover:underline">Return to Discovery</button>
        </div>
    );

    const stories = workshop.media.filter(m => [2, 3].includes(m.mediaType));
    const standards = workshop.media.filter(m => [0, 1].includes(m.mediaType));
    const primaryImage = workshop.media.find(m => m.isPrimary) || standards[0] || stories[0];

    return (
        <div className="min-h-screen bg-cream-base text-deep-purple font-sans">
            <Navbar />

            <div className="relative h-[85vh] w-full overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={primaryImage?.url || 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&q=80&w=1600'}
                            alt={workshop.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-purple/80 via-deep-purple/20 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                    {showLoginToast && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-white text-deep-purple px-6 py-4 rounded-xl shadow-2xl border border-primary-orange flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary-orange/20 flex items-center justify-center text-primary-orange">
                                <Users size={16} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Account Required</h4>
                                <p className="text-xs text-deep-purple/60">Redirecting to login/register page...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute top-10 left-10 z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                <div className="absolute top-10 right-10 z-20 flex gap-4">
                    <button className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95">
                        <Share2 size={24} />
                    </button>
                    <button className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95">
                        <Heart size={24} />
                    </button>
                </div>

                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-7xl px-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        <span className="px-5 py-2 bg-primary-orange text-white text-xs font-bold uppercase tracking-widest rounded-full">
                            {workshop.category.name}
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] selection:bg-white selection:text-deep-purple">
                            {workshop.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 font-serif italic max-w-3xl mx-auto">
                            {workshop.tagline || workshop.description.substring(0, 100) + '...'}
                        </p>
                    </motion.div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-10 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">

                <div className="lg:col-span-8 space-y-20">

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 bg-white border border-deep-purple/5 rounded-[3rem] shadow-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary-orange">
                                <Clock size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Duration</span>
                            </div>
                            <p className="text-lg font-bold">{workshop.duration}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary-orange">
                                <Users size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Capacity</span>
                            </div>
                            <p className="text-lg font-bold">{workshop.maxCapacity} Guests</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary-orange">
                                <Star size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Rating</span>
                            </div>
                            <p className="text-lg font-bold">{workshop.averageRating?.toFixed(1) || 'No reviews'}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary-orange">
                                <ShieldCheck size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                            </div>
                            <p className="text-lg font-bold">Host Success</p>
                        </div>
                    </div>

                    {stories.length > 0 && (
                        <div className="space-y-10">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-4xl font-serif font-bold text-deep-purple">Visual Journey</h2>
                                    <p className="text-gray-500 mt-2 italic">A glimpse into the artist's world.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-12 h-1 bg-primary-orange" />
                                    <div className="w-4 h-1 bg-gray-200" />
                                </div>
                            </div>

                            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-10 px-10">
                                {stories.map((s, idx) => (
                                    <motion.div
                                        key={s.id}
                                        whileHover={{ y: -10 }}
                                        onClick={() => setActiveStoryIdx(idx)}
                                        className="relative min-w-[280px] aspect-[9/16] rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-xl"
                                    >
                                        <img src={s.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full border-2 border-white/50 backdrop-blur-md flex items-center justify-center text-white">
                                                    {s.mediaType === 3 ? <Play size={20} fill="#fff" /> : <Maximize2 size={20} />}
                                                </div>
                                                <span className="text-white text-xs font-bold uppercase tracking-wider">Expand Story</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        <h2 className="text-4xl font-serif font-bold text-deep-purple">The Experience</h2>
                        <div
                            className="text-xl text-gray-600 leading-relaxed font-sans prose prose-deep-purple max-w-none"
                            dangerouslySetInnerHTML={{ __html: workshop.description }}
                        />
                    </div>

                    {workshop.whatsIncluded && (
                        <div className="p-12 bg-white border border-gray-100 rounded-[3rem] space-y-8">
                            <h3 className="text-3xl font-serif font-bold text-deep-purple">Guest Perks</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                                {workshop.whatsIncluded.split(',').map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                                            <CheckCircle2 size={16} className="text-green-600" />
                                        </div>
                                        <span className="text-gray-600">{item.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4">
                    <div className="sticky top-10 space-y-8">
                        <div className="bg-white border border-deep-purple/10 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-deep-purple/5">
                            <div className="p-10 space-y-10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[11px] font-bold text-primary-orange uppercase tracking-widest mb-1 font-sans">Investment</p>
                                        <p className="text-4xl font-bold font-serif">{workshop.pricing.currency} {workshop.pricing.basePrice}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-bold text-gray-400 font-sans italic uppercase tracking-widest mb-1">Per Guest</p>
                                        <p className="text-xl font-medium line-through decoration-primary-orange/30 text-gray-300">NPR {workshop.pricing.basePrice * 1.2}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">

                                    <div className="space-y-6">
                                        <p className="text-sm font-bold text-deep-purple uppercase tracking-[0.2em] border-b border-gray-100 pb-4 font-sans">Available Sessions</p>
                                        {workshop.upcomingSchedules.length > 0 ? (
                                            workshop.upcomingSchedules.map(s => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => setSelectedScheduleId(s.id)}
                                                    className={`group flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer ${selectedScheduleId === s.id
                                                        ? 'border-primary-orange bg-primary-orange/10 ring-2 ring-primary-orange/20'
                                                        : 'border-gray-100 hover:border-primary-orange hover:bg-primary-orange/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-colors ${selectedScheduleId === s.id ? 'bg-primary-orange text-white' : 'bg-gray-50 text-primary-orange group-hover:bg-white'
                                                            }`}>
                                                            <Calendar size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold font-sans">{new Date(s.startDateTime).toLocaleDateString()}</p>
                                                            <p className="text-[11px] text-gray-400 font-sans font-bold uppercase tracking-widest">{new Date(s.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    {selectedScheduleId === s.id ? (
                                                        <div className="w-5 h-5 rounded-full bg-primary-orange flex items-center justify-center">
                                                            <CheckCircle2 size={12} className="text-white" />
                                                        </div>
                                                    ) : (
                                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-primary-orange transition-colors" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                                <p className="text-gray-400 italic text-sm font-sans">No upcoming dates scheduled yet.</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleReserve}
                                        className="w-full py-6 bg-deep-purple text-white rounded-3xl font-bold text-lg shadow-xl shadow-deep-purple/20 hover:bg-deep-purple/90 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {workshop.upcomingSchedules.length === 0 ? "Test Payment (Dummy Session)" : "Reserve Experience"}
                                    </button>

                                    <p className="text-center text-[11px] text-gray-400 font-sans font-bold uppercase tracking-widest italic decoration-primary-orange/50 underline">Secure Checkout Guaranteed</p>
                                </div>
                            </div>

                            <div className="p-10 bg-white border border-gray-100 rounded-[3rem] flex items-center gap-6 group">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center">
                                    {workshop.provider.logoUrl ? (
                                        <img src={workshop.provider.logoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-serif text-primary-orange">{workshop.provider.businessName[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">The Host</p>
                                    <h4 className="text-lg font-bold font-serif group-hover:text-primary-orange transition-colors">{workshop.provider.businessName}</h4>
                                    <button className="mt-2 text-xs font-bold text-deep-purple/60 hover:text-deep-purple transition-all border-b border-deep-purple/10 group-hover:border-primary-orange">View Artisan Profile</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {activeStoryIdx !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black flex items-center justify-center"
                    >
                        <button
                            onClick={() => setActiveStoryIdx(null)}
                            className="absolute top-10 right-10 z-50 p-4 bg-white/10 text-white rounded-full hover:bg-white/20"
                        >
                            <ChevronLeft size={30} className="rotate-225" />
                        </button>

                        <div className="relative w-full max-w-lg aspect-[9/16]">
                            <img
                                src={stories[activeStoryIdx].url}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="absolute bottom-10 flex gap-4">
                            {stories.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 transition-all duration-300 rounded-full ${i === activeStoryIdx ? 'w-12 bg-primary-orange' : 'w-4 bg-white/20'}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default WorkshopDetail;
