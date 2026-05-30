import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Loader2, ChevronRight, Award } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { API_ENDPOINTS } from '../../config/api';

interface ReviewItem {
    id: number;
    rating: number;
    comment: string;
    userName: string;
    isVerifiedAttendee: boolean;
    createdAt: string;
    imageUrls?: string[];
    workshopId: number;
    workshopTitle: string;
    workshopSlug?: string;
    workshopImageUrl?: string;
    providerId?: number;
    providerName?: string;
}

interface TopHost {
    providerId: number;
    businessName: string;
    logoUrl?: string;
    slug?: string;
    averageRating: number;
    reviewCount: number;
}

const AllReviews: React.FC = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [topHosts, setTopHosts] = useState<TopHost[]>([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const pageSize = 12;

    const fetchFeed = useCallback(async (pageNum: number, append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.reviews.feed(pageNum, pageSize));
            if (res.ok) {
                const data = await res.json();
                const incoming: ReviewItem[] = data.reviews ?? [];
                setReviews((prev) => (append ? [...prev, ...incoming] : incoming));
                setTopHosts(data.topHosts ?? []);
                setTotalReviews(data.totalReviews ?? 0);
            }
        } catch (e) {
            console.error('Error loading reviews feed', e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchFeed(1, false);
    }, [fetchFeed]);

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchFeed(next, true);
    };

    const goToWorkshop = (review: ReviewItem) => {
        navigate(`/workshop/${review.workshopSlug || review.workshopId}`);
    };

    const goToHostProfile = (host: TopHost) => {
        navigate(`/host/${host.slug || host.providerId}`);
    };

    const hasMore = reviews.length < totalReviews;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col">
            <Navbar />
            
            <div className="relative bg-[#2D1B3E] overflow-hidden">
                <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M20 20l15-5-5 15zM70 40l20-10-10 20zM120 20l15-5-5 15zM40 80l20-10-10 20zM100 80l20-10-10 20zM20 140l15-5-5 15zM70 140l20-10-10 20zM120 140l15-5-5 15zM20 80h5v5h-5zM120 80h5v5h-5zM70 90h5v5h-5zM10 50l10-5-5 10zM110 50l10-5-5 10zM50 110l10-5-5 10z'/%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />
                
                <div className="relative z-10 pt-28 pb-16 px-6 md:px-12">
                    <div className="max-w-6xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-5xl md:text-6xl font-serif font-bold text-cream-offwhite mt-3 leading-tight">
                                Our Reviews
                            </h1>
                            <p className="text-cream-offwhite/70 mt-4 text-lg font-light max-w-xl mx-auto">
                                {/* {totalReviews > 0 && (
                                    // <span className="block mt-1 text-sm font-bold text-cream-offwhite/60">
                                    //     {totalReviews} review{totalReviews !== 1 ? 's' : ''} across the platform
                                    // </span>
                                )} */}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            <main className="flex-grow pb-24 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    {topHosts.length > 0 && (
                        <section className="mb-20 -mt-8 relative z-20">
                            <div className="flex items-center justify-center gap-3 mb-8">
                                <Award className="text-primary-orange" size={28} />
                                <h2 className="text-3xl font-serif font-bold text-deep-purple">Highly Rated Hosts</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {topHosts.map((host) => (
                                    <button
                                        key={host.providerId}
                                        type="button"
                                        onClick={() => goToHostProfile(host)}
                                        className="text-left bg-white rounded-3xl p-6 border border-gray-100 hover:-translate-y-1 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
                                                {host.logoUrl ? (
                                                    <img src={host.logoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-serif font-bold text-gray-300">
                                                        {host.businessName[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-deep-purple truncate group-hover:text-primary-orange transition-colors">
                                                    {host.businessName}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star size={14} className="fill-primary-orange text-primary-orange" />
                                                    <span className="text-sm font-bold">{host.averageRating.toFixed(1)}</span>
                                                    <span className="text-xs text-gray-400">
                                                        ({host.reviewCount} reviews)
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-primary-orange shrink-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        {loading ? (
                            <div className="py-24 flex justify-center">
                                <Loader2 className="animate-spin text-gray-300" size={40} />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="py-24 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center px-10">
                                <Star size={40} className="text-gray-200 mx-auto mb-4" strokeWidth={1} />
                                <h3 className="text-2xl font-serif font-bold text-deep-purple mb-2">No reviews yet</h3>
                                <p className="text-gray-500 font-light">
                                    Complete a workshop and share your experience, reviews will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {reviews.map((review, i) => (
                                        <motion.article
                                            key={review.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(i * 0.05, 0.4) }}
                                            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden transition-shadow"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => goToWorkshop(review)}
                                                className="w-full flex items-center gap-4 p-5 border-b border-gray-50 text-left hover:bg-gray-50/50 transition-colors"
                                            >
                                                {review.workshopImageUrl && (
                                                    <img
                                                        src={review.workshopImageUrl}
                                                        alt=""
                                                        className="w-16 h-16 rounded-2xl object-cover shrink-0"
                                                    />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-orange">
                                                        {review.providerName}
                                                    </p>
                                                    <h3 className="font-serif font-bold text-deep-purple truncate">
                                                        {review.workshopTitle}
                                                    </h3>
                                                </div>
                                                <ChevronRight size={18} className="text-gray-300 shrink-0" />
                                            </button>

                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star
                                                                key={s}
                                                                size={14}
                                                                className={
                                                                    s <= review.rating
                                                                        ? 'fill-primary-orange text-primary-orange'
                                                                        : 'text-gray-100'
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                    {/* {review.isVerifiedAttendee && (
                                                        // <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 border border-green-100">
                                                        //     <CheckCircle2 size={10} /> Verified
                                                        // </span>
                                                    )} */}
                                                </div>

                                                <p className="text-deep-purple font-light leading-relaxed italic mb-6">
                                                    &ldquo;{review.comment}&rdquo;
                                                </p>

                                                {review.imageUrls && review.imageUrls.length > 0 && (
                                                    <div className="flex gap-2 mb-6 flex-wrap">
                                                        {review.imageUrls.map((url, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100"
                                                            >
                                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                                    <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 font-bold font-serif text-sm">
                                                        {review.userName?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-deep-purple uppercase tracking-widest">
                                                            {review.userName || 'Attendee'}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.article>
                                    ))}
                                </div>

                                {hasMore && (
                                    <div className="mt-12 text-center">
                                        <button
                                            type="button"
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="px-10 py-4 rounded-2xl bg-deep-purple text-white font-bold hover:bg-primary-orange transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                        >
                                            {loadingMore ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <>Load more reviews</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AllReviews;