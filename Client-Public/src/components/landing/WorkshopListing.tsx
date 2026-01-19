import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

const locations = ["All", "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan"];

interface Workshop {
    id: number;
    title: string;
    slug: string;
    locationName: string;
    locationAddress: string; 
    categoryName: string;
    basePrice: number;
    currency: string;
    primaryImageUrl: string;
    averageRating: number | null;
    reviewCount: number;
}

const WorkshopListing: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("All");
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState<number[]>([]);

    useEffect(() => {
        const fetchWorkshops = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_ENDPOINTS.workshop.public}`);
                if (response.ok) {
                    const data = await response.json();
                    setWorkshops(data);
                }
            } catch (error) {
                console.error('Error fetching workshops:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkshops();
    }, []);

    const toggleWishlist = (id: number) => {
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const filteredWorkshops = workshops.filter(w => {
        if (activeTab === "All") return true;

        const term = activeTab.toLowerCase();
        const inName = (w.locationName || "").toLowerCase().includes(term);
        const inAddress = (w.locationAddress || "").toLowerCase().includes(term);

        return inName || inAddress;
    });

    return (
        <section className="py-24 md:py-32 px-6 bg-[#F9F9F5]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 border-b border-deep-purple/10 pb-8">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-serif text-deep-purple leading-none tracking-tight mb-4">
                            Upcoming <br /> Sessions
                        </h2>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-2 mt-8 md:mt-0 no-scrollbar">
                        {locations.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => setActiveTab(loc)}
                                className={`text-lg transition-colors relative pb-1 whitespace-nowrap ${activeTab === loc
                                    ? 'text-deep-purple font-medium border-b-2 border-primary-orange'
                                    : 'text-deep-purple/40 hover:text-deep-purple'
                                    }`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
                        </div>
                    ) : filteredWorkshops.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-deep-purple/40 font-serif text-2xl italic">No sessions found in {activeTab} yet.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredWorkshops.map((workshop) => (
                                <motion.div
                                    key={workshop.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.4 }}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/workshop/${workshop.slug || workshop.id}`)}
                                >
                                    <div className="relative aspect-[4/3] mb-6 overflow-hidden bg-gray-200">
                                        {workshop.primaryImageUrl ? (
                                            <img
                                                src={workshop.primaryImageUrl}
                                                alt={workshop.title}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-deep-purple/10 to-primary-orange/10 flex items-center justify-center">
                                                <span className="text-deep-purple/20 font-serif text-4xl">Image</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(workshop.id); }}
                                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                className={`w-5 h-5 transition-colors ${wishlist.includes(workshop.id) ? 'fill-primary-orange stroke-primary-orange' : 'fill-transparent stroke-gray-900'}`}
                                                strokeWidth="2"
                                            >
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-deep-purple/40 border-b border-deep-purple/10 pb-3">
                                            <span>{workshop.categoryName}</span>
                                            <div className='flex items-center gap-1'>
                                                <span>★ {workshop.averageRating?.toFixed(1) || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-serif text-deep-purple leading-tight group-hover:text-primary-orange transition-colors line-clamp-2">
                                            {workshop.title}
                                        </h3>

                                        <div className="flex items-center justify-between mt-2 font-sans">
                                            <span className="text-deep-purple/60 text-sm">{workshop.locationName}</span>
                                            <span className="font-semibold text-deep-purple text-lg">{workshop.currency} {workshop.basePrice}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <div className="mt-20 border-t border-deep-purple/10 pt-8 flex justify-end">
                    <button className="text-xl font-serif italic text-deep-purple transition-colors flex items-center gap-2 group">
                        See all workshops
                        <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WorkshopListing;