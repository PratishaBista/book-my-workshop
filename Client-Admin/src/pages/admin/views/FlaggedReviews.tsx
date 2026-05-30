import React, { useState, useEffect, useCallback } from 'react';
import {
    AlertTriangle,
    Trash2,
    Star,
    Image as ImageIcon,
    MessageSquare,
    RefreshCw,
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';

type ReviewFilter = 'all' | 'flagged';

interface AdminReview {
    id: number;
    workshopId: number;
    workshopTitle: string;
    userName: string;
    userEmail: string;
    rating: number;
    comment: string;
    imageUrls: string[];
    isFlagged: boolean;
    offensiveScore: number;
    createdAt: string;
}

export const FlaggedReviews: React.FC = () => {
    const [filter, setFilter] = useState<ReviewFilter>('all');
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [seeding, setSeeding] = useState(false);
    const [seedMessage, setSeedMessage] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Not authenticated. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(API_ENDPOINTS.admin.reviews(filter), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Failed to load reviews (${res.status})`);
            }
            setReviews(await res.json());
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'Failed to load reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleRemoderate = async () => {
        setSeeding(true);
        setSeedMessage(null);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_ENDPOINTS.admin.remoderateReviews, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Remoderation failed');
            setSeedMessage(`Re-scanned ${data.updated} reviews — ${data.flagged} flagged.`);
            await fetchReviews();
        } catch (e) {
            setSeedMessage(e instanceof Error ? e.message : 'Remoderation failed');
        } finally {
            setSeeding(false);
        }
    };

    const handleSeedSamples = async (force: boolean) => {
        if (
            force &&
            !confirm('Remove previous seed bookings/reviews and create a fresh set?')
        ) {
            return;
        }
        setSeeding(true);
        setSeedMessage(null);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_ENDPOINTS.admin.seedSampleReviews(force), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || data.Message || 'Seed failed');
            if (data.skipped) {
                setSeedMessage(
                    `${data.message} Click "Replace seed data" to delete old seed reviews and create a fresh set (with profanity test samples).`
                );
                return;
            }
            const flagged = data.flaggedCount ?? data.FlaggedCount;
            setSeedMessage(
                data.message ||
                    data.Message ||
                    `Seed completed${flagged != null ? ` — ${flagged} flagged` : ''}.`
            );
            await fetchReviews();
        } catch (e) {
            setSeedMessage(e instanceof Error ? e.message : 'Seed failed');
        } finally {
            setSeeding(false);
        }
    };

    const handleDelete = async (review: AdminReview) => {
        if (!review.isFlagged) return;
        if (!confirm('Remove this flagged review permanently? It will no longer appear on the public site.')) return;

        setDeletingId(review.id);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_ENDPOINTS.admin.deleteReview(review.id), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || body.Message || 'Delete failed');
            }
            setReviews((prev) => prev.filter((r) => r.id !== review.id));
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Could not delete review');
        } finally {
            setDeletingId(null);
        }
    };

    const flaggedCount = reviews.filter((r) => r.isFlagged).length;

    return (
        <div className="relative h-full flex flex-col">
            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">Reviews</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-mono mt-1 opacity-80">
                        Moderate workshop feedback · profanity is flagged by ML (negative reviews without profanity stay public)
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-[#0D0D0D] p-1 rounded-xl border border-[#1A1A1A] flex">
                        {(['all', 'flagged'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all font-mono ${
                                    filter === tab
                                        ? tab === 'flagged'
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-[#111]'
                                }`}
                            >
                                {tab === 'all' ? 'All Reviews' : 'Flagged Only'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchReviews}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-[#1A1A1A] text-slate-500 hover:text-white hover:bg-[#111] transition-colors disabled:opacity-40"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleRemoderate}
                        disabled={seeding}
                        className="px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-amber-500/20 disabled:opacity-40"
                    >
                        Re-scan all
                    </button>
                    <button
                        onClick={() => handleSeedSamples(false)}
                        disabled={seeding}
                        className="px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-indigo-500/20 disabled:opacity-40"
                        title="Only runs if no seed data exists yet"
                    >
                        {seeding ? 'Working…' : 'Seed samples'}
                    </button>
                    <button
                        onClick={() => handleSeedSamples(true)}
                        disabled={seeding}
                        className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-red-500/20 disabled:opacity-40"
                        title="Deletes SEED-REV-* bookings/reviews and re-creates test data"
                    >
                        Replace seed data
                    </button>
                </div>
            </div>

            {seedMessage && (
                <div className="mb-4 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-200 text-sm font-mono">
                    {seedMessage}
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button
                        onClick={fetchReviews}
                        className="text-[10px] font-bold uppercase tracking-widest font-mono hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="bg-[#0D0D0D] rounded-2xl border border-[#1A1A1A] flex-1 flex flex-col overflow-hidden shadow-2xl shadow-black/50">
                <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-[#000] border-b border-[#1A1A1A] text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
                    <div className="col-span-3">Workshop / Author</div>
                    <div className="col-span-5">Review</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-600 flex flex-col items-center gap-3 font-mono flex-1">
                        <div className="w-5 h-5 border-2 border-[#1A1A1A] border-t-indigo-600 rounded-full animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Loading reviews...</span>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="p-16 text-center flex-1 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={24} className="text-slate-600" />
                        </div>
                        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                            {filter === 'flagged' ? 'No flagged reviews' : 'No reviews yet'}
                        </p>
                        <p className="text-slate-600 text-sm mt-2 max-w-md">
                            {filter === 'flagged'
                                ? 'When the sentiment model flags offensive content, it will appear here for removal.'
                                : 'Reviews from verified attendees will show up here after workshops are completed.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#1A1A1A] overflow-y-auto custom-scrollbar flex-1">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className={`grid grid-cols-12 gap-4 px-8 py-6 items-start hover:bg-[#111] transition-colors ${
                                    review.isFlagged ? 'border-l-4 border-l-red-500/80' : 'border-l-4 border-l-transparent'
                                }`}
                            >
                                <div className="col-span-3">
                                    <div className="flex gap-0.5 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                size={11}
                                                className={
                                                    s <= review.rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-slate-700'
                                                }
                                            />
                                        ))}
                                    </div>
                                    <h3 className="text-white font-bold text-sm leading-snug">{review.workshopTitle}</h3>
                                    <p className="text-slate-500 text-xs font-mono mt-2">
                                        {review.userName}
                                        <br />
                                        <span className="text-slate-600">{review.userEmail}</span>
                                    </p>
                                    <p className="text-slate-600 text-[10px] font-mono mt-2 uppercase tracking-widest">
                                        {new Date(review.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="col-span-5">
                                    <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                                    {review.imageUrls?.length > 0 && (
                                        <div className="flex gap-2 flex-wrap mt-3">
                                            {review.imageUrls.map((url, i) => (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#222] group"
                                                >
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <ImageIcon size={14} className="text-white" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    {review.isFlagged ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-[9px] font-bold uppercase tracking-widest font-mono">
                                            <AlertTriangle size={10} />
                                            Flagged · {(review.offensiveScore * 100).toFixed(0)}%
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest font-mono">
                                            Published
                                        </span>
                                    )}
                                </div>

                                <div className="col-span-2 flex justify-end">
                                    {review.isFlagged ? (
                                        <button
                                            onClick={() => handleDelete(review)}
                                            disabled={deletingId === review.id}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                            {deletingId === review.id ? 'Removing...' : 'Delete'}
                                        </button>
                                    ) : (
                                        <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest px-2">
                                            —
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="py-4 px-8 border-t border-[#1A1A1A] bg-[#000] flex justify-between items-center text-[10px] font-bold font-mono text-slate-600 uppercase tracking-widest">
                    <span>
                        Showing {reviews.length} review{reviews.length === 1 ? '' : 's'}
                        {filter === 'all' && flaggedCount > 0 && (
                            <span className="text-red-400/80 ml-2">· {flaggedCount} flagged in view</span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};
