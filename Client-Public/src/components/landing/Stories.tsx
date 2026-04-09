import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../../config/api';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    coverImageUrl: string;
}

const Stories: React.FC = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.journal.all);
                if (response.ok) {
                    const data = await response.json();
                    setArticles(data);
                }
            } catch (error) {
                console.error('Error fetching journal:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    if (loading) return null; // Or a subtle skeleton
    if (articles.length === 0) return null;

    return (
        <section className="py-32 px-6 bg-[#F9F9F5] border-t-2 border-deep-purple">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-deep-purple/10 pb-8">
                    <h2 className="text-6xl md:text-8xl font-serif text-deep-purple leading-none tracking-tight">
                        The Journal
                    </h2>
                    <p className="text-lg md:text-xl text-deep-purple/60 font-sans max-w-sm mt-6 md:mt-0 text-right">
                        Notes on creativity, craft, and the messiness of being human.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                    {articles.slice(0, 3).map((article, i) => (
                        <motion.article
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            onClick={() => navigate(`/${article.slug}`)}
                            className="group cursor-pointer flex flex-col"
                        >
                            {/* Image Frame */}
                            <div className="overflow-hidden mb-8 aspect-[4/5] border border-deep-purple/10 bg-gray-100 relative">
                                <div className="absolute inset-0 bg-deep-purple/0 group-hover:bg-deep-purple/5 transition-colors duration-500 z-10"></div>
                                <img
                                    src={article.coverImageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                                />
                            </div>

                            {/* Meta */}
                            <div className="flex justify-between items-center border-t border-deep-purple/20 pt-4 mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary-orange">
                                    {article.category}
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="text-3xl font-serif text-deep-purple leading-tight mb-4 group-hover:underline decoration-1 underline-offset-4 transition-all">
                                {article.title}
                            </h3>
                            <p className="text-deep-purple/60 text-base leading-relaxed mb-6 font-sans">
                                {article.excerpt}
                            </p>

                            <div className="mt-auto">
                                <span className="inline-block text-sm font-semibold uppercase tracking-wider border-b border-transparent group-hover:border-deep-purple transition-all pb-1">
                                    Read Story
                                </span>
                            </div>

                        </motion.article>
                    ))}
                </div>

                <div className="mt-20 flex justify-center">
                    <button 
                        onClick={() => navigate('/articles')}
                        className="px-8 py-4 border-2 border-deep-purple text-deep-purple font-bold uppercase tracking-widest hover:bg-deep-purple hover:text-white transition-all duration-300"
                    >
                        Find more articles
                    </button>
                </div>

            </div>
        </section>
    );
};

export default Stories;
