import React, { useState } from 'react';
import { 
    ShieldCheck, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    Loader2,
    Camera
} from 'lucide-react';
import type { ProviderProfile } from '../../../types/host';
import { ProviderStatus } from '../../../types/host';
import { API_ENDPOINTS } from '../../../config/api';
import Toast from '../../../components/ui/Toast';
import type { ToastType } from '../../../components/ui/Toast';

interface VerificationCenterProps {
    profile: ProviderProfile;
    onUpdate: (profile: ProviderProfile) => void;
}

export const VerificationCenter: React.FC<VerificationCenterProps> = ({ profile, onUpdate }) => {
    const [uploadingId, setUploadingId] = useState(false);
    const [uploadingPan, setUploadingPan] = useState(false);
    const [uploadingStudio, setUploadingStudio] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as ToastType });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'pan' | 'studio') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('File size exceeds 5MB limit.', 'error');
            return;
        }

        if (type === 'id') setUploadingId(true);
        else if (type === 'pan') setUploadingPan(true);
        else setUploadingStudio(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            let endpoint: string;
            if (type === 'id') endpoint = API_ENDPOINTS.provider.uploadIdCard;
            else if (type === 'pan') endpoint = API_ENDPOINTS.provider.uploadPanCard;
            else endpoint = API_ENDPOINTS.provider.uploadStudioImage;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const label = type === 'id' ? 'ID Card' : type === 'pan' ? 'PAN Certificate' : 'Studio Image';
                showToast(`${label} uploaded successfully.`);
                const profileRes = await fetch(API_ENDPOINTS.provider.profile, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) onUpdate(await profileRes.json());
            } else {
                const errorData = await response.json().catch(() => ({}));
                showToast(errorData.message || 'Upload failed. Please try again.', 'error');
            }
        } catch (err) {
            showToast('Network error during upload.', 'error');
        } finally {
            if (type === 'id') setUploadingId(false);
            else if (type === 'pan') setUploadingPan(false);
            else setUploadingStudio(false);
        }
    };

    const handleSubmitForReview = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.provider.submitVerification, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showToast('Application submitted for review!', 'success');
                const profileRes = await fetch(API_ENDPOINTS.provider.profile, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) onUpdate(await profileRes.json());
            } else {
                const data = await response.json();
                showToast(data.message || 'Submission failed.', 'error');
            }
        } catch (err) {
            showToast('Network error during submission.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const isPending = profile.status === ProviderStatus.PendingReview;
    const isApproved = profile.status === ProviderStatus.Approved;
    const canSubmit = profile.idCardUrl && profile.panCardUrl && profile.studioImageUrl && !isPending && !isApproved;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-deep-purple/5 border border-deep-purple/10 flex items-center justify-center rounded-xl text-deep-purple">
                    <ShieldCheck size={20} />
                </div>
                <div>
                   <h2 className="text-2xl font-serif font-bold text-deep-purple">Security & Verification</h2>
                   <p className="text-sm text-gray-500">Fast identity verification for marketplace access.</p>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 space-y-1">
                    {/* ID Card Item */}
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${profile.idCardUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-deep-purple/10 group-hover:text-deep-purple'}`}>
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-deep-purple">Government ID</h4>
                                <p className="text-xs text-gray-400">
                                    {profile.idCardUrl ? (
                                        <span className="flex items-center gap-1 text-emerald-600 font-medium"> <CheckCircle2 size={12}/> {profile.idFileName || 'Uploaded'}</span>
                                    ) : (
                                        `Rename to: ${profile.contactPerson.replace(/\s+/g, '_')}_ID.jpg`
                                    )}
                                </p>
                            </div>
                        </div>
                        
                        {!profile.idCardUrl && (
                            <label className="cursor-pointer px-4 py-2 bg-deep-purple text-white text-xs font-bold rounded-lg hover:scale-105 transition-all active:scale-95 shadow-md">
                                {uploadingId ? <Loader2 className="animate-spin" size={14} /> : 'Upload'}
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'id')} accept="image/*,.pdf" />
                            </label>
                        )}
                        {profile.idCardUrl && !profile.isIdVerified && <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded-md">Pending</span>}
                        {profile.isIdVerified && <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Verified</span>}
                    </div>

                    <div className="h-px bg-gray-50 mx-4" />

                    {/* PAN Card Item */}
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${profile.panCardUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-deep-purple/10 group-hover:text-deep-purple'}`}>
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-deep-purple">PAN Certificate</h4>
                                <p className="text-xs text-gray-400">
                                    {profile.panCardUrl ? (
                                        <span className="flex items-center gap-1 text-emerald-600 font-medium"> <CheckCircle2 size={12}/> {profile.panFileName || 'Uploaded'}</span>
                                    ) : (
                                        `Rename to: ${profile.contactPerson.replace(/\s+/g, '_')}_PAN.jpg`
                                    )}
                                </p>
                            </div>
                        </div>
                        
                        {!profile.panCardUrl && (
                            <label className="cursor-pointer px-4 py-2 bg-deep-purple text-white text-xs font-bold rounded-lg hover:scale-105 transition-all active:scale-95 shadow-md">
                                {uploadingPan ? <Loader2 className="animate-spin" size={14} /> : 'Upload'}
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'pan')} accept="image/*,.pdf" />
                            </label>
                        )}
                        {profile.panCardUrl && !profile.isPanVerified && <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded-md">Pending</span>}
                        {profile.isPanVerified && <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Verified</span>}
                    </div>

                    <div className="h-px bg-gray-50 mx-4" />

                    {/* Studio Image Item */}
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${profile.studioImageUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-deep-purple/10 group-hover:text-deep-purple'}`}>
                                <Camera size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-deep-purple">Studio / Workspace Photo</h4>
                                <p className="text-xs text-gray-400">
                                    {profile.studioImageUrl ? (
                                        <span className="flex items-center gap-1 text-emerald-600 font-medium"> <CheckCircle2 size={12}/> {profile.studioFileName || 'Uploaded'}</span>
                                    ) : (
                                        'A clear photo of your studio or workspace'
                                    )}
                                </p>
                            </div>
                        </div>

                        {profile.studioImageUrl ? (
                            <div className="relative group/img cursor-pointer">
                                <img
                                    src={profile.studioImageUrl}
                                    alt="Studio"
                                    className="w-16 h-11 object-cover rounded-lg border border-gray-200"
                                />
                                <label className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                    <Camera size={14} className="text-white" />
                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'studio')} accept="image/*" />
                                </label>
                            </div>
                        ) : (
                            <label className="cursor-pointer px-4 py-2 bg-deep-purple text-white text-xs font-bold rounded-lg hover:scale-105 transition-all active:scale-95 shadow-md">
                                {uploadingStudio ? <Loader2 className="animate-spin" size={14} /> : 'Upload'}
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'studio')} accept="image/*" />
                            </label>
                        )}
                    </div>
                </div>

                <div className="bg-[#FAF9F6] p-6 border-t border-gray-100">
                    {/* Progress indicator */}
                    <div className="flex gap-2 mb-4">
                        {[
                            { done: !!profile.idCardUrl, label: 'Gov ID' },
                            { done: !!profile.panCardUrl, label: 'PAN' },
                            { done: !!profile.studioImageUrl, label: 'Studio' },
                        ].map((step) => (
                            <div key={step.label} className="flex-1">
                                <div className={`h-1.5 rounded-full transition-all duration-500 ${step.done ? 'bg-emerald-500' : 'bg-gray-100'}`} />
                                <p className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${step.done ? 'text-emerald-500' : 'text-gray-300'}`}>{step.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <p className="text-[11px] font-bold text-deep-purple/40 uppercase tracking-widest mb-1">Final Step</p>
                            <p className="text-xs text-deep-purple/60 leading-relaxed font-medium">
                                {isApproved ? 'Your account is fully verified.' : isPending ? 'Documents under review.' : 'Submit all 3 documents for review.'}
                            </p>
                        </div>
                        <button
                            onClick={handleSubmitForReview}
                            disabled={!canSubmit || submitting}
                            className={`px-8 py-3 rounded-xl font-bold uppercase text-[11px] tracking-wider transition-all shadow-sm ${
                                canSubmit 
                                ? 'bg-primary-orange text-white hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {submitting ? 'Submitting...' : isPending ? 'Pending Review' : 'Seal Application'}
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
