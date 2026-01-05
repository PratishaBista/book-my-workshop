import React, { useState } from 'react';
import { Search, Bell, ChevronRight, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../../hooks/useUserProfile';

export const AdminHeader: React.FC = () => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profile = useUserProfile();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/admin/pxvywv');
    };

    return (
        <header className="h-20 bg-white border-b border-orange-100/50 flex items-center justify-between px-8 shadow-sm z-40 relative">
            <div className="flex items-center gap-4">
                <img src="/Badge.png" alt="Logo" className="h-10 w-auto" />
                <span className="font-bold text-xl text-slate-800 tracking-tight">BookMyWorkshop</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center bg-slate-100 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all rounded-full px-4 py-2 w-64 md:w-80 shadow-inner">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search dashboards..."
                        className="bg-transparent border-none outline-none text-sm ml-3 text-slate-700 w-full placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2.5 text-slate-400 hover:text-[#E57A44] transition-colors rounded-full hover:bg-orange-50">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#E57A44] rounded-full border border-white"></span>
                    </button>
                    <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-100 focus:outline-none"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E57A44] to-orange-400 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${profile?.fullName || 'Admin'}&background=E57A44&color=fff`}
                                        alt={profile?.fullName || 'Admin'}
                                    />
                                </div>
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-bold text-slate-800 leading-none">{profile?.fullName || 'Loading...'}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{profile?.role || 'Admin'}</p>
                            </div>
                            <ChevronRight size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : ''}`} />
                        </button>


                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#E57A44] flex items-center gap-2">
                                    <User size={16} /> Profile
                                </button>
                                <div className="h-[1px] bg-slate-100 my-1"></div>
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
