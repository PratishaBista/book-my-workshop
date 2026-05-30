import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Star,
    MapPin,
    Globe,
    Loader2,
    ChevronLeft,
    CheckCircle2,
} from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { WorkshopCard } from '../../components/workshops/WorkshopCard';
import { HostProfileIllustration } from '../../components/host/HostProfileIllustration';
import { API_ENDPOINTS } from '../../config/api';
import { normalizeWorkshop, type Workshop } from '../../hooks/useWorkshopQueries';

interface HostReview {
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
}

interface HostProfile {
    id: number;
    businessName: string;
    slug?: string;
    tagline?: string;
    description?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    studioImageUrl?: string;
    address?: string;
    state?: string;
    website?: string;
    averageRating?: number;
    reviewCount: number;
    workshopCount: number;
    workshops: Record<string, unknown>[];
    reviews: HostReview[];
}

const HostProfilePage: React.FC = () => {
    const { slugOrId } = useParams<{ slugOrId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<HostProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slugOrId) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(API_ENDPOINTS.providers.public(slugOrId));
                if (!res.ok) {
                    setError('Host not found.');
                    setProfile(null);
                    return;
                }
                setProfile(await res.json());
            } catch {
                setError('Could not load host profile.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slugOrId]);

    const workshops: Workshop[] =
        profile?.workshops?.map((w) => normalizeWorkshop(w)) ?? [];

    const aboutText =
        profile?.description?.trim() ||
        profile?.tagline?.trim() ||
        null;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <Loader2 className="animate-spin text-deep-purple/40" size={40} />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
                    <p className="text-xl font-serif text-deep-purple mb-6">{error || 'Host not found'}</p>
                    <Link to="/workshops" className="text-primary-orange font-bold hover:underline">
                        Browse workshops
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-deep-purple font-sans flex flex-col">
            <Navbar />

            <header className="relative overflow-hidden bg-deep-purple">
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40z' fill='%23FF6B35' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    }}
                />
                {profile.coverImageUrl && (
                    <img
                        src={profile.coverImageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-deep-purple via-deep-purple/80 to-deep-purple/60" />

                <div className="relative z-10 pt-28 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-bold mb-10 transition-colors"
                    >
                        <ChevronLeft size={18} />
                        Back
                    </button>

                    <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white/20 bg-white/10 shadow-2xl flex-shrink-0">
                            {profile.logoUrl ? (
                                <img
                                    src={profile.logoUrl}
                                    alt={profile.businessName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-white/80">
                                    {profile.businessName[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-white">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-orange mb-2">
                                Workshop Host
                            </p>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                                {profile.businessName}
                            </h1>
                            {profile.tagline && (
                                <p className="mt-3 text-lg text-white/80 font-light max-w-xl">
                                    {profile.tagline}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-6 text-sm text-white/70">
                                {(profile.state || profile.address) && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-primary-orange" />
                                        {[profile.state, profile.address?.split(',')[0]]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </span>
                                )}
                                {profile.website && (
                                    <a
                                        href={
                                            profile.website.startsWith('http')
                                                ? profile.website
                                                : `https://${profile.website}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                                    >
                                        <Globe size={16} className="text-primary-orange" />
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow px-6 md:px-12 pb-24">
                <div className="max-w-6xl mx-auto">
                    <section className="py-16 md:py-20 border-b border-deep-purple/10">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <HostProfileIllustration className="w-full max-w-xs lg:max-w-sm shrink-0" />
                            <div className="flex-1">
                                <div className="flex items-baseline gap-4 border-b-2 border-deep-purple/15 pb-3 mb-8">
                                    <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
                                        About the host
                                    </h2>
                                </div>
                                {aboutText ? (
                                    <p className="text-base md:text-lg leading-relaxed text-deep-purple/80 whitespace-pre-line">
                                        {aboutText}
                                    </p>
                                ) : (
                                    <p className="text-deep-purple/50 italic">
                                        This host has not added a business description yet.
                                    </p>
                                )}
                                {profile.studioImageUrl && (
                                    <div className="mt-10 rounded-3xl overflow-hidden border border-deep-purple/10 shadow-lg">
                                        <img
                                            src={profile.studioImageUrl}
                                            alt="Studio"
                                            className="w-full max-h-80 object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16">
                            {[
                                { label: 'Workshops', value: profile.workshopCount },
                                {
                                    label: 'Reviews',
                                    value: profile.reviewCount,
                                },
                                {
                                    label: 'Rating',
                                    value:
                                        profile.averageRating != null
                                            ? profile.averageRating.toFixed(1)
                                            : '—',
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="text-center py-6 rounded-2xl bg-white border border-deep-purple/10 shadow-sm"
                                >
                                    <p className="text-2xl md:text-3xl font-serif font-bold text-deep-purple">
                                        {stat.value}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-deep-purple/45 mt-1">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="py-16 md:py-20 border-b border-deep-purple/10">
                        <div className="flex items-center gap-3 mb-10">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold">
                                Workshops by {profile.businessName}
                            </h2>
                        </div>
                        {workshops.length === 0 ? (
                            <p className="text-deep-purple/50 py-12 text-center rounded-3xl border border-dashed border-deep-purple/15">
                                No published workshops at the moment.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                {workshops.map((w) => (
                                    <WorkshopCard
                                        key={w.id}
                                        workshop={w}
                                        onClick={() => navigate(`/workshop/${w.slug || w.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Reviews for this host */}
                    <section className="py-16 md:py-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-10">
                            What guests say
                        </h2>
                        {profile.reviews.length === 0 ? (
                            <p className="text-deep-purple/50 py-12 text-center rounded-3xl border border-dashed border-deep-purple/15">
                                No reviews yet for this host&apos;s workshops.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {profile.reviews.map((review, i) => (
                                    <motion.article
                                        key={review.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                                        className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/workshop/${review.workshopSlug || review.workshopId}`
                                                )
                                            }
                                            className="w-full flex items-center gap-4 p-5 border-b border-gray-50 text-left hover:bg-orange-50/30 transition-colors"
                                        >
                                            {review.workshopImageUrl && (
                                                <img
                                                    src={review.workshopImageUrl}
                                                    alt=""
                                                    className="w-14 h-14 rounded-xl object-cover"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-orange">
                                                    Workshop
                                                </p>
                                                <p className="font-bold text-deep-purple truncate">
                                                    {review.workshopTitle}
                                                </p>
                                            </div>
                                        </button>
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star
                                                            key={s}
                                                            size={14}
                                                            className={
                                                                s <= review.rating
                                                                    ? 'fill-primary-orange text-primary-orange'
                                                                    : 'text-gray-200'
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold">{review.userName}</span>
                                                {review.isVerifiedAttendee && (
                                                    <CheckCircle2
                                                        size={14}
                                                        className="text-emerald-500"
                                                        aria-label="Verified attendee"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-deep-purple/75 text-sm leading-relaxed">
                                                {review.comment}
                                            </p>
                                            <p className="text-[10px] text-deep-purple/40 mt-4 uppercase tracking-widest">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HostProfilePage;
