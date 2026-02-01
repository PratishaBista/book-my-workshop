import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface Category {
    id: number;
    name: string;
    iconUrl?: string;
}

const InterestsSettings: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [_saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadInterests = async () => {
            try {
                // Fetch all categories
                const catRes = await fetch(API_ENDPOINTS.preferences.categories);
                const allCategories = await catRes.json();
                setCategories(allCategories);

                // Fetch current user preferences
                const token = localStorage.getItem('token');
                const prefRes = await fetch(API_ENDPOINTS.preferences.my, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (prefRes.ok) {
                    const myPrefs = await prefRes.json();
                    setSelectedIds(myPrefs.map((p: any) => p.categoryId));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadInterests();
    }, []);

    useEffect(() => {
        const handleGlobalSave = () => handleSave();
        window.addEventListener('settings-save', handleGlobalSave);
        return () => window.removeEventListener('settings-save', handleGlobalSave);
    }, [selectedIds]);

    const toggleCategory = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (selectedIds.length < 3) {
            setMessage('Please select at least 3 interests.');
            return;
        }

        setSaving(true);
        setMessage('');
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
                setMessage('Interests updated successfully!');
            } else {
                setMessage('Failed to update interests.');
            }
        } catch (error) {
            setMessage('An error occurred.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-primary-orange" size={32} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl"
        >
            <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-deep-purple mb-2">Your Interests</h2>
                <p className="text-deep-purple/60">Choose what you love so we can suggest the best workshops for you.</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-2xl font-bold flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={`
                            relative p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3
                            ${selectedIds.includes(category.id)
                                ? 'border-primary-orange bg-primary-orange/5 shadow-md shadow-primary-orange/5'
                                : 'border-deep-purple/5 bg-white hover:border-deep-purple/10'
                            }
                        `}
                    >
                        <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                            ${selectedIds.includes(category.id) ? 'bg-primary-orange text-white' : 'bg-cream-base text-deep-purple'}
                        `}>
                            {category.iconUrl ? <img src={category.iconUrl} alt="" className="w-8 h-8 object-contain" /> : '🎨'}
                        </div>
                        <span className="font-bold text-xs text-deep-purple">{category.name}</span>

                        {selectedIds.includes(category.id) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary-orange rounded-full flex items-center justify-center text-white border-2 border-white">
                                <Check size={10} strokeWidth={4} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-12 p-8 bg-primary-orange/5 rounded-[2.5rem] border border-primary-orange/10 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary-orange shadow-sm border border-primary-orange/10">
                    <Sparkles size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-lg text-deep-purple">Why this matters?</h4>
                    <p className="text-sm text-deep-purple/60">We use these interests to rank workshops on your home page, ensuring you always see what's most relevant to you first.</p>
                </div>
            </div>
        </motion.div>
    );
};

export default InterestsSettings;
