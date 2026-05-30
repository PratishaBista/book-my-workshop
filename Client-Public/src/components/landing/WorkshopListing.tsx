import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useFeaturedWorkshops, useAllPublishedWorkshops, useRecommendedWorkshops } from '../../hooks/useWorkshopQueries';
import type { Workshop } from '../../hooks/useWorkshopQueries';
import WorkshopCard from '../workshops/WorkshopCard';

interface WorkshopSectionProps {
    title: string;
    subtitle?: string;
    workshops: Workshop[];
    loading: boolean;
    onWorkshopClick: (slugOrId: string) => void;
    scrollable?: boolean;
}

const WorkshopSection: React.FC<WorkshopSectionProps> = ({
    title,
    subtitle,
    workshops,
    loading,
    onWorkshopClick,
    scrollable = true,
}) => {
    const [wishlist, setWishlist] = useState<number[]>(() => {
        const stored = localStorage.getItem('wishlist');
        return stored ? JSON.parse(stored) : [];
    });
    const [showLoginToast, setShowLoginToast] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleWishlist = (id: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setShowLoginToast(true);
            setTimeout(() => {
                setShowLoginToast(false);
                navigate('/login', { state: { from: location } });
            }, 1500);
            return;
        }

        setWishlist((prev) => {
            const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
            localStorage.setItem('wishlist', JSON.stringify(next));
            return next;
        });
    };

    if (loading) {
        return (
            <div className="py-16 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-orange/20 border-t-primary-orange" />
            </div>
        );
    }

    if (workshops.length === 0) return null;

    const cardProps = (workshop: Workshop) => ({
        workshop,
        layout: 'compact' as const,
        onClick: () => onWorkshopClick(workshop.slug || workshop.id.toString()),
        wishlisted: wishlist.includes(workshop.id),
        onToggleWishlist: (e: React.MouseEvent) => {
            e.stopPropagation();
            toggleWishlist(workshop.id);
        },
    });

    return (
        <div className="mb-20">
            {(title || subtitle) && (
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        {title && (
                            <h2 className="text-3xl md:text-4xl font-serif text-deep-purple leading-tight tracking-tight">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-deep-purple/55 font-sans text-base mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>
            )}

            {scrollable ? (
                <div className="relative -mx-6 px-6 md:-mx-0 md:px-0">
                    <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar">
                        {workshops.map((workshop) => (
                            <motion.div
                                key={workshop.id}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                className="snap-start shrink-0 w-[72vw] sm:w-[42vw] md:w-[calc(25%-15px)] lg:w-[calc(20%-16px)] min-w-[200px] max-w-[260px]"
                            >
                                <WorkshopCard {...cardProps(workshop)} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-5 md:gap-y-12">
                    {workshops.map((workshop) => (
                        <motion.div
                            key={workshop.id}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <WorkshopCard {...cardProps(workshop)} />
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showLoginToast && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-deep-purple text-white px-8 py-4 rounded-full shadow-2xl"
                    >
                        <span className="font-sans font-bold text-sm uppercase tracking-widest">
                            Please log in to save your wishlist.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const WorkshopListing: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const { data: personalized = [], isLoading: loadingPersonalized } = useRecommendedWorkshops(token);
    const { data: featured = [], isLoading: loadingFeatured } = useFeaturedWorkshops();
    const { data: allWorkshops = [], isLoading: loadingLatest } = useAllPublishedWorkshops();

    const latest = useMemo(() => {
        const filtered = allWorkshops.filter(
            (w: Workshop) => !personalized.some((p) => p.id === w.id) && !featured.some((f) => f.id === w.id)
        );
        const shuffled = [...filtered];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, 12);
    }, [allWorkshops, personalized, featured]);

    const handleWorkshopClick = (slugOrId: string) => {
        navigate(`/workshop/${slugOrId}`);
    };

    return (
        <section id="explore-workshops" className="py-20 md:py-28 px-6 bg-[#F9F9F5]">
            <div className="max-w-[1600px] mx-auto">
                {token && personalized.length > 0 && (
                    <WorkshopSection
                        title="Picked for you"
                        subtitle="Based on your interests"
                        workshops={personalized}
                        loading={loadingPersonalized}
                        onWorkshopClick={handleWorkshopClick}
                    />
                )}

                <WorkshopSection
                    title="Trending sessions"
                    subtitle="Popular experiences near you"
                    workshops={featured}
                    loading={loadingFeatured}
                    onWorkshopClick={handleWorkshopClick}
                />

                <WorkshopSection
                    title="Explore more"
                    subtitle="Fresh workshops to book"
                    workshops={latest}
                    loading={loadingLatest}
                    onWorkshopClick={handleWorkshopClick}
                />

                <div className="mt-4 pt-8 border-t border-deep-purple/10 flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/workshops')}
                        className="text-lg font-serif text-deep-purple transition-colors flex items-center gap-2 group"
                    >
                        Browse all workshops
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WorkshopListing;
