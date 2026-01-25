import React, { useState } from 'react';
import { Search, Bell, ChevronRight, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../../hooks/useUserProfile';

export const HostHeader: React.FC = () => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profile = useUserProfile();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <header className="h-20 bg-white border-b border-deep-purple/5 flex items-center justify-between px-8 shadow-sm z-40 relative">
            <div className="flex items-center gap-4">
                <img src="/Badge.png" alt="Logo" className="h-10 w-auto cursor-pointer" onClick={() => navigate('/')} />
                <span className="font-bold text-xl text-deep-purple tracking-tight">BookMyWorkshop</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center bg-gray-50 hover:bg-white border border-transparent hover:border-deep-purple/10 transition-all rounded-full px-4 py-2 w-64 md:w-80 shadow-inner">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your business..."
                        className="bg-transparent border-none outline-none text-sm ml-3 text-deep-purple w-full placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2.5 text-gray-400 hover:text-primary-orange transition-colors rounded-full hover:bg-orange-50">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary-orange rounded-full border border-white"></span>
                    </button>
                    <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-100 focus:outline-none"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-deep-purple to-primary-orange p-[2px]">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${profile?.fullName || 'Host'}&background=371D33&color=fff`}
                                        alt={profile?.fullName || 'Host'}
                                    />
                                </div>
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-bold text-deep-purple leading-none">{profile?.fullName || 'Loading...'}</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Workshop Partner</p>
                            </div>
                            <ChevronRight size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-orange flex items-center gap-2">
                                    <User size={16} /> My Profile
                                </button>
                                <div className="h-[1px] bg-gray-100 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
