import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Category {
    id: number;
    name: string;
    iconUrl?: string;
}

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { updateOnboardingStatus } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.preferences.categories);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (selectedIds.length < 3) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.preferences.save, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(selectedIds)
            });

            if (response.ok) {
                updateOnboardingStatus(true);
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = () => {
        updateOnboardingStatus(true);
        navigate('/', { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-base flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary-orange border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-base relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary-orange/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-deep-purple/5 rounded-full blur-[100px]" />
            </div>

            <header className="relative z-10 p-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-deep-purple rounded-xl flex items-center justify-center text-white font-black italic">B</div>
                    <span className="font-serif font-black text-xl text-deep-purple tracking-tight">BookMyWorkshop</span>
                </div>
                <button
                    onClick={handleSkip}
                    className="text-deep-purple/40 hover:text-deep-purple font-bold text-sm transition-colors flex items-center gap-1"
                >
                    Skip for now <X size={14} />
                </button>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto text-center pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-orange/10 rounded-full mb-6">
                        <Sparkles size={16} className="text-primary-orange" />
                        <span className="text-xs font-black text-primary-orange uppercase tracking-widest">Personalize Your Feed</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-deep-purple mb-6 leading-tight">
                        What are you <br className="hidden md:block" />
                        <span className="text-primary-orange italic">interested</span> in?
                    </h1>
                    <p className="text-lg text-deep-purple/60 mb-12 max-w-xl mx-auto">
                        Pick at least <span className="text-deep-purple font-bold">3 interests</span> so we can recommend the perfect workshops for you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                    {categories.map((category, index) => (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            key={category.id}
                            onClick={() => toggleCategory(category.id)}
                            className={`
                                relative p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-4 group
                                ${selectedIds.includes(category.id)
                                    ? 'border-primary-orange bg-primary-orange/5 shadow-lg shadow-primary-orange/10'
                                    : 'border-deep-purple/5 bg-white hover:border-deep-purple/20'
                                }
                            `}
                        >
                            <div className={`
                                w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300
                                ${selectedIds.includes(category.id) ? 'bg-primary-orange text-white' : 'bg-cream-base group-hover:bg-primary-orange/10 text-deep-purple'}
                            `}>
                                {category.iconUrl ? <img src={category.iconUrl} alt="" className="w-10 h-10 object-contain" /> : '🎨'}
                            </div>
                            <span className="font-bold text-sm text-deep-purple">{category.name}</span>

                            {selectedIds.includes(category.id) && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 w-6 h-6 bg-primary-orange rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white"
                                >
                                    <Check size={12} strokeWidth={4} />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>

                <motion.div
                    layout
                    className="mt-16 w-full max-w-md mx-auto"
                >
                    <button
                        onClick={handleSave}
                        disabled={selectedIds.length < 3 || saving}
                        className={`
                            w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300
                            ${selectedIds.length >= 3
                                ? 'bg-deep-purple text-white shadow-2xl shadow-deep-purple/20 hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {saving ? (
                            <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
                        ) : (
                            <>
                                {selectedIds.length < 3 ? `Pick ${3 - selectedIds.length} more` : "Let's Explore"}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                    <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {selectedIds.length} selected
                    </p>
                </motion.div>
            </main>
        </div>
    );
};

export default Onboarding;
