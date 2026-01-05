import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Link as LinkIcon, QrCode, Check, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileHeaderProps {
    profile: any;
    isOwnProfile: boolean;
    showMoreMenu: boolean;
    setShowMoreMenu: (show: boolean) => void;
    handleCopyLink: () => void;
    copied: boolean;
    moreMenuRef: React.RefObject<HTMLDivElement | null>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    profile,
    isOwnProfile,
    showMoreMenu,
    setShowMoreMenu,
    handleCopyLink,
    copied,
    moreMenuRef
}) => {
    return (
        <div className="max-w-7xl mx-auto px-4 md:px-12 relative">
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 -mt-16 md:-mt-24"
                >
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-cream-base p-1.5 shadow-2xl overflow-hidden border border-white/40">
                        <div className="w-full h-full rounded-[2rem] overflow-hidden bg-primary-orange/5 relative group">
                            {profile?.profilePictureUrl ? (
                                <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-[#73A757] text-white">
                                    {profile?.firstName?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="flex-1 pt-3 md:pt-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-primary-orange font-bold text-xs tracking-[0.2em] uppercase whitespace-nowrap"
                        >
                            <div className="w-10 h-[2px] bg-primary-orange/60" />
                            <span>{profile?.fullName || 'Artisan'}</span>
                        </motion.div>

                        <div className="flex items-center gap-3">
                            {isOwnProfile && (
                                <Link
                                    to="/settings/edit-profile"
                                    className="px-4 py-1.5 bg-deep-purple text-cream-base hover:bg-deep-purple/90 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
                                >
                                    Edit Profile
                                </Link>
                            )}

                            <div className="relative" ref={moreMenuRef}>
                                <button
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-deep-purple/5 transition-all active:scale-95 flex items-center justify-center"
                                >
                                    <MoreVertical size={16} className="text-deep-purple/60" />
                                </button>

                                <AnimatePresence>
                                    {showMoreMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 mb-4 w-44 bg-white rounded-xl shadow-2xl border border-deep-purple/10 overflow-hidden z-20"
                                        >
                                            <button onClick={handleCopyLink} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left transition-colors text-xs font-semibold">
                                                {copied ? <Check size={14} className="text-green-500" /> : <LinkIcon size={14} />}
                                                <span>{copied ? 'Copied' : 'Copy Link'}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowMoreMenu(false);
                                                    const width = 400;
                                                    const height = 600;
                                                    const left = (window.screen.width / 2) - (width / 2);
                                                    const top = (window.screen.height / 2) - (height / 2);
                                                    window.open(
                                                        `/u/${profile?.profileUsername}/qr`,
                                                        'Share Profile',
                                                        `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=no`
                                                    );
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left transition-colors text-xs font-semibold"
                                            >
                                                <QrCode size={14} />
                                                <span>Show QR</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {profile?.location && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-1.5 text-deep-purple/40 font-bold text-xs ml-0.5"
                        >
                            <MapPin size={14} />
                            <span>{profile.location}</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
