import React, { useState } from 'react';
import { Search, ChevronRight, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { NotificationCenter } from './NotificationCenter';

export const AdminHeader: React.FC = () => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profile = useUserProfile();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/admin/pxvywv');
    };

    return (
        <header className="h-20 bg-[#000000] border-b border-[#1A1A1A] flex items-center justify-between px-8 z-40 relative">
            <div className="flex items-center gap-4">
                <img src="/Badge.svg" alt="Book My Workshop" className="h-12 w-auto" />
                <span className="font-bold text-xl text-white tracking-tight">BookMyWorkshop</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center bg-[#111111] border border-[#1A1A1A] transition-all rounded-full px-4 py-2 w-64 md:w-80 shadow-inner">
                    <Search size={16} className="text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search dashboards..."
                        className="bg-transparent border-none outline-none text-xs ml-3 text-slate-300 w-full placeholder:text-slate-600 font-mono"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <NotificationCenter />
                    <div className="h-8 w-[1px] bg-[#1A1A1A] mx-2"></div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 hover:bg-[#111] p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-[#1A1A1A] focus:outline-none"
                        >
                            <div className="w-9 h-9 rounded-full bg-indigo-500/20 p-[1px]">
                                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${profile?.fullName || 'Admin'}&background=1A1A1A&color=fff`}
                                        alt={profile?.fullName || 'Admin'}
                                    />
                                </div>
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-bold text-white leading-none">{profile?.fullName || 'Loading...'}</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{profile?.role || 'Admin'}</p>
                            </div>
                            <ChevronRight size={14} className={`text-slate-600 transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : ''}`} />
                        </button>


                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0D0D0D] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#1A1A1A] py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button className="w-full text-left px-4 py-2.5 text-xs text-slate-400 hover:bg-[#1A1A1A] hover:text-white flex items-center gap-2">
                                    <User size={14} /> Profile
                                </button>
                                <div className="h-[1px] bg-[#1A1A1A] my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
