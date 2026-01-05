import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface ProfileQRProps {
    standalone?: boolean;
    onClose?: () => void;
    profileData?: any;
}

const ProfileQR: React.FC<ProfileQRProps> = ({ standalone = true, profileData }) => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<any>(profileData || null);
    const [loading, setLoading] = useState(!profileData);

    useEffect(() => {
        if (!profileData && username) {
            fetchProfile();
        }
    }, [username, profileData]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const url = `${API_ENDPOINTS.profile.get}/u/${username}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile for QR:', error);
        } finally {
            setLoading(false);
        }
    };

    const profileUrl = `${window.location.origin}/u/${username || profile?.profileUsername}`;

    const handleDownload = () => {
        const svg = document.getElementById('profile-qr-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = 1000;
            canvas.height = 1000;
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 100, 100, 800, 800);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `${username || 'profile'}-qr.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
            </div>
        );
    }

    const content = (
        <div className="flex flex-col items-center gap-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 w-full max-w-[320px] aspect-[4/5] flex flex-col justify-between"
            >
                <div className="flex-1 flex items-center justify-center p-2 relative">
                    <div className="relative group p-4 bg-white rounded-[2rem]">
                        <svg width="0" height="0" className="absolute">
                            <defs>
                                <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8A2BE2" /> {/* Purple */}
                                    <stop offset="50%" stopColor="#471807ff" /> {/* Orange */}
                                    <stop offset="100%" stopColor="#ffd900ff" /> {/* Yellow */}
                                </linearGradient>
                            </defs>
                        </svg>
                        <QRCodeSVG
                            id="profile-qr-svg"
                            value={profileUrl}
                            size={220}
                            level="M"
                            includeMargin={false}
                            fgColor="url(#qr-gradient)"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-inner bg-primary-orange/5 ring-2 ring-white ring-offset-2 ring-offset-gray-50">
                        {profile?.profilePictureUrl ? (
                            <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#73A757] text-white font-bold text-sm">
                                {profile?.firstName?.[0] || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-deep-purple text-base leading-tight uppercase tracking-tight">
                            {profile?.fullName}
                        </span>
                        <span className="text-deep-purple/40 text-xs font-semibold">
                            @{profile?.profileUsername}
                        </span>
                    </div>
                </div>
            </motion.div>

            {standalone && (
                <div className="flex gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-deep-purple rounded-xl text-xs font-bold shadow-sm border border-deep-purple/5 transition-all active:scale-95"
                    >
                        <Download size={16} />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={() => navigator.share?.({ title: `${profile?.fullName}'s Profile`, url: profileUrl })}
                        className="flex items-center gap-2 px-5 py-2.5 bg-deep-purple text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>
                </div>
            )}
        </div>
    );

    if (standalone) {
        return (
            <div className="min-h-screen bg-[#14181c] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
                {content}
                <div className="mt-8 text-white/20 font-serif italic text-lg tracking-tight">
                    BookMyWorkshop
                </div>
            </div>
        );
    }

    return content;
};

export default ProfileQR;
