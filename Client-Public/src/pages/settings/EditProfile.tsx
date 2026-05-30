import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Globe, Star, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Toast from '../../components/ui/Toast';
import type { ToastType } from '../../components/ui/Toast';

const EditProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Toast State
    const [toast, setToast] = useState({
        message: '',
        type: 'success' as ToastType,
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const [profile, setProfile] = useState({
        fullName: '',
        bio: '',
        pronouns: '',
        location: '',
        website: '',
        funFact: '',
        profilePictureUrl: '',
        profileUsername: ''
    });

    const profileRef = React.useRef(profile);

    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    useEffect(() => {
        fetchProfile();
    }, []); // Only fetch on mount


    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.get, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const fetchedProfile = {
                    fullName: data.fullName || '',
                    bio: data.bio || '',
                    pronouns: data.pronouns || '',
                    location: data.location || '',
                    website: data.website || '',
                    funFact: data.funFact || '',
                    profilePictureUrl: data.profilePictureUrl || '',
                    profileUsername: data.profileUsername || ''
                };
                setProfile(fetchedProfile);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.uploadAvatar, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(prev => ({ ...prev, profilePictureUrl: data.url }));
                window.dispatchEvent(new CustomEvent('profile-updated'));
            } else {
                const text = await response.text();
                try {
                    const err = JSON.parse(text);
                    showToast(err.message || 'Upload failed', 'error');
                } catch (e) {
                    console.error('Server error (non-JSON):', text);
                    showToast(`Server error: ${text.substring(0, 50)}...`, 'error');
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('An error occurred during upload', 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (saving) return;

        const currentProfile = profileRef.current;
        if (!currentProfile.fullName.trim()) {
            showToast('Full name is mandatory', 'error');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.profile.update, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(currentProfile)
            });

            if (response.ok) {
                showToast('Profile updated successfully', 'success');
                window.dispatchEvent(new CustomEvent('profile-updated'));
            } else {
                const text = await response.text();
                showToast(`Failed to update: ${text}`, 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('An unexpected error occurred', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
        >
            <div className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-deep-purple mb-3">Edit Profile</h1>
                {/* <p className="text-deep-purple/60 text-lg">
                    Information you add here will be shown on your public profile.
                </p> */}
            </div>

            <div className="space-y-12">
                <div className="flex flex-col items-start gap-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Profile Photo</label>
                    <div className="relative group w-32 h-32 rounded-full overflow-hidden bg-cream-base border-2 border-deep-purple/10 shadow-md">
                        {profile.profilePictureUrl ? (
                            <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#73A757] text-white text-4xl font-bold">
                                {profile.fullName ? profile.fullName[0].toUpperCase() : 'U'}
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            {uploadingAvatar ? (
                                <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
                            ) : (
                                <Camera size={24} className="text-white" />
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} />
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={profile.fullName}
                                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                className="w-full px-5 py-4 bg-white rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all shadow-sm"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">About</label>
                            <textarea
                                rows={4}
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full px-5 py-4 bg-white rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all shadow-sm resize-none"
                                placeholder="Share your story..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Username</label>
                            <div className="relative">
                                <span className="absolute left-4 top-4 text-deep-purple/30 font-bold">@</span>
                                <input
                                    type="text"
                                    value={profile.profileUsername}
                                    onChange={(e) => setProfile({ ...profile, profileUsername: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    className="w-full pl-9 pr-5 py-4 bg-white rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all shadow-sm"
                                    placeholder="yourusername"
                                />
                            </div>
                            {/* <p className="text-[10px] text-deep-purple/40 ml-1">Unique handle for your public profile link</p> */}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-deep-purple/20" size={20} />
                                <input
                                    type="text"
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                    className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all shadow-sm"
                                    placeholder="e.g. Kathmandu, NP"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-4 text-deep-purple/20" size={20} />
                                <input
                                    type="url"
                                    value={profile.website}
                                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                    className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all shadow-sm"
                                    placeholder="https://yourlink.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-deep-purple/40 ml-1">Fun Fact</label>
                            <div className="relative">
                                <Star className="absolute left-4 top-4 text-deep-purple/20" size={20} />
                                <input
                                    type="text"
                                    value={profile.funFact}
                                    onChange={(e) => setProfile({ ...profile, funFact: e.target.value })}
                                    className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl border border-deep-purple/5 focus:border-primary-orange outline-none transition-all shadow-sm"
                                    placeholder="Tell us something cool!"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-start mt-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-deep-purple text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Changes'}
                </button>
            </div>

            <div className="h-20" />

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </motion.div>
    );
};

export default EditProfile;
