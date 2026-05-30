import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import NotFoundPage from '../error/NotFoundPage';
import { API_ENDPOINTS } from '../../config/api';

interface Article {
    title: string;
    contentHtml: string;
    coverImageUrl: string;
    publishedAt: string;
    category: string;
}

const JournalArticle: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const response = await fetch(API_ENDPOINTS.journal.bySlug(slug));
                if (response.ok) {
                    const data = await response.json();
                    setArticle(data);
                } else {
                    setArticle(null);
                }
            } catch (error) {
                console.error('Error fetching article:', error);
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
                <Loader2 className="animate-spin text-[#00CDB5]" size={40} />
            </div>
        );
    }

    if (!article) {
        return <NotFoundPage />;
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] text-[#111111] font-serif overflow-hidden">
            <header className="w-full pt-16 pb-8 text-center flex flex-col items-center justify-center relative">
               <Link to="/" className="absolute left-8 top-12 p-3 hover:bg-black/5 rounded-full transition-colors hidden md:block">
                  <ArrowLeft size={24} className="text-[#111]/40" />
               </Link>
               <div className="font-sans italic text-[#009ED8] text-2xl tracking-tight mb-2" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                   BookMyWorkshop
               </div>
               <h1 className="text-5xl md:text-7xl font-serif text-[#00CDB5] tracking-tight mx-auto" style={{ fontVariant: 'small-caps', letterSpacing: '-0.02em' }}>
                   STORIES
               </h1>
            </header>

            {/* Hero Title Section */}
            <main className="max-w-5xl mx-auto px-6 pt-12 md:pt-16 pb-32">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight font-normal text-[#1A1A1A] max-w-4xl mx-auto">
                        {article.title}
                    </h2>

                    <div className="mt-20 font-sans text-xs md:text-sm font-extrabold tracking-[0.05em] text-[#1A1A1A] uppercase">
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'DRAFT'}
                    </div>
                </motion.div>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1.2 }}
                    className="w-full relative bg-[#111] p-3 shadow-2xl mx-auto"
                >
                    {/* Simulated Film stock border */}
                    <div className="absolute top-0 left-0 w-full h-8 flex items-center px-6 justify-between text-[#DAA520] text-[10px] font-mono tracking-[0.2em] z-10 mix-blend-screen">
                        <span>FUJI PRO</span>
                        <span>160H</span>
                        <span>23</span>
                    </div>
                    <img 
                        src={article.coverImageUrl} 
                        alt={article.title}
                        className="w-full aspect-[4/3] md:aspect-[16/9] object-cover mt-6 filter contrast-125 saturate-50"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-8 flex items-center px-6 justify-between text-[#DAA520] text-[10px] font-mono tracking-[0.2em] z-10 mix-blend-screen">
                        <span>◭ ◮</span>
                        <span>324-11</span>
                        <span>◭ ◮</span>
                    </div>
                </motion.div>

                {/* Article Content */}
                <article className="mt-24 md:mt-32 max-w-2xl mx-auto space-y-10 text-[1.15rem] md:text-[1.3rem] leading-relaxed md:leading-[1.8] text-[#222222]">
                    <div 
                        className="journal-content"
                        dangerouslySetInnerHTML={{ __html: article.contentHtml }} 
                    />

                    <div className="font-sans text-sm tracking-[0.1em] text-[#111]/50 pt-16 mt-20 border-t border-[#E5E5E5] text-center uppercase">
                        Words by The BookMyWorkshop Team
                    </div>
                </article>
            </main>
        </div>
    );
};

export default JournalArticle;
