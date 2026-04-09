import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Sun } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    coverImageUrl: string;
    publishedAt: string;
}

const JournalListPage: React.FC = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

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

    const categories = ['All', ...new Set(articles.map(a => a.category))];
    const filteredArticles = filter === 'All' ? articles : articles.filter(a => a.category === filter);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="animate-spin text-black" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white p-6 md:p-12">
            {/* Header / Filter bar */}
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap gap-2 mb-12 border-b-2 border-black pb-6">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-1 text-sm font-bold border-2 border-black transition-colors ${
                                filter === cat ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
                            }`}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Newsroom Title Styling */}
                <div className="mb-16">
                    <div className="flex items-baseline justify-between border-b-4 border-black pb-2">
                        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter flex items-center gap-4">
                            NEWSROOM
                            <span className="hidden md:inline-block">
                                <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 30C10 15 25 5 45 5C65 5 80 15 80 30M10 30C10 45 25 55 45 55C65 55 80 45 80 30M80 30C80 30 85 30 90 30M110 30C110 15 95 5 75 5C55 5 40 15 40 30M110 30C110 45 95 55 75 55C55 55 40 45 40 30" stroke="black" strokeWidth="3"/>
                                    <circle cx="45" cy="30" r="15" stroke="black" strokeWidth="2" strokeDasharray="4 4"/>
                                    <circle cx="75" cy="30" r="15" stroke="black" strokeWidth="2" strokeDasharray="4 4"/>
                                </svg>
                            </span>
                        </h1>
                    </div>
                    <p className="mt-4 text-xs font-bold tracking-widest uppercase">
                        The latest circulars from the BookMyWorkshop editorial department.
                    </p>
                </div>

                {/* Article List */}
                <div className="space-y-12">
                    {filteredArticles.map((article, i) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col md:flex-row gap-8 group cursor-pointer border-b border-black/10 pb-12 last:border-0"
                            onClick={() => navigate(`/${article.slug}`)}
                        >
                            <div className="w-full md:w-64 h-48 bg-gray-100 border-4 border-black overflow-hidden relative group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <img 
                                    src={article.coverImageUrl} 
                                    alt={article.title}
                                    className="w-full h-full object-cover grayscale contrast-125"
                                />
                                <div className="absolute inset-0 bg-black/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] bg-black text-white px-2 py-0.5 font-bold uppercase">{article.category}</span>
                                    <span className="text-[10px] font-bold text-black/40 uppercase">{new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold leading-none mb-4 group-hover:underline italic flex items-center gap-3">
                                    {article.title}
                                    <Sun size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h2>
                                <p className="text-sm text-black/60 leading-relaxed max-w-xl">
                                    {article.excerpt}
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 border-black w-fit group-hover:bg-black group-hover:text-white px-1 transition-colors">
                                    Read Full Circular
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-32 border-t-4 border-black pt-8 flex justify-between items-center text-[10px] font-bold tracking-tighter">
                    <span>© 2026 BOOKMYWORKSHOP CORP.</span>
                    <span>ALL RIGHTS RESERVED</span>
                    <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:underline">BACK TO TOP ↑</button>
                </div>
            </div>
        </div>
    );
};

export default JournalListPage;
