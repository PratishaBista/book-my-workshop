import React, { useState } from 'react';
import { 
    ShieldCheck, 
    Upload, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    Search,
    Loader2
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
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as ToastType });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'pan') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size exceeds 5MB limit.', 'error');
            return;
        }

        const isId = type === 'id';
        isId ? setUploadingId(true) : setUploadingPan(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const endpoint = isId ? API_ENDPOINTS.provider.uploadIdCard : API_ENDPOINTS.provider.uploadPanCard;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                showToast(`${isId ? 'ID Card' : 'PAN Certificate'} uploaded successfully.`);
                // Refresh profile to get updated file names
                const profileRes = await fetch(API_ENDPOINTS.provider.profile, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) onUpdate(await profileRes.json());
            } else {
                showToast('Upload failed. Please try again.', 'error');
            }
        } catch (err) {
            showToast('Network error during upload.', 'error');
        } finally {
            isId ? setUploadingId(false) : setUploadingPan(false);
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
    const canSubmit = profile.idCardUrl && profile.panCardUrl && !isPending && !isApproved;

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-deep-purple p-2.5 rounded-2xl text-white shadow-xl rotate-3">
                    <ShieldCheck className="w-full h-full" />
                </div>
                <div>
                   <h2 className="text-3xl font-serif font-bold text-deep-purple">Security & Verification</h2>
                   <p className="text-gray-500">Verify your identity to unlock marketplace publishing features.</p>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Government ID Card */}
                <div className={`p-8 bg-white border-2 rounded-[2.5rem] transition-all ${profile.idCardUrl ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-50'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile.idCardUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FileText size={24} />
                        </div>
                        {profile.isIdVerified && (
                             <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Approved</span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-deep-purple mb-2">Government ID</h3>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed italic">
                        <strong className="text-primary-orange block mb-1">Naming Policy:</strong>
                        Document MUST be named <strong>{profile.contactPerson.replace(/\s+/g, '_')}_ID.jpg</strong> (or .pdf)
                    </p>
                    
                    <div className="relative">
                        {profile.idCardUrl ? (
                            <div className="flex items-center gap-3 p-3 bg-white border border-emerald-100 rounded-xl">
                                <Search size={16} className="text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-700 truncate max-w-[150px]">{profile.idFileName || 'Document-ID.jpg'}</span>
                                <CheckCircle2 size={16} className="text-emerald-500 ml-auto" />
                            </div>
                        ) : (
                            <label className="flex items-center justify-center gap-3 w-full py-4 bg-deep-purple text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-[#4A2946] transition-all">
                                {uploadingId ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                {uploadingId ? 'Uploading...' : 'Scan & Upload ID'}
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'id')} accept="image/*,.pdf" />
                            </label>
                        )}
                    </div>
                </div>

                {/* PAN Certificate */}
                <div className={`p-8 bg-white border-2 rounded-[2.5rem] transition-all ${profile.panCardUrl ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-50'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile.panCardUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            <AlertCircle size={24} />
                        </div>
                        {profile.isPanVerified && (
                             <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Approved</span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-deep-purple mb-2">PAN Certificate</h3>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed italic">
                         <strong className="text-primary-orange block mb-1">Naming Policy:</strong>
                         Document MUST be named <strong>{profile.contactPerson.replace(/\s+/g, '_')}_PAN.jpg</strong> (or .pdf)
                    </p>
                    
                    <div className="relative">
                        {profile.panCardUrl ? (
                            <div className="flex items-center gap-3 p-3 bg-white border border-emerald-100 rounded-xl">
                                <Search size={16} className="text-emerald-500" />
                                <span className="text-xs font-medium text-emerald-700 truncate max-w-[150px]">{profile.panFileName || 'PAN-Cert.pdf'}</span>
                                <CheckCircle2 size={16} className="text-emerald-500 ml-auto" />
                            </div>
                        ) : (
                            <label className="flex items-center justify-center gap-3 w-full py-4 bg-deep-purple text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-[#4A2946] transition-all">
                                {uploadingPan ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                {uploadingPan ? 'Uploading...' : 'Upload PAN Certificate'}
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'pan')} accept="image/*,.pdf" />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Submission Status */}
            <div className="bg-[#1A1A1A] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-2">
                            {isApproved ? 'You are fully verified!' : isPending ? 'Submission under review' : 'Seal your application'}
                        </h3>
                        <p className="text-white/50 text-sm max-w-md lead-relaxed">
                            {isApproved ? 'Your studio is active and visible in the marketplace.' : 
                             isPending ? 'Our team is carefully reviewing your identity documents. We will notify you via email shortly.' : 
                             'Once both documents are uploaded, our Trust Engine will perform a consistency check before notifying our admin team.'}
                        </p>
                    </div>

                    <button
                        onClick={handleSubmitForReview}
                        disabled={!canSubmit || submitting}
                        className={`px-10 py-5 rounded-2xl font-bold tracking-widest uppercase text-xs transition-all ${
                            canSubmit ? 'bg-primary-orange text-white hover:scale-105 shadow-xl' : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                    >
                        {submitting ? 'Authenticating...' : isPending ? 'Pending Review' : 'Submit Application'}
                    </button>
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
