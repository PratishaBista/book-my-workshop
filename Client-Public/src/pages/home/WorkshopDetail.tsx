import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { hostProfilePath } from '../../utils/hostProfile';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, MapPin,
    ChevronLeft, Star,
    Share2, Heart, CheckCircle2,
    Users, ShieldCheck,
    Maximize2,
    ArrowRight, CreditCard,
    Ban, ChevronDown, Check,
    ArrowUpRight, Loader2
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { type WorkshopDetail as IWorkshopDetail, PricingType } from '../../types/workshop';
import WorkshopMap from '../../components/workshop/WorkshopMap';

const WorkshopDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [workshop, setWorkshop] = useState<IWorkshopDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(''); // New State for Calendar View
    const [guests, setGuests] = useState(1);
    const [showLoginToast, setShowLoginToast] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [hostWorkshops, setHostWorkshops] = useState<any[]>([]);
    const [similarWorkshops, setSimilarWorkshops] = useState<any[]>([]);

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    
    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    let isCustomer = false;
    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length >= 2) {
                const payload = JSON.parse(atob(parts[1]));
                const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
                isCustomer = role === 'User';
            }
        } catch (e) { console.error(e); }
    }

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    useEffect(() => {
        setGuests(1);
    }, [selectedScheduleId]);

    const checkLogin = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setShowLoginToast(true);
            setTimeout(() => {
                setShowLoginToast(false);
                navigate('/login', { state: { from: location } });
            }, 1500);
            return false;
        }
        return true;
    };

    const handleReserve = () => {
        if (!checkLogin()) return;

        if (!selectedScheduleId || !workshop) {
            alert("Please select a date from the calendar.");
            return;
        }

        const selectedSchedule = workshop.upcomingSchedules.find(s => s.id === selectedScheduleId);
        if (!selectedSchedule) return;

        navigate('/checkout', {
            state: {
                workshop: workshop,
                schedule: selectedSchedule,
                numberOfSeats: guests
            }
        });
    };

    useEffect(() => {
        const fetchWorkshop = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${API_ENDPOINTS.workshop.public}/${id}`, {
                    headers
                });
                if (response.ok) {
                    const data = await response.json();
                    setWorkshop(data);
                    // Fetch related as well
                    fetchRelatedProducts(data);
                }
            } catch (error) {
                console.error('Error fetching workshop details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async (workshopId: number) => {
            try {
                setLoadingReviews(true);
                const response = await fetch(API_ENDPOINTS.workshop.review(workshopId));
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data.reviews);
                    setAverageRating(data.averageRating);
                    setTotalReviews(data.totalReviews);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoadingReviews(false);
            }
        };

        const fetchRelatedProducts = async (currentWorkshop: IWorkshopDetail) => {
            try {
                const hostRes = await fetch(API_ENDPOINTS.workshop.byProvider(currentWorkshop.provider.id));
                if (hostRes.ok) {
                    const otherHostWorkshops = await hostRes.json();
                    setHostWorkshops(otherHostWorkshops.filter((w: any) => w.id !== currentWorkshop.id));
                }

                const similarRes = await fetch(API_ENDPOINTS.workshop.related(currentWorkshop.id));
                if (similarRes.ok) {
                    const simWorkshops = await similarRes.json();
                    
                    setSimilarWorkshops(simWorkshops);
                }
            } catch (error) {
                console.error('Error fetching related workshops:', error);
            }
        };

        if (workshop) {
            fetchReviews(workshop.id);
        }

        fetchWorkshop();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (workshop && workshop.upcomingSchedules.length > 0 && !selectedDate) {
            const sorted = [...workshop.upcomingSchedules].sort((a, b) =>
                new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
            );
            setSelectedDate(sorted[0].startDateTime.split('T')[0]);
        }
    }, [workshop, selectedDate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-cream-base">
            <div className="w-16 h-1 bg-deep-purple/10 overflow-hidden rounded-full">
                <div className="w-1/2 h-full bg-deep-purple animate-[slide_1.5s_infinite]" />
            </div>
        </div>
    );

    if (!workshop) return null;

    const allMedia = [...workshop.media].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return a.displayOrder - b.displayOrder;
    });

    const getPricingLabel = (type: PricingType) => {
        return type === PricingType.PerGroup ? 'per group' : 'per guest';
    };

    return (
        <div className="min-h-screen bg-white text-deep-purple font-sans selection:bg-orange-100 selection:text-deep-purple">
            <Navbar />

            <div className="pt-32 pb-4 px-6 md:px-12 max-w-[1400px] mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-deep-purple transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to browse
                    </button>
                    <div className="flex gap-4">
                        <button className="p-2 rounded-full hover:bg-gray-50 transition-colors text-deep-purple">
                            <Share2 size={20} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={handleReserve}
                            className={`p-2 rounded-full hover:bg-gray-50 transition-colors ${showLoginToast ? 'text-primary-orange' : 'text-deep-purple'}`}
                        >
                            <Heart size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-6 mb-8"
                >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 ring-1 ring-gray-100 shadow-sm transition-all duration-700 hover:shadow-lg">
                        <img
                            src={workshop.provider.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(workshop.provider.businessName)}&background=random`}
                            alt={workshop.provider.businessName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-serif text-deep-purple leading-tight group-hover:text-primary-orange transition-colors">
                            {workshop.provider.businessName}
                        </h3>
                    </div>
                </motion.div>

                <div className="max-w-4xl mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        {workshop.categories.map(cat => (
                            <span key={cat.id} className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange bg-primary-orange/5 px-3 py-1 rounded-full">
                                {cat.name}
                            </span>
                        ))}
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {workshop.duration} Session
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-medium leading-none mb-4 text-deep-purple">
                        {workshop.title}
                    </h1>
                    {workshop.subtitle && (
                        <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl">
                            {workshop.subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="px-6 md:px-12 max-w-6xl mx-auto mb-20">
                {allMedia.length === 0 ? (
                    <div className="w-full aspect-[2/1] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <p className="text-gray-400 font-serif italic">No visuals available for this experience yet.</p>
                    </div>
                ) : (
                    <VisualNarrativeDisplay media={allMedia} />
                )}
            </div>

            <main className="px-6 md:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 pb-32">
                <div className="lg:col-span-7 space-y-24">
                    <div className="flex border-t border-b border-gray-100 py-8">
                        <div className="flex-1 pr-8 border-r border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Time</p>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-deep-purple" strokeWidth={1.5} />
                                <span className="text-lg font-medium">{workshop.duration}</span>
                            </div>
                        </div>
                        <div className="flex-1 px-8 border-r border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Capacity</p>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-deep-purple" strokeWidth={1.5} />
                                <span className="text-lg font-medium">1 - {workshop.maxCapacity} ppl</span>
                            </div>
                        </div>
                        <div className="flex-1 pl-8">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                            <div className="flex items-center gap-2">
                                <Star size={18} className="text-deep-purple" strokeWidth={1.5} />
                                <span className="text-lg font-medium">{workshop.averageRating?.toFixed(1) || 'New'}</span>
                            </div>
                        </div>
                    </div>

                    <section>
                        <h2 className="text-3xl font-serif font-medium mb-8">What you'll do</h2>
                        <div className={`prose prose-lg prose-headings:font-serif prose-p:text-gray-600 prose-p:font-light prose-p:leading-relaxed prose-li:text-gray-600 ${!isDescriptionExpanded ? 'line-clamp-[10]' : ''}`}>
                            <div dangerouslySetInnerHTML={{ __html: workshop.description }} />
                        </div>
                        {workshop.description.length > 500 && (
                            <button
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                className="mt-4 text-sm font-bold underline decoration-primary-orange decoration-2 underline-offset-4 hover:text-primary-orange transition-colors"
                            >
                                {isDescriptionExpanded ? 'Read Less' : 'Read Full Story'}
                            </button>
                        )}
                    </section>

                    {workshop.whatsIncluded && (
                        <section>
                            <h2 className="text-3xl font-serif font-medium mb-8">What's Included</h2>
                            <div className="bg-gray-50 rounded-3xl p-10">
                                <ul className="space-y-4">
                                    {workshop.whatsIncluded.split(',').map((item, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-deep-purple text-white flex items-center justify-center flex-shrink-0">
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                            <span className="text-lg text-deep-purple font-medium">{item.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    )}

                    <section className="flex items-start gap-6 border-t border-gray-100 pt-16">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            {workshop.provider.logoUrl ? (
                                <img src={workshop.provider.logoUrl} alt={workshop.provider.businessName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-serif text-gray-300">
                                    {workshop.provider.businessName[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Host</p>
                            <h3 className="text-2xl font-serif font-medium mb-2">{workshop.provider.businessName}</h3>
                            <p className="text-gray-600 font-light leading-relaxed mb-4 max-w-md line-clamp-4">
                                {workshop.provider.description?.trim() ||
                                    workshop.provider.tagline?.trim() ||
                                    workshop.provider.address ||
                                    'Learn more about who runs this workshop.'}
                            </p>
                            <Link
                                to={hostProfilePath(workshop.provider)}
                                className="inline-flex items-center gap-1 text-sm font-bold text-primary-orange border-b border-primary-orange/30 pb-0.5 hover:border-primary-orange transition-all"
                            >
                                Read more about the host
                            </Link>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-serif font-medium mb-6">Location</h2>
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-500">
                                <MapPin size={20} strokeWidth={1.5} />
                                <span>{workshop.locationName || workshop.locationAddress}</span>
                            </div>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(workshop.locationAddress)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-primary-orange hover:underline flex items-center gap-1"
                            >
                                Get Directions <ArrowUpRight size={14} />
                            </a>
                        </div>
                        {workshop.venueDescription && (
                            <p className="text-gray-600 italic mb-8 border-l-2 border-primary-orange pl-4">
                                {workshop.venueDescription}
                            </p>
                        )}
                        <div className="w-full h-[400px] bg-gray-100 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-sm border border-gray-100">
                            <WorkshopMap
                                latitude={workshop.latitude}
                                longitude={workshop.longitude}
                                address={workshop.locationAddress}
                                locationName={workshop.locationName}
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        {[
                            { id: 'whatToBring', label: 'What to bring', content: workshop.whatToBring },
                            { id: 'skillLevel', label: 'Skill level required', content: workshop.skillLevel },
                            { id: 'suitability', label: 'Suitability notes', content: workshop.suitability },
                            { id: 'policies', label: 'Policies & Cancellations', content: workshop.cancellationPolicy }
                        ].filter(s => s.content).map((section) => (
                            <div key={section.id} className="border-b border-gray-100 last:border-0 overflow-hidden">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full py-8 flex justify-between items-center group"
                                >
                                    <span className="text-2xl font-serif font-medium group-hover:text-primary-orange transition-colors">{section.label}</span>
                                    <div className={`p-2 rounded-full border border-gray-100 transition-all ${expandedSections.includes(section.id) ? 'rotate-180 bg-deep-purple text-white border-deep-purple' : ''}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {expandedSections.includes(section.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="pb-8 text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                                                {section.content}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </section>

                    <section className="pt-16 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div className="space-y-4">
                                <h2 className="text-5xl font-serif font-bold text-deep-purple">Verified Reviews</h2>
                            </div>
                            
                            {averageRating && (
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-4xl font-serif font-bold text-deep-purple leading-none mb-1">{averageRating.toFixed(1)} <span className="text-xl text-gray-300">/ 5</span></div>
                                        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">From {totalReviews} reviews</div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star 
                                                key={s} 
                                                size={24} 
                                                className={s <= Math.round(averageRating) ? 'fill-primary-orange text-primary-orange' : 'text-gray-100'} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {loadingReviews ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 className="animate-spin text-gray-200" size={32} />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="py-24 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-100 text-center px-10">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Star size={32} className="text-gray-200" strokeWidth={1} />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-deep-purple mb-2">Be the first to share</h3>
                                <p className="text-gray-500 font-light max-w-sm mx-auto">No reviews yet for this workshop. Be the first to attend and tell us your thoughts!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star 
                                                        key={s} 
                                                        size={14} 
                                                        className={s <= review.rating ? 'fill-primary-orange text-primary-orange' : 'text-gray-100'} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-green-100">
                                                <CheckCircle2 size={10} /> Verified
                                            </span>
                                        </div>
                                        
                                        <p className="text-lg text-deep-purple font-light leading-relaxed mb-6 italic">"{review.comment}"</p>

                                        {review.imageUrls?.length > 0 && (
                                            <div className="flex gap-2 mb-6 flex-wrap">
                                                {review.imageUrls.map((url: string, idx: number) => (
                                                    <a
                                                        key={idx}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100"
                                                    >
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 font-bold font-serif">
                                                {review.userName?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-deep-purple uppercase tracking-widest">{review.userName || 'Verified Attendee'}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100">
                            <div className="flex justify-between items-baseline mb-8">
                                <div>
                                    <span className="text-4xl font-serif font-medium">
                                        {workshop.pricing.currency === 'NPR' ? 'Rs.' : workshop.pricing.currency} {workshop.pricing.basePrice.toLocaleString()}
                                    </span>
                                    <span className="text-gray-400 ml-2">
                                        / <span className="lowercase">{getPricingLabel(workshop.pricing.pricingType)}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    Select Date & Time
                                </label>

                                {workshop.upcomingSchedules.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="flex gap-3 overflow-x-auto pt-6 pb-6 px-4 snap-x hide-scrollbar -mx-4">
                                            {Array.from(new Set(workshop.upcomingSchedules.map(s => s.startDateTime.split('T')[0])))
                                                .sort()
                                                .map(dateStr => {
                                                    const date = new Date(dateStr);
                                                    const isSelected = selectedDate === dateStr;
                                                    const hasAvailability = workshop.upcomingSchedules
                                                        .filter(s => s.startDateTime.startsWith(dateStr))
                                                        .some(s => !s.isSoldOut);

                                                    return (
                                                        <button
                                                            key={dateStr}
                                                            onClick={() => {
                                                                setSelectedDate(dateStr);
                                                                setSelectedScheduleId(null);
                                                            }}
                                                            className={`relative flex-shrink-0 snap-start flex flex-col items-center justify-center w-[4.5rem] h-[5.5rem] rounded-2xl border-2 transition-all duration-300 ${isSelected
                                                                ? hasAvailability
                                                                    ? 'border-deep-purple bg-deep-purple text-white shadow-lg shadow-deep-purple/20 scale-105'
                                                                    : 'border-red-500 bg-red-50 text-red-600 shadow-lg shadow-red-100 scale-105'
                                                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
                                                                }`}
                                                        >
                                                            {!hasAvailability && (
                                                                <div className="absolute -top-3 -right-2 bg-red-500 text-white text-[7.5px] font-black px-2 py-0.5 rounded-full shadow-xl transform rotate-[20deg] z-10 uppercase tracking-tighter border-2 border-white pointer-events-none">
                                                                    Sold Out
                                                                </div>
                                                            )}
                                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                            </span>
                                                            <span className={`text-2xl font-serif font-bold my-0.5 ${isSelected ? (hasAvailability ? 'text-white' : 'text-red-700') : 'text-gray-900'}`}>
                                                                {date.getDate()}
                                                            </span>
                                                            <span className="text-[10px] uppercase font-bold opacity-60">
                                                                {date.toLocaleDateString('en-US', { month: 'short' })}
                                                            </span>
                                                            <div className={`mt-1 w-1.5 h-1.5 rounded-full ${isSelected ? (hasAvailability ? 'bg-white' : 'bg-red-500') : hasAvailability ? 'bg-green-500' : 'bg-red-400/50'}`} />
                                                        </button>
                                                    );
                                                })}
                                        </div>

                                        <div className="space-y-3">
                                            {(() => {
                                                const hasAvailability = workshop.upcomingSchedules
                                                    .filter(s => s.startDateTime.startsWith(selectedDate))
                                                    .some(s => !s.isSoldOut);

                                                return (
                                                    <p className={`text-sm font-bold flex items-center gap-2 ${hasAvailability ? 'text-gray-900' : 'text-red-600'}`}>
                                                        {hasAvailability ? (
                                                            <Clock size={16} className="text-primary-orange" />
                                                        ) : (
                                                            <Ban size={16} className="text-red-500" />
                                                        )}
                                                        {hasAvailability
                                                            ? `Available Sessions for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                                                            : `No spots available for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                                                        }
                                                    </p>
                                                );
                                            })()}

                                            <div className="grid grid-cols-2 gap-3">
                                                {workshop.upcomingSchedules
                                                    .filter(s => s.startDateTime.startsWith(selectedDate))
                                                    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
                                                    .map(schedule => {
                                                        const startTime = new Date(schedule.startDateTime).getTime();
                                                        const cutoffMs = (workshop.bookingCutoffHours || 0) * 3600000;
                                                        const isLocked = (Date.now() >= (startTime - cutoffMs)) || schedule.isSoldOut;
                                                        const occupied = schedule.maxCapacity - schedule.availableSeats;
                                                        const occupancyPercent = (occupied / schedule.maxCapacity) * 100;
                                                        const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                        const isPendingPayment = workshop.pendingPaymentScheduleIds?.includes(schedule.id);
                                                        const isBooked = workshop.bookedScheduleIds?.includes(schedule.id);
                                                        const isReserved = isBooked || isPendingPayment;

                                                        return (
                                                            <button
                                                                key={schedule.id}
                                                                disabled={isLocked && !isReserved}
                                                                onClick={() => setSelectedScheduleId(schedule.id)}
                                                                className={`relative group flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-200 ${isBooked
                                                                    ? 'border-green-500 bg-green-500 text-white shadow-lg shadow-green-200'
                                                                    : isPendingPayment
                                                                        ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-200'
                                                                    : selectedScheduleId === schedule.id
                                                                        ? 'border-primary-orange bg-orange-50/50'
                                                                        : isLocked
                                                                            ? 'border-gray-50 bg-gray-50 opacity-60 cursor-not-allowed'
                                                                            : 'border-gray-100 bg-white hover:border-deep-purple/20 hover:shadow-md'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between w-full mb-2">
                                                                    <span className={`text-md font-bold font-mono tracking-tight ${isReserved ? 'text-white' : selectedScheduleId === schedule.id ? 'text-deep-purple' : 'text-gray-700'}`}>
                                                                        {formatTime(schedule.startDateTime)} - {formatTime(schedule.endDateTime)}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        {isReserved && <CheckCircle2 size={18} className="text-white" />}
                                                                        {!isReserved && selectedScheduleId === schedule.id && <CheckCircle2 size={18} className="text-primary-orange" />}
                                                                    </div>
                                                                </div>
                                                                <div className="w-full space-y-1.5">
                                                                    <div className={`flex justify-between text-[10px] uppercase font-bold tracking-wider ${isReserved ? (isBooked ? 'text-green-100' : 'text-amber-100') : 'text-gray-400'}`}>
                                                                        <span>{isBooked ? 'Reservation Confirmed' : isPendingPayment ? 'Payment Pending' : isLocked ? (schedule.isSoldOut ? 'Sold Out' : 'Closed') : 'Available'}</span>
                                                                        {!isReserved && <span>{schedule.availableSeats} spots left</span>}
                                                                    </div>
                                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all duration-500 ${schedule.isSoldOut ? 'bg-gray-300' :
                                                                                occupancyPercent > 80 ? 'bg-red-400' :
                                                                                    occupancyPercent > 50 ? 'bg-orange-400' : 'bg-green-400'
                                                                                }`}
                                                                            style={{ width: `${occupancyPercent}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                                        <p className="text-gray-400 text-sm italic">No open sessions at the moment.</p>
                                    </div>
                                )}
                            </div>

                            {selectedScheduleId
                                && !workshop.bookedScheduleIds?.includes(selectedScheduleId)
                                && !workshop.pendingPaymentScheduleIds?.includes(selectedScheduleId) && (
                                <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Guests</p>
                                            <p className="text-sm font-medium text-gray-700">How many are joining?</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white border border-gray-200 p-1.5 rounded-2xl">
                                            <button
                                                onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-bold text-lg">{guests}</span>
                                            <button
                                                onClick={() => {
                                                    const schedule = workshop.upcomingSchedules.find(s => s.id === selectedScheduleId);
                                                    if (schedule && guests < schedule.availableSeats) {
                                                        setGuests(prev => prev + 1);
                                                    }
                                                }}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-500">Total Price</p>
                                        <p className="text-2xl font-serif font-bold text-deep-purple">
                                            Rs {((workshop.pricing.basePrice || 0) * guests).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    const scheduleId = selectedScheduleId || -1;
                                    if (workshop.bookedScheduleIds?.includes(scheduleId)) {
                                        navigate('/profile?tab=bookings');
                                    } else {
                                        handleReserve();
                                    }
                                }}
                                disabled={loading || (isLoggedIn && !isCustomer)}
                                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden group
                                ${(isLoggedIn && !isCustomer)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        : workshop.bookedScheduleIds?.includes(selectedScheduleId || -1)
                                            ? 'bg-green-500 text-white hover:bg-green-600 shadow-xl shadow-green-500/10'
                                            : workshop.pendingPaymentScheduleIds?.includes(selectedScheduleId || -1)
                                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-xl shadow-amber-500/10'
                                            : 'bg-deep-purple text-white hover:bg-deep-purple/90 shadow-xl shadow-deep-purple/10 disabled:opacity-70 disabled:cursor-not-allowed'
                                    }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (isLoggedIn && !isCustomer) ? (
                                        'Available for Users Only'
                                    ) : workshop.bookedScheduleIds?.includes(selectedScheduleId || -1) ? (
                                        <>
                                            Already Booked
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    ) : workshop.pendingPaymentScheduleIds?.includes(selectedScheduleId || -1) ? (
                                        <>
                                            Complete Payment
                                            <CreditCard size={18} className="group-hover:scale-110 transition-transform" />
                                        </>
                                    ) : (
                                        <>
                                            Reserve Spot
                                            <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>

                            {workshop.bookedScheduleIds && workshop.bookedScheduleIds.length > 0 && !workshop.bookedScheduleIds.includes(selectedScheduleId || -1) && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center text-[11px] font-medium text-green-600 mt-3 flex items-center justify-center gap-1.5"
                                >
                                    <Star size={12} fill="currentColor" />
                                    Love this workshop? Book another session to master the craft!
                                </motion.p>
                            )}

                            {(isLoggedIn && !isCustomer) ? (
                                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-red-300 mt-2">
                                    Customers login only
                                </p>
                            ) : (
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <ShieldCheck size={12} className="text-green-500" />
                                        <span>Secure Payment</span>
                                    </div>
                                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <CreditCard size={12} />
                                        <span>eSewa Ready</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showLoginToast && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-deep-purple text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4"
                    >
                        <span>Please log in to reserve your spot.</span>
                        <ArrowUpRight size={18} />
                    </motion.div>
                )}
            </AnimatePresence>

            {hostWorkshops.length > 0 && (
                <div className="bg-gray-50 py-24 border-t border-gray-200">
                    <div className="px-6 md:px-12 max-w-[1400px] mx-auto space-y-16">
                        <div className="flex justify-between items-end">
                            <h2 className="text-4xl font-serif font-bold">More from {workshop.provider.businessName}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {hostWorkshops.slice(0, 3).map(w => (
                                <RelatedWorkshopCard key={w.id} workshop={w} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {similarWorkshops.length > 0 && (
                <div className="bg-white py-24 border-t border-gray-100">
                    <div className="px-6 md:px-12 max-w-[1400px] mx-auto space-y-16">
                        <div className="flex justify-between items-end">
                            <h2 className="text-4xl font-serif font-bold">You Might Also Enjoy</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {similarWorkshops.slice(0, 3).map(w => (
                                <RelatedWorkshopCard key={w.id} workshop={w} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

const VisualNarrativeDisplay = ({ media }: { media: any[] }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = media.filter(m => m.mediaType === 0);
    const video = media.find(m => m.mediaType === 1);

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [images.length]);

    if (images.length === 0 && !video) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:h-[500px]">
            {images.length > 0 && (
                <div className="relative h-[500px] md:h-full w-full rounded-2xl overflow-hidden bg-gray-100 group">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex].url}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full object-cover"
                            alt={`Workshop moment ${currentImageIndex + 1}`}
                        />
                    </AnimatePresence>
                </div>
            )}
            {video && (
                <div className="relative h-[300px] md:h-full w-full rounded-2xl overflow-hidden bg-gray-100">
                    <video src={video.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                </div>
            )}
        </div>
    );
};

const RelatedWorkshopCard = ({ workshop, navigate }: { workshop: any, navigate: any }) => (
    <div
        onClick={() => {
            navigate(`/workshop/${workshop.slug || workshop.id}`);
            window.scrollTo(0, 0);
        }}
        className="group cursor-pointer"
    >
        <div className="aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden mb-6 shadow-sm border border-gray-100 group-hover:shadow-lg transition-all relative">
            {workshop.primaryImageUrl ? (
                <img src={workshop.primaryImageUrl} alt={workshop.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
                <div className="w-full h-full bg-deep-purple/5 flex items-center justify-center text-deep-purple/20">
                    <Maximize2 size={48} strokeWidth={1} />
                </div>
            )}
        </div>
        <h4 className="text-xl font-serif font-bold group-hover:text-primary-orange transition-colors">{workshop.title}</h4>
        <p className="text-sm text-gray-400 mt-1">Starting from {workshop.currency} {workshop.basePrice.toLocaleString()}</p>
    </div>
);

export default WorkshopDetail;
