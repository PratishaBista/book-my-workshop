import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Reply, CheckCircle2, Filter } from 'lucide-react';

interface Review {
    id: string;
    studentName: string;
    workshopName: string;
    rating: number;
    comment: string;
    date: string;
    reply?: string;
}

const INITIAL_REVIEWS: Review[] = [
    {
        id: '1',
        studentName: 'Pratisha Bista',
        workshopName: 'Traditional Clay Pottery Workshop',
        rating: 5,
        comment: 'Absolutely loved this experience! The instructor was incredibly patient and guided us step-by-step. I came home with two custom cups that I made myself. Highly recommended!',
        date: '2 days ago'
    },
    {
        id: '2',
        studentName: 'Aarav Sharma',
        workshopName: 'Handcrafted Wooden Carving Session',
        rating: 4,
        comment: 'Very informative and hands-on session. The tools provided were clean and well-maintained. Deducted one star just because the studio was a bit cold, but the teaching was stellar.',
        date: '1 week ago',
        reply: 'Thank you Aarav! We appreciate the feedback and have already adjusted the heating in our woodshop. Hope to host you again!'
    },
    {
        id: '3',
        studentName: 'Sophia Gurung',
        workshopName: 'Traditional Clay Pottery Workshop',
        rating: 5,
        comment: 'Such a therapeutic weekend activity! The clay is high quality and the studio has an incredible ambient vibe. Will definitely join the intermediate course next month.',
        date: '2 weeks ago'
    }
];

export const HostReviewsView: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [filterRating, setFilterRating] = useState<number | 'all'>('all');
    const [successMessage, setSuccessMessage] = useState('');

    const handlePostReply = (reviewId: string) => {
        if (!replyText.trim()) return;

        setReviews(prev => prev.map(rev => {
            if (rev.id === reviewId) {
                return { ...rev, reply: replyText };
            }
            return rev;
        }));

        setReplyingToId(null);
        setReplyText('');
        setSuccessMessage('Reply posted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const filteredReviews = filterRating === 'all' 
        ? reviews 
        : reviews.filter(r => r.rating === filterRating);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-deep-purple">Student Reviews</h2>
                    <p className="text-gray-500 mt-1">Read, analyze, and reply to student feedback to build your studio reputation.</p>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 font-semibold shadow-sm"
                    >
                        <CheckCircle2 className="text-emerald-600" size={20} />
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Average Rating</p>
                        <h4 className="text-4xl font-bold text-deep-purple flex items-baseline gap-1">
                            4.8 <span className="text-sm font-semibold text-gray-400">/ 5.0</span>
                        </h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                        <Star size={24} fill="currentColor" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Feedbacks</p>
                        <h4 className="text-4xl font-bold text-deep-purple">{reviews.length}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-deep-purple/60">
                        <MessageSquare size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Response Rate</p>
                        <h4 className="text-4xl font-bold text-deep-purple">
                            {Math.round((reviews.filter(r => r.reply).length / reviews.length) * 100)}%
                        </h4>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary-orange">
                        <Reply size={24} />
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-deep-purple font-semibold">
                    <Filter size={16} />
                    <span>Filter Feedback:</span>
                </div>
                <div className="flex gap-2">
                    {['all', 5, 4, 3].map((val) => (
                        <button
                            key={val}
                            onClick={() => setFilterRating(val as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterRating === val 
                                ? 'bg-deep-purple text-white shadow-sm' 
                                : 'bg-gray-50 text-deep-purple hover:bg-gray-100'}`}
                        >
                            {val === 'all' ? 'Show All' : `${val} Stars`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
                {filteredReviews.length === 0 ? (
                    <div className="p-16 text-center bg-white rounded-3xl border border-gray-100">
                        <p className="text-gray-400 font-semibold">No reviews found matching that criteria.</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <div key={review.id} className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
                            <div className="flex justify-between items-start flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-cream-base flex items-center justify-center text-deep-purple font-bold text-lg border border-deep-purple/5 shadow-inner">
                                        {review.studentName[0]}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-deep-purple text-sm">{review.studentName}</h5>
                                        <p className="text-xs text-gray-400 font-medium">Attended: <span className="text-primary-orange font-semibold">{review.workshopName}</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex text-amber-400 mb-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={14} 
                                                fill={i < review.rating ? 'currentColor' : 'none'} 
                                                className={i < review.rating ? 'text-amber-400' : 'text-gray-200'}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">{review.date}</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                "{review.comment}"
                            </p>

                            {/* Existing Reply */}
                            {review.reply && (
                                <div className="p-4 bg-cream-base/50 rounded-2xl border border-deep-purple/5 space-y-1 ml-6">
                                    <span className="text-[10px] font-bold text-primary-orange uppercase tracking-wider">Your Response:</span>
                                    <p className="text-xs text-deep-purple/80 font-medium leading-relaxed">
                                        {review.reply}
                                    </p>
                                </div>
                            )}

                            {/* Reply Action */}
                            {!review.reply && replyingToId !== review.id && (
                                <button
                                    onClick={() => setReplyingToId(review.id)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-deep-purple/60 hover:text-deep-purple py-1 px-2 hover:bg-gray-50 rounded-lg transition-all"
                                >
                                    <Reply size={14} />
                                    <span>Reply to Feedback</span>
                                </button>
                            )}

                            {/* Reply Input Form */}
                            {replyingToId === review.id && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="ml-6 space-y-3"
                                >
                                    <textarea
                                        rows={3}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={`Respond professionally to ${review.studentName}...`}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-deep-purple transition-all resize-none font-medium text-deep-purple"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePostReply(review.id)}
                                            className="px-4 py-2 bg-deep-purple hover:bg-deep-purple/95 text-white rounded-lg font-bold text-xs active:scale-95 transition-all shadow-sm"
                                        >
                                            Submit Reply
                                        </button>
                                        <button
                                            onClick={() => { setReplyingToId(null); setReplyText(''); }}
                                            className="px-3 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};
