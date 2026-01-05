import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, ChevronLeft, Save,
    BookOpen, Clock, MapPin,
    DollarSign, CheckCircle2
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';
import Toast from '../../../components/ui/Toast';
import type { ToastType } from '../../../components/ui/Toast';

interface Category {
    id: number;
    name: string;
}

interface CreateWorkshopFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateWorkshopForm: React.FC<CreateWorkshopFormProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Toast State
    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

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
        fetch(`${API_ENDPOINTS.category}`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        if (!formData.title || !formData.categoryId || !formData.basePrice) {
            showToast('Please fill in essential fields.', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const h = formData.durationHours.padStart(2, '0');
            const m = formData.durationMinutes.padStart(2, '0');
            const duration = `${h}:${m}:00`;

            const payload = {
                ...formData,
                categoryId: parseInt(formData.categoryId),
                maxCapacity: parseInt(formData.maxCapacity),
                minCapacity: parseInt(formData.minCapacity),
                basePrice: parseFloat(formData.basePrice),
                duration: duration
            };

            const response = await fetch(`${API_ENDPOINTS.workshop.base}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Workshop created successfully!', 'success');
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
        { id: 1, label: 'Basics', icon: BookOpen },
        { id: 2, label: 'Details', icon: Clock },
        { id: 3, label: 'Where', icon: MapPin },
        { id: 4, label: 'Pricing', icon: DollarSign },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-deep-purple/20 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-deep-purple">New Workshop</h2>
                        <p className="text-sm text-gray-500">Draft your creative experience</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex px-12 py-6 justify-between relative">
                    <div className="absolute top-1/2 left-12 right-12 h-[2px] bg-gray-100 -translate-y-1/2 -z-10" />
                    {steps.map((s) => (
                        <div key={s.id} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= s.id ? 'bg-primary-orange text-white shadow-lg' : 'bg-white border-2 border-gray-100 text-gray-300'
                                }`}>
                                {step > s.id ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-primary-orange' : 'text-gray-300'
                                }`}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-12 pt-4 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Workshop Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Traditional Pottery Masterclass"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Catchy Tagline</label>
                                    <input
                                        type="text"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleChange}
                                        placeholder="One sentence that summarizes the vibe"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Category</label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium appearance-none"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Full Story / Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Tell them what they will learn, feel, and create..."
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-orange/20 transition-all font-medium resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Duration (Hours)</label>
                                        <input
                                            type="number"
                                            name="durationHours"
                                            value={formData.durationHours}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Minutes</label>
                                        <input
                                            type="number"
                                            name="durationMinutes"
                                            value={formData.durationMinutes}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Max Capacity</label>
                                        <input
                                            type="number"
                                            name="maxCapacity"
                                            value={formData.maxCapacity}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Min Capacity</label>
                                        <input
                                            type="number"
                                            name="minCapacity"
                                            value={formData.minCapacity}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">What's Included?</label>
                                    <textarea
                                        name="whatsIncluded"
                                        value={formData.whatsIncluded}
                                        onChange={handleChange}
                                        placeholder="Materials, drinks, certificate, etc."
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Full Address</label>
                                    <input
                                        type="text"
                                        name="locationAddress"
                                        value={formData.locationAddress}
                                        onChange={handleChange}
                                        placeholder="Street, City, Area"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Venue Name (Optional)</label>
                                    <input
                                        type="text"
                                        name="locationName"
                                        value={formData.locationName}
                                        onChange={handleChange}
                                        placeholder="e.g. My Pottery Studio"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Extra Location Details</label>
                                    <textarea
                                        name="locationDetails"
                                        value={formData.locationDetails}
                                        onChange={handleChange}
                                        placeholder="Floor number, landmark, how to enter..."
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-8 bg-primary-orange/5 rounded-[2.5rem] border border-primary-orange/10 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-orange shadow-sm mb-4">
                                        <DollarSign size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-deep-purple mb-2">Almost Done!</h4>
                                    <p className="text-sm text-gray-500 mb-6 font-medium">Set a fair price for your craft. You can always edit this later.</p>

                                    <div className="w-full max-w-xs relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">Rs.</span>
                                        <input
                                            type="number"
                                            name="basePrice"
                                            value={formData.basePrice}
                                            onChange={handleChange}
                                            placeholder="2500"
                                            className="w-full pl-16 pr-6 py-6 bg-white border-none rounded-[2rem] text-3xl font-bold text-deep-purple focus:ring-2 focus:ring-primary-orange/20 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-deep-purple uppercase tracking-wider">Safety Requirements (Optional)</label>
                                    <textarea
                                        name="safetyRequirements"
                                        value={formData.safetyRequirements}
                                        onChange={handleChange}
                                        placeholder="Age limits, clothing, allergies..."
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl transition-all resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-50 flex justify-between bg-gray-50/30">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${step === 1 ? 'opacity-0 cursor-default' : 'text-gray-400 hover:bg-gray-100 hover:text-deep-purple'
                            }`}
                    >
                        <ChevronLeft size={20} />
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 bg-deep-purple text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-deep-purple/90 transition-all active:scale-95"
                        >
                            Continue
                            <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 bg-primary-orange text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    Launch Workshop
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Toast Notification */}
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />
            </motion.div>
        </div>
    );
};
