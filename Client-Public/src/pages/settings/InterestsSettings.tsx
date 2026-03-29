import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface Category {
    id: number;
    name: string;
    iconUrl?: string;
}

const InterestsSettings: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [initialSelectedIds, setInitialSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const selectedIdsRef = React.useRef(selectedIds);
    const initialIdsRef = React.useRef(initialSelectedIds);

    useEffect(() => {
        selectedIdsRef.current = selectedIds;
        initialIdsRef.current = initialSelectedIds;
    }, [selectedIds, initialSelectedIds]);

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
                    const ids = myPrefs.map((p: any) => p.categoryId);
                    setSelectedIds(ids);
                    setInitialSelectedIds(ids);
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
        const handleGlobalReset = () => {
            setSelectedIds([]);
            setMessage('');
        };

        window.addEventListener('settings-save', handleGlobalSave);
        window.addEventListener('settings-reset', handleGlobalReset);

        return () => {
            window.removeEventListener('settings-save', handleGlobalSave);
            window.removeEventListener('settings-reset', handleGlobalReset);
        };
    }, []);

    const toggleCategory = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        const currentSelected = selectedIdsRef.current;
        if (currentSelected.length < 1) {
            setMessage('Please select at least 1 interest.');
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
                body: JSON.stringify(currentSelected)
            });

            if (response.ok) {
                setMessage('Interests updated successfully!');
                setInitialSelectedIds(currentSelected);
            } else {
                const errorData = await response.json();
                console.error('Save failed:', errorData);
                setMessage(`Failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage('An network error occurred.');
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
                <p className="text-deep-purple/60">Choose 1 or more interests so we can suggest the best workshops for you.</p>
            </div>

            {saving && (
                <div className="mb-6 animate-pulse text-deep-purple/40 font-bold flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Saving your interests...</span>
                </div>
            )}

            {message && (
                <div className={`mb-6 p-4 rounded-2xl font-bold flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message}
                </div>
            )}

            <div className="flex flex-wrap gap-3 mb-4">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={`
                            px-6 py-3 rounded-full border-2 font-bold text-sm transition-all duration-300
                            ${selectedIds.includes(category.id)
                                ? 'border-primary-orange bg-primary-orange text-white shadow-lg shadow-primary-orange/20'
                                : 'border-deep-purple/10 bg-white text-deep-purple hover:border-deep-purple/30'
                            }
                        `}
                    >
                        {category.name}
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
