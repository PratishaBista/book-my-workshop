import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Share2, Heart, Clock,
    Users, Star, MapPin, ArrowUpRight,
    Check, ChevronDown,
    ShieldCheck, CheckCircle2,
    Maximize2
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { type WorkshopDetail as IWorkshopDetail, WorkshopType, PricingType } from '../../types/workshop';
import WorkshopMap from '../../components/workshop/WorkshopMap';

const WorkshopDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [workshop, setWorkshop] = useState<IWorkshopDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    const [showLoginToast, setShowLoginToast] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [hostWorkshops, setHostWorkshops] = useState<any[]>([]);
    const [similarWorkshops, setSimilarWorkshops] = useState<any[]>([]);

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
                alert("Please select a date from the calendar.");
                return;
            }
        }

        try {
            setLoading(true);
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
                    // Fetch related as well
                    fetchRelatedProducts(data);
                }
            } catch (error) {
                console.error('Error fetching workshop details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedProducts = async (currentWorkshop: IWorkshopDetail) => {
            try {
                const hostRes = await fetch(API_ENDPOINTS.workshop.byProvider(currentWorkshop.provider.id));
                if (hostRes.ok) {
                    const otherHostWorkshops = await hostRes.json();
                    setHostWorkshops(otherHostWorkshops.filter((w: any) => w.id !== currentWorkshop.id));
                }

                const similarRes = await fetch(API_ENDPOINTS.workshop.recommendations(currentWorkshop.id));
                if (similarRes.ok) {
                    const simWorkshops = await similarRes.json();

                    console.group('Similar workshops found');
                    console.log('Source Workshop:', currentWorkshop.title);
                    console.log('Resulting Recommendations:');
                    console.table(simWorkshops.map((w: any) => ({
                        id: w.id,
                        title: w.title,
                        category: w.categories?.[0]?.name || 'N/A',
                        score: w.recommendationScore?.toFixed(4) || 'N/A'
                    })));
                    console.groupEnd();

                    setSimilarWorkshops(simWorkshops);
                }
            } catch (error) {
                console.error('Error fetching related workshops:', error);
            }
        };

        fetchWorkshop();
        window.scrollTo(0, 0);
    }, [id]);

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

    const getWorkshopTypeName = (type: WorkshopType) => {
        switch (type) {
            case WorkshopType.PublicClass: return 'Public Workshop';
            case WorkshopType.Experience: return 'Immersive Experience';
            case WorkshopType.Private: return 'Private Session';
            default: return 'Workshop';
        }
    };

    const getPricingLabel = (type: PricingType) => {
        return type === PricingType.PerGroup ? 'per group' : 'per guest';
    };

    return (
        <div className="min-h-screen bg-white text-deep-purple font-sans selection:bg-orange-100 selection:text-deep-purple">
            <Navbar />

            <div className="pt-32 pb-8 px-6 md:px-12 max-w-[1400px] mx-auto">
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
                        <button className="p-2 rounded-full hover:bg-gray-50 transition-colors text-deep-purple">
                            <Heart size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-4">
                        {workshop.categories.map(cat => (
                            <span key={cat.id} className="text-xs font-bold tracking-widest uppercase text-primary-orange">
                                {cat.name}
                            </span>
                        ))}
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                            {getWorkshopTypeName(workshop.workshopType)}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] mb-6">
                        {workshop.title}
                    </h1>
                    {workshop.subtitle && (
                        <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl">
                            {workshop.subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="px-6 md:px-12 max-w-[1400px] mx-auto mb-20">
                {allMedia.length === 0 ? (
                    <div className="w-full aspect-[2/1] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <p className="text-gray-400 font-serif italic">No visuals available for this experience yet.</p>
                    </div>
                ) : (
                    <div className={`grid gap-4 w-full aspect-[4/3] md:aspect-[2/1] rounded-2xl overflow-hidden ${allMedia.length === 1 ? 'grid-cols-1' :
                        allMedia.length === 2 ? 'grid-cols-2' :
                            'grid-cols-1 md:grid-cols-3 md:grid-rows-2'
                        }`}>
                        <div className={`${allMedia.length > 2 ? 'md:col-span-2 md:row-span-2' : ''} relative group`}>
                            {allMedia[0].mediaType === 0 ? (
                                <img src={allMedia[0].url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Primary visual" />
                            ) : (
                                <video src={allMedia[0].url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                            )}
                        </div>

                        {allMedia.slice(1, 3).map((media, idx) => (
                            <div key={media.id} className="relative group hidden md:block">
                                {media.mediaType === 0 ? (
                                    <img src={media.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Visual ${idx + 2}`} />
                                ) : (
                                    <video src={media.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                )}
                            </div>
                        ))}
                    </div>
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
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Group</p>
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
                        <h2 className="text-3xl font-serif font-medium mb-8">The Experience</h2>
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
                            <p className="text-gray-600 font-light leading-relaxed mb-4 max-w-md">
                                {workshop.provider.address || "Passionate expert bringing unique creative experiences to the community."}
                            </p>
                            <button className="text-sm font-bold border-b border-gray-300 pb-0.5 hover:border-deep-purple transition-all">
                                View Profile & Other Workshops
                            </button>
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

                </div>


                <div className="lg:col-span-5 relative">
                    <div className="sticky top-24">
                        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] ring-1 ring-gray-100">

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
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Select Date
                                </label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {workshop.upcomingSchedules.length > 0 ? (
                                        workshop.upcomingSchedules.map(schedule => (
                                            <button
                                                key={schedule.id}
                                                disabled={schedule.isSoldOut}
                                                onClick={() => setSelectedScheduleId(schedule.id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedScheduleId === schedule.id
                                                    ? 'border-deep-purple bg-deep-purple text-white shadow-lg'
                                                    : 'border-gray-100 hover:border-gray-300 bg-white text-deep-purple'
                                                    } ${schedule.isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="text-left">
                                                    <span className="block font-bold text-sm">
                                                        {new Date(schedule.startDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className={`text-xs ${selectedScheduleId === schedule.id ? 'text-white/80' : 'text-gray-400'}`}>
                                                        {new Date(schedule.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {selectedScheduleId === schedule.id && (
                                                    <Check size={16} strokeWidth={3} />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-sm text-gray-400">
                                            No dates currently available.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleReserve}
                                disabled={loading || (isLoggedIn && !isCustomer)}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors mb-4 shadow-lg
                                    ${(isLoggedIn && !isCustomer)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                        : 'bg-primary-orange text-white hover:bg-orange-600 shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed'
                                    }`}
                            >
                                {loading ? 'Processing...' : (isLoggedIn && !isCustomer) ? 'Available for Users Only' : 'Reserve Spot'}
                            </button>

                            {(isLoggedIn && !isCustomer) ? (
                                <p className="text-center text-xs text-red-400">
                                    Please login as a customer to book.
                                </p>
                            ) : (
                                <p className="text-center text-xs text-gray-400">
                                    You won't be charged yet.
                                </p>
                            )}
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-6 text-gray-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <span className="text-xs font-medium border border-gray-200 px-3 py-1 rounded-full flex items-center gap-1">
                                <ShieldCheck size={12} /> Secure Payment
                            </span>
                            <span className="text-xs font-medium border border-gray-200 px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={12} /> Verified Host
                            </span>
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
                            <div className="space-y-4">
                                <h2 className="text-4xl font-serif font-bold">More from {workshop.provider.businessName}</h2>
                            </div>
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
                            <div className="space-y-4">
                                <h2 className="text-4xl font-serif font-bold">You Might Also Enjoy</h2>
                            </div>
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

