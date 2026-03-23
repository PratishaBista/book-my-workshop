import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

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
    recommendationScore?: number;
}

interface WorkshopSectionProps {
    title: string;
    subtitle?: string;
    workshops: Workshop[];
    loading: boolean;
    onWorkshopClick: (slugOrId: string) => void;
}

const WorkshopSection: React.FC<WorkshopSectionProps> = ({ title, subtitle, workshops, loading, onWorkshopClick }) => {
    const [wishlist, setWishlist] = useState<number[]>([]);

    const toggleWishlist = (id: number) => {
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
            </div>
        );
    }

    if (workshops.length === 0) return null;

    return (
        <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-deep-purple/10 pb-8">
                <div>
                    <h2 className="text-4xl md:text-6xl font-serif text-deep-purple leading-none tracking-tight mb-2">
                        {title}
                    </h2>
                    {subtitle && <p className="text-deep-purple/60 font-sans text-lg italic">{subtitle}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                <AnimatePresence mode="popLayout">
                    {workshops.map((workshop) => (
                        <motion.div
                            key={workshop.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="group cursor-pointer"
                            onClick={() => onWorkshopClick(workshop.slug || workshop.id.toString())}
                        >
                            <div className="relative aspect-[4/3] mb-6 overflow-hidden bg-gray-200 rounded-sm shadow-sm">
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
                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors z-10"
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
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-deep-purple/40 border-b border-deep-purple/5 pb-3">
                                    <span>{workshop.categoryName}</span>
                                    <div className='flex items-center gap-1.5'>
                                        <span className="text-primary-orange">★</span>
                                        <span>{workshop.averageRating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-serif text-deep-purple leading-tight group-hover:text-primary-orange transition-colors line-clamp-2">
                                    {workshop.title}
                                </h3>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-deep-purple/50 text-xs font-sans tracking-wide">{workshop.locationName}</span>
                                    <span className="font-bold text-deep-purple text-xl">
                                        <span className="text-xs font-normal opacity-50 mr-1">{workshop.currency}</span>
                                        {workshop.basePrice}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const WorkshopListing: React.FC = () => {
    const navigate = useNavigate();
    const [personalized, setPersonalized] = useState<Workshop[]>([]);
    const [featured, setFeatured] = useState<Workshop[]>([]);
    const [latest, setLatest] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState({ personalized: true, featured: true, latest: true });

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPersonalized = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.workshop.userRecommendations, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (response.ok) {
                    const data = await response.json();
                    setPersonalized(data);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoading(prev => ({ ...prev, personalized: false }));
            }
        };

        const fetchFeatured = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.workshop.featured);
                if (response.ok) {
                    const data = await response.json();
                    setFeatured(data);
                }
            } catch (error) {
                console.error('Error fetching featured:', error);
            } finally {
                setLoading(prev => ({ ...prev, featured: false }));
            }
        };

        const fetchLatest = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.workshop.public);
                if (response.ok) {
                    const data = await response.json();
                    // Filter out workshops that are already in the personalized list to provide more variety
                    const filtered = data.filter((w: Workshop) =>
                        !personalized.some(p => p.id === w.id)
                    );
                    setLatest(filtered.slice(0, 6));
                }
            } catch (error) {
                console.error('Error fetching latest:', error);
            } finally {
                setLoading(prev => ({ ...prev, latest: false }));
            }
        };

        fetchPersonalized();
        fetchFeatured();
        fetchLatest();
    }, [token]);

    const handleWorkshopClick = (slugOrId: string) => {
        navigate(`/workshop/${slugOrId}`);
    };

    return (
        <section className="py-24 md:py-32 px-6 bg-[#F9F9F5]">
            <div className="max-w-7xl mx-auto">
                {/* Personalized Section - Only show if user is logged in */}
                {token && (
                    <WorkshopSection
                        title="Handpicked for You"
                        subtitle="Based on your unique interests"
                        workshops={personalized}
                        loading={loading.personalized}
                        onWorkshopClick={handleWorkshopClick}
                    />
                )}

                {/* Featured Section */}
                <WorkshopSection
                    title="Trending Sessions"
                    subtitle="Most popular and highly rated experiences"
                    workshops={featured}
                    loading={loading.featured}
                    onWorkshopClick={handleWorkshopClick}
                />

                {/* Latest Section */}
                <WorkshopSection
                    title="Explore More"
                    subtitle="Discover new workshops happening around you"
                    workshops={latest}
                    loading={loading.latest}
                    onWorkshopClick={handleWorkshopClick}
                />

                <div className="mt-20 border-t border-deep-purple/10 pt-8 flex justify-end">
                    <button
                        onClick={() => navigate('/workshops')}
                        className="text-xl font-serif italic text-deep-purple transition-colors flex items-center gap-2 group"
                    >
                        See all workshops
                        <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WorkshopListing;