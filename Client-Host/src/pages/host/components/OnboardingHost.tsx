import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Type,
    FileText,
    Image as ImageIcon,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Camera
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';
import Toast from '../../../components/ui/Toast';
import type { ToastType } from '../../../components/ui/Toast';
import type { ProviderProfile } from '../../../types/host';

interface OnboardingHostProps {
    profile: ProviderProfile;
    onComplete: (updatedProfile: ProviderProfile) => void;
}

export const OnboardingHost: React.FC<OnboardingHostProps> = ({ profile, onComplete }) => {
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        businessName: profile.businessName,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        state: profile.state,
        website: profile.website || '',
        tagline: profile.tagline || '',
        description: profile.description || '',
        slug: profile.slug || profile.businessName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
        coverImageUrl: profile.coverImageUrl || '',
        logoUrl: profile.logoUrl || ''
    });

    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSave = async (submit: boolean = false) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.provider.profile, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    submitForReview: submit
                })
            });

            if (response.ok) {
                const updated = await response.json();
                if (submit) {
                    showToast("Profile submitted! We'll review it shortly.", "success");
                    // Wait a bit to show success
                    setTimeout(() => onComplete(updated), 1500);
                } else {
                    onComplete(updated);
                    nextStep();
                }
            } else {
                const err = await response.json();
                showToast(err.message || "Something went wrong", "error");
            }
        } catch (error) {
            showToast("Network error", "error");
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        { id: 1, title: 'Handle', icon: Store, description: 'Choose your unique studio handle' },
        { id: 2, title: 'Identity', icon: Type, description: 'Your business name and tagline' },
        { id: 3, title: 'Story', icon: FileText, description: 'Tell us about your workshops' },
        { id: 4, title: 'Visuals', icon: ImageIcon, description: 'Add your studio banner' }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-cream-base flex items-center justify-center p-6 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-orange/5 rounded-full blur-[120px] -mr-96 -mt-96" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-deep-purple/5 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-white relative grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[600px]">

                {/* Left Sidebar - Progress */}
                <div className="lg:col-span-4 bg-deep-purple p-10 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-12">
                            <Sparkles className="text-primary-orange" size={24} />
                            <span className="font-serif text-xl font-bold italic tracking-tight">Setup your Business</span>
                        </div>

                        <div className="space-y-8">
                            {steps.map((s) => (
                                <div key={s.id} className={`flex items-start gap-4 transition-opacity duration-300 ${step >= s.id ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className={`mt-1 p-2 rounded-lg ${step === s.id ? 'bg-primary-orange text-white' : 'bg-white/10'}`}>
                                        <s.icon size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm leading-none mb-1">{s.title}</h4>
                                        <p className="text-xs text-white/50">{s.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/10 space-y-6">
                        <p className="text-xs text-white/40 leading-relaxed italic">
                            "Complete studio profiles receive significantly higher engagement from the artisan community."
                        </p>

                        <button
                            onClick={() => onComplete({ ...profile })}
                            className="text-xs font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2"
                        >
                            Skip for now and explore dashboard <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Right Content - Forms */}
                <div className="lg:col-span-8 p-12 flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-serif font-bold text-deep-purple">First, your handle.</h2>
                                    <p className="text-gray-500">This is your unique marketplace URL.</p>
                                </div>

                                <div className="relative pt-4">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-purple/20 font-mono text-sm pointer-events-none mt-2">
                                        bookmyworkshop.com/host/
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '') })}
                                        className="w-full pl-52 pr-6 py-5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none font-mono text-sm font-bold text-deep-purple"
                                        placeholder="your-studio-name"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 italic px-2">Choose something memorable. You can't change this later without support.</p>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-serif font-bold text-deep-purple">Business Identity</h2>
                                    <p className="text-gray-500">How would you like customers to see you?</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Business Registered Name</label>
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none"
                                            placeholder="The Clay Studio"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">One-line Tagline</label>
                                        <input
                                            type="text"
                                            value={formData.tagline}
                                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none"
                                            placeholder="Crafting memories, one pot at a time."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step-3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-serif font-bold text-deep-purple">Your Studio Story</h2>
                                    <p className="text-gray-500">Briefly introduce your studio and what kind of workshops you specialize in.</p>
                                </div>

                                <textarea
                                    rows={8}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none resize-none"
                                    placeholder="Welcome to our studio... We've been hosting pottery workshops for over 5 years and love sharing the art of ceramics with newcomers."
                                />
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step-4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-serif font-bold text-deep-purple">Visual Brand</h2>
                                    <p className="text-gray-500">Add a high-quality studio banner to your profile.</p>
                                </div>

                                <div className="h-64 w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group hover:border-primary-orange transition-colors cursor-pointer relative overflow-hidden">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            setSaving(true);
                                            const formDataUpload = new FormData();
                                            formDataUpload.append('file', file);

                                            try {
                                                const token = localStorage.getItem('token');
                                                const res = await fetch(API_ENDPOINTS.provider.uploadBanner, {
                                                    method: 'POST',
                                                    headers: { 'Authorization': `Bearer ${token}` },
                                                    body: formDataUpload
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setFormData({ ...formData, coverImageUrl: data.url });
                                                } else {
                                                    showToast("Upload failed", "error");
                                                }
                                            } catch (err) {
                                                showToast("Upload error", "error");
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                    />
                                    {formData.coverImageUrl ? (
                                        <img src={formData.coverImageUrl} alt="Banner" className="w-full h-full object-cover shadow-inner" />
                                    ) : (
                                        <>
                                            <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-primary-orange group-hover:scale-110 transition-all">
                                                <Camera size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-deep-purple">Upload Banner</p>
                                                <p className="text-xs text-gray-400 px-10">Recommended: 1200x400 JPG/PNG</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between pt-10 mt-auto border-t border-gray-50">
                        <button
                            onClick={prevStep}
                            disabled={step === 1 || saving}
                            className={`px-6 py-3 font-bold rounded-xl transition-all ${step === 1 ? 'opacity-0' : 'text-gray-400 hover:text-deep-purple'}`}
                        >
                            Back
                        </button>

                        <button
                            onClick={step === 4 ? () => handleSave(true) : () => handleSave(false)}
                            disabled={saving}
                            className="bg-deep-purple text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {saving ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : step === 4 ? (
                                <>Submit Profile <CheckCircle2 size={18} /></>
                            ) : (
                                <>Continue <ArrowRight size={18} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
};
