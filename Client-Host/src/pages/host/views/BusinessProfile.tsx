import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Store,
    Type,
    FileText,
    Globe,
    Phone,
    Camera,
    CheckCircle2,
    AlertCircle,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';
import Toast from '../../../components/ui/Toast';
import type { ToastType } from '../../../components/ui/Toast';
import type { ProviderProfile } from '../../../types/host';
import { ProviderStatus } from '../../../types/host';
import { VenueManager } from '../components/VenueManager';

interface BusinessProfileProps {
    profile: ProviderProfile;
    onUpdate: (updated: ProviderProfile) => void;
}

export const BusinessProfile: React.FC<BusinessProfileProps> = ({ profile, onUpdate }) => {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        businessName: profile.businessName,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        state: profile.state,
        website: profile.website || '',
        tagline: profile.tagline || '',
        description: profile.description || '',
        slug: profile.slug || '',
        logoUrl: profile.logoUrl || '',
        coverImageUrl: profile.coverImageUrl || ''
    });

    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const location = useLocation();
    const venuesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('section') === 'venues' && venuesRef.current) {
            setTimeout(() => {
                venuesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500); // Small delay to allow rendering
        }
    }, [location]);

    useEffect(() => {
        setFormData({
            businessName: profile.businessName,
            phoneNumber: profile.phoneNumber,
            address: profile.address,
            state: profile.state,
            website: profile.website || '',
            tagline: profile.tagline || '',
            description: profile.description || '',
            slug: profile.slug || '',
            logoUrl: profile.logoUrl || '',
            coverImageUrl: profile.coverImageUrl || ''
        });
    }, [profile]);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

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
                onUpdate(updated);
                showToast(submit ? "Profile submitted for review!" : "Changes saved successfully", "success");
            } else {
                const err = await response.json();
                showToast(err.message || "Failed to update profile", "error");
            }
        } catch (error) {
            showToast("Network error", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
        setSaving(true);
        const data = new FormData();
        data.append('file', file);

        const endpoint = type === 'logo' ? API_ENDPOINTS.provider.uploadLogo : API_ENDPOINTS.provider.uploadBanner;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                const result = await res.json();
                setFormData(prev => ({
                    ...prev,
                    [type === 'logo' ? 'logoUrl' : 'coverImageUrl']: result.url
                }));
                showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded`, "success");
            }
        } catch (err) {
            showToast("Upload failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const isLocked = profile.status === ProviderStatus.PendingReview;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-deep-purple mb-2">Business Profile</h1>
                    <p className="text-gray-500">Manage your studio branding and public marketplace presence.</p>
                </div>

                <div className="flex items-center gap-4">
                    {profile.status === ProviderStatus.Incomplete && (
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            className="bg-primary-orange text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            Submit for Review
                        </button>
                    )}
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving || isLocked}
                        className="bg-deep-purple text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {isLocked && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 text-blue-700">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">Your profile is currently under review. Some information might be locked.</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="relative group mb-4">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                                {formData.logoUrl ? (
                                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Store size={40} className="text-gray-300" />
                                )}
                                {!isLocked && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="text-white" size={24} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <h3 className="font-bold text-deep-purple">Studio Logo</h3>
                        <p className="text-xs text-gray-400 mt-1">Recommended square PNG</p>
                    </div>

                    <div className="bg-deep-purple p-6 rounded-[32px] text-white">
                        <h4 className="font-serif italic text-lg mb-4 text-primary-orange">Partner Status</h4>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${profile.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                <CheckCircle2 size={18} />
                            </div>
                            <span className="font-bold">
                                {profile.status === ProviderStatus.Approved ? 'Verified Partner' :
                                    profile.status === ProviderStatus.PendingReview ? 'Under Review' : 'Setup Required'}
                            </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                            Verified partners appear higher in search results and can access premium marketplace tools.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                        <h3 className="font-bold text-deep-purple mb-4">Studio Background</h3>
                        <div className="w-full h-48 bg-gray-50 rounded-2xl relative overflow-hidden group border border-gray-100">
                            {formData.coverImageUrl ? (
                                <img src={formData.coverImageUrl} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                                    <ImageIcon size={40} />
                                    <span className="text-xs">No banner uploaded</span>
                                </div>
                            )}
                            {!isLocked && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white font-bold text-sm flex items-center gap-2">
                                        <Camera size={16} /> Update Banner
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload('banner', e.target.files[0])}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                                    <Store size={12} /> Studio Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    disabled={isLocked}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                                    <Type size={12} /> Public Handle
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">host/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                        disabled={isLocked}
                                        className="w-full pl-16 pr-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                                <FileText size={12} /> Studio Tagline
                            </label>
                            <input
                                type="text"
                                value={formData.tagline}
                                placeholder="A short catchphrase that describes your studio"
                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                disabled={isLocked}
                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                                <FileText size={12} /> Detailed Bio
                            </label>
                            <textarea
                                rows={6}
                                value={formData.description}
                                placeholder="Tell your artisans about your experience, your workspace, and what makes your workshops special."
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                disabled={isLocked}
                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                                    <Globe size={12} /> Website (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    placeholder="https://yourwebsite.com"
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    disabled={isLocked}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                                    <Phone size={12} /> Primary Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    disabled={isLocked}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div ref={venuesRef} className="space-y-4 pt-8 border-t border-gray-50">
                            <VenueManager />
                        </div>
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
