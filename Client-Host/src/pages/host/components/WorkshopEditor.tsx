import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, ChevronLeft, Save,
    Sparkles, MapPin,
    DollarSign, CheckCircle2,
    BookOpen, Layers,
    Image as ImageIcon, Play, Trash2, Camera
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';
import Toast from '../../../components/ui/Toast';
import type { ToastType } from '../../../components/ui/Toast';

interface MediaItem {
    id?: string;
    url: string;
    type: 0 | 1 | 2 | 3; // MediaType
    isPrimary: boolean;
    file?: File;
    previewUrl?: string;
}

interface Category {
    id: number;
    name: string;
}

interface WorkshopEditorProps {
    onClose: () => void;
    onSuccess: () => void;
    workshopId?: number;
}

export const WorkshopEditor: React.FC<WorkshopEditorProps> = ({ onClose, onSuccess, workshopId }) => {
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const [formData, setFormData] = useState({
        title: '',
        tagline: '',
        description: '',
        categoryId: '',
        durationHours: '2',
        durationMinutes: '0',
        maxCapacity: '10',
        minCapacity: '1',
        locationAddress: '',
        locationName: '',
        locationDetails: '',
        basePrice: '',
        safetyRequirements: '',
        whatsIncluded: '',
    });

    useEffect(() => {
        const loadInitialData = async () => {
            // Load Categories
            try {
                const catRes = await fetch(`${API_ENDPOINTS.category}`);
                const catData = await catRes.json();
                setCategories(catData);
            } catch (err) { console.error(err); }

            // Load Existing Workshop if editing
            if (workshopId) {
                try {
                    setLoading(true);
                    const res = await fetch(`${API_ENDPOINTS.workshop.base}/${workshopId}`);
                    if (res.ok) {
                        const data = await res.json();
                        // Map to form data
                        const durationParts = data.duration.split(':');
                        setFormData({
                            title: data.title || '',
                            tagline: data.tagline || '',
                            description: data.description || '',
                            categoryId: data.categoryId?.toString() || '',
                            durationHours: parseInt(durationParts[0]).toString(),
                            durationMinutes: parseInt(durationParts[1]).toString(),
                            maxCapacity: data.maxCapacity?.toString() || '',
                            minCapacity: data.minCapacity?.toString() || '',
                            locationAddress: data.locationAddress || '',
                            locationName: data.locationName || '',
                            locationDetails: data.locationDetails || '',
                            basePrice: data.pricing?.basePrice?.toString() || '',
                            safetyRequirements: data.safetyRequirements || '',
                            whatsIncluded: data.whatsIncluded || '',
                        });

                        // Map media
                        if (data.media) {
                            setMediaItems(data.media.map((m: any) => ({
                                id: m.id,
                                url: m.url,
                                type: m.mediaType,
                                isPrimary: m.isPrimary,
                                previewUrl: m.url
                            })));
                        }
                    }
                } catch (err) {
                    console.error('Error loading workshop:', err);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadInitialData();
    }, [workshopId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 0 | 1 | 2 | 3) => {
        const files = e.target.files;
        if (!files) return;

        const newItems: MediaItem[] = Array.from(files).map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            url: '',
            type,
            isPrimary: mediaItems.length === 0
        }));

        setMediaItems(prev => [...prev, ...newItems]);
    };

    const removeMedia = (index: number) => {
        setMediaItems(prev => {
            const updated = [...prev];
            if (updated[index].previewUrl) URL.revokeObjectURL(updated[index].previewUrl!);
            updated.splice(index, 1);

            if (updated.length > 0 && !updated.find(i => i.isPrimary)) {
                updated[0].isPrimary = true;
            }
            return updated;
        });
    };

    const setPrimaryMedia = (index: number) => {
        setMediaItems(prev => prev.map((item, i) => ({
            ...item,
            isPrimary: i === index
        })));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.categoryId || !formData.basePrice) {
            showToast('Title, category and price are required.', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // 1. Upload Media
            const uploadedMedia = [];
            for (const item of mediaItems) {
                if (item.file) {
                    const mediaFormData = new FormData();
                    mediaFormData.append('file', item.file);

                    const uploadRes = await fetch(`${API_ENDPOINTS.media.base}/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: mediaFormData
                    });

                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        uploadedMedia.push({
                            url: uploadData.url,
                            publicId: uploadData.publicId,
                            mediaType: item.type,
                            isPrimary: item.isPrimary,
                            displayOrder: uploadedMedia.length
                        });
                    }
                }
            }

            // 2. Prepare Payload
            const h = formData.durationHours.padStart(2, '0');
            const m = formData.durationMinutes.padStart(2, '0');
            const duration = `${h}:${m}:00`;

            const payload = {
                ...formData,
                categoryId: parseInt(formData.categoryId),
                maxCapacity: parseInt(formData.maxCapacity),
                minCapacity: parseInt(formData.minCapacity),
                basePrice: parseFloat(formData.basePrice),
                duration: duration,
                media: uploadedMedia
            };

            const url = workshopId
                ? `${API_ENDPOINTS.workshop.base}/${workshopId}`
                : `${API_ENDPOINTS.workshop.base}`;

            const method = workshopId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const newWS = await response.json();

                // Automatically submit for review
                try {
                    await fetch(`${API_ENDPOINTS.workshop.base}/${newWS.id}/publish`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (err) {
                    console.error('Auto-publish failed:', err);
                }

                showToast('Workshop submitted for review!', 'success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                const error = await response.json();
                showToast(error.message || 'Failed to create workshop', 'error');
            }
        } catch (error) {
            console.error('Error creating workshop:', error);
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, label: 'Vision', description: 'Basic details and theme', icon: Sparkles },
        { id: 2, label: 'Experience', description: 'Curriculum and benefits', icon: BookOpen },
        { id: 3, label: 'Visuals', description: 'Workshop gallery and media', icon: ImageIcon },
        { id: 4, label: 'Logistics', description: 'Timing and location', icon: MapPin },
        { id: 5, label: 'Investment', description: 'Pricing and requirements', icon: DollarSign },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans overflow-hidden">
            <header className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-deep-purple active:scale-95"
                    >
                        <X size={24} />
                    </button>
                    <div className="h-8 w-[1px] bg-gray-200" />
                    <div>
                        <h1 className="text-xl font-bold text-deep-purple">Workshop Editor</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{workshopId ? 'Editing' : 'Drafting'}: {formData.title || 'Untitled Experience'}</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-12">
                    <div className="flex gap-1">
                        {steps.map((s) => (
                            <div
                                key={s.id}
                                className={`w-8 h-1 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-primary-orange' : 'bg-gray-100'}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-deep-purple text-white font-bold rounded-xl shadow-lg hover:shadow-deep-purple/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Publishing...' : 'Publish Workshop'}
                        <Save size={16} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className="w-80 border-r border-gray-100 bg-gray-50/30 p-10 hidden lg:flex flex-col gap-10">
                    <div className="space-y-8">
                        {steps.map((s) => (
                            <div
                                key={s.id}
                                className={`flex items-start gap-5 transition-all duration-300 ${step === s.id ? 'opacity-100' : 'opacity-40'}`}
                            >
                                <div className={`mt-1 p-2 rounded-xl shadow-sm ${step === s.id ? 'bg-primary-orange text-white' : 'bg-white text-gray-400'}`}>
                                    <s.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-deep-purple">{s.label}</p>
                                    <p className="text-[11px] text-gray-500 font-medium">{s.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto p-6 bg-white border border-gray-100 rounded-3xl space-y-3">
                        <div className="flex items-center gap-2 text-primary-orange animate-pulse">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Expert Tip</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed italic">
                            "High-quality descriptions and clear pricing lead to 2.5x more bookings from first-time artisans."
                        </p>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
                    <div className="max-w-3xl mx-auto px-10 py-20 pb-40">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="vision"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-serif font-bold text-deep-purple">The Vision</h2>
                                        <p className="text-gray-500 text-lg">Define the soul of your creative workshop.</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Experience Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="e.g. Master the Art of Nepalese Thangka Painting"
                                                className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:border-primary-orange transition-all outline-none text-xl font-bold text-deep-purple placeholder:text-gray-300"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">The Mood (Tagline)</label>
                                            <input
                                                type="text"
                                                name="tagline"
                                                value={formData.tagline}
                                                onChange={handleChange}
                                                placeholder="A meditative afternoon exploring traditional spiritual motifs."
                                                className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:border-primary-orange transition-all outline-none font-medium text-gray-600"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Primary Discipline</label>
                                            <div className="relative">
                                                <select
                                                    name="categoryId"
                                                    value={formData.categoryId}
                                                    onChange={handleChange}
                                                    className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:border-primary-orange transition-all outline-none font-bold text-deep-purple appearance-none"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                                <Layers className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="experience"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-serif font-bold text-deep-purple">What you'll be doing</h2>
                                        <p className="text-gray-500 text-lg">Help guests imagine exactly what they'll be doing.</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">What to expect</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={8}
                                                placeholder="Describe the journey, the skills, and the joy..."
                                                className="w-full px-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:border-primary-orange transition-all outline-none font-medium leading-relaxed"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Guest Perks</label>
                                            <textarea
                                                name="whatsIncluded"
                                                value={formData.whatsIncluded}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="All materials, premium tea, certificate..."
                                                className="w-full px-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:border-primary-orange transition-all outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="visuals"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-serif font-bold text-deep-purple">Visuals</h2>
                                        <p className="text-gray-500 text-lg">Add high-quality images and videos.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Image Upload */}
                                        <div className="space-y-4">
                                            <label className="flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-primary-orange/50 transition-all cursor-pointer group">
                                                <Camera className="text-primary-orange mb-2" size={24} />
                                                <p className="text-sm font-bold text-deep-purple">Drop photos here</p>
                                                <input type="file" multiple accept="image/*" onChange={(e) => handleMediaUpload(e, 0)} className="hidden" />
                                            </label>
                                        </div>

                                        {/* Video Upload */}
                                        <div className="space-y-4">
                                            <label className="flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-primary-orange/50 transition-all cursor-pointer group">
                                                <Play className="text-primary-orange mb-2" size={24} />
                                                <p className="text-sm font-bold text-deep-purple">Upload video</p>
                                                <input type="file" accept="video/*" onChange={(e) => handleMediaUpload(e, 1)} className="hidden" />
                                            </label>
                                        </div>
                                    </div>

                                    {mediaItems.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 text-deep-purple/40">
                                                <ImageIcon size={16} />
                                                <span className="text-xs font-bold uppercase tracking-widest">Gallery ({mediaItems.length} items)</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <AnimatePresence mode="popLayout">
                                                    {mediaItems.map((item, idx) => (
                                                        <motion.div
                                                            key={item.previewUrl || idx}
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className={`relative aspect-square rounded-[2rem] overflow-hidden group border-4 transition-all ${item.isPrimary ? 'border-primary-orange ring-4 ring-primary-orange/20' : 'border-transparent'}`}
                                                        >
                                                            {item.type === 1 || item.type === 3 ? (
                                                                <video src={item.previewUrl} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <img src={item.previewUrl} className="w-full h-full object-cover" />
                                                            )}

                                                            {item.isPrimary && (
                                                                <div className="absolute top-4 left-4 bg-primary-orange text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg z-10">
                                                                    COVER PHOTO
                                                                </div>
                                                            )}

                                                            <div className="absolute inset-0 bg-deep-purple/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newItems = [...mediaItems];
                                                                        newItems[idx].type = item.type === 0 ? 2 : item.type === 2 ? 0 : item.type === 1 ? 3 : 1;
                                                                        setMediaItems(newItems);
                                                                    }}
                                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${[2, 3].includes(item.type) ? 'bg-primary-orange text-white' : 'bg-white text-deep-purple'}`}
                                                                >
                                                                    {[2, 3].includes(item.type) ? 'Story Mode Active' : 'Enable Story Mode'}
                                                                </button>

                                                                {!item.isPrimary && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPrimaryMedia(idx)}
                                                                        className="px-4 py-2 bg-white/20 hover:bg-white text-white hover:text-deep-purple border border-white/50 rounded-xl text-[10px] font-bold transition-all"
                                                                    >
                                                                        Set as Cover
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeMedia(idx)}
                                                                    className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all hover:scale-110"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="logistics"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-serif font-bold text-deep-purple">Logistics</h2>
                                        <p className="text-gray-500 text-lg">Where and how long?</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hours</label>
                                                <input type="number" name="durationHours" value={formData.durationHours} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Minutes</label>
                                                <input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max Capacity</label>
                                                <input type="number" name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min Capacity</label>
                                                <input type="number" name="minCapacity" value={formData.minCapacity} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</label>
                                            <input type="text" name="locationAddress" value={formData.locationAddress} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div
                                    key="investment"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-serif font-bold text-deep-purple">Investment</h2>
                                        <p className="text-gray-500 text-lg">Define the value.</p>
                                    </div>

                                    <div className="p-12 bg-primary-orange/5 border border-primary-orange/10 rounded-[3rem] flex flex-col items-center gap-8">
                                        <div className="relative w-full max-w-sm">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">Rs.</span>
                                            <input
                                                type="number"
                                                name="basePrice"
                                                value={formData.basePrice}
                                                onChange={handleChange}
                                                className="w-full pl-20 pr-8 py-8 bg-white rounded-2xl text-4xl font-bold text-deep-purple outline-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <footer className="px-10 py-8 border-t border-gray-100 flex justify-between items-center bg-white z-20">
                <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${step === 1 ? 'opacity-0' : 'text-gray-400 hover:text-deep-purple'}`}
                >
                    <ChevronLeft size={24} />
                    Previous
                </button>

                {step < 5 ? (
                    <button
                        onClick={nextStep}
                        className="flex items-center gap-3 bg-primary-orange text-white px-12 py-4 rounded-2xl font-bold shadow-lg"
                    >
                        Continue
                        <ChevronRight size={24} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-3 bg-emerald-500 text-white px-12 py-4 rounded-2xl font-bold shadow-lg"
                    >
                        {loading ? 'Creating...' : 'Launch Workshop'}
                        <CheckCircle2 size={24} />
                    </button>
                )}
            </footer>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
};
