import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HostDashboardNavbar from '../../components/host/HostDashboardNavbar';
import Footer from '../../components/landing/Footer';
import { Plus, Home, Settings, Calendar, AlertCircle } from 'lucide-react';

const HostDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isApproved, setIsApproved] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // 1. Check Auth
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // 2. Decode user info
        try {
            const parts = token.split('.');
            if (parts.length < 2) throw new Error("Invalid token format");

            const payload = JSON.parse(atob(parts[1]));
            setUser({
                name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name,
                email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
                role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role
            });

            // 3. Check Approval Status (Simulated from localStorage for now, 
            //    in real app should be a claim or API fetch)
            const approved = localStorage.getItem('isApproved') === 'true';
            setIsApproved(approved);

        } catch (e) {
            console.error(e);
            navigate('/login');
        }
    }, [navigate]);

    // const handleLogout = () => {
    //     localStorage.clear();
    //     navigate('/');
    // };

    return (
        <div className="min-h-screen bg-cream-base flex flex-col font-sans text-deep-purple">
            <HostDashboardNavbar />

            <main className="flex-grow pt-28 px-6 max-w-7xl mx-auto w-full">

                {/* 1. Header & Welcome */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-serif text-4xl mb-2">
                            Welcome back, <span className="text-primary-orange">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-gray-500">Manage your workshops and bookings</p>
                    </div>
                </div>

                {/* 2. Status Banner (If Pending) */}
                {!isApproved && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-4"
                    >
                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-700 mt-1">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-yellow-800 text-sm mb-1">Your host account is under review</h3>
                            <p className="text-yellow-700 text-sm leading-relaxed">
                                Thanks for signing up! We're currently reviewing your details to ensure the quality of our community.
                                You'll be notified via email once approved. In the meantime, you can complete your profile.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* 3. Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Quick Actions */}
                    <div className="space-y-6">
                        {/* Create Workshop Card */}
                        <div className={`rounded-2xl p-6 border transition-all ${isApproved ? 'bg-white border-deep-purple/10 hover:shadow-lg cursor-pointer' : 'bg-gray-50 border-gray-100 opacity-70 cursor-not-allowed'}`}>
                            <div className="w-12 h-12 rounded-full bg-primary-orange/10 flex items-center justify-center text-primary-orange mb-4">
                                <Plus size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Create Workshop</h3>
                            <p className="text-sm text-gray-500 mb-4">Launch a new experience for your audience.</p>
                            <button
                                disabled={!isApproved}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold w-full transition-colors ${isApproved ? 'bg-deep-purple text-white hover:bg-deep-purple/90' : 'bg-gray-200 text-gray-400'}`}
                            >
                                {isApproved ? 'Create Now' : 'Pending Approval'}
                            </button>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white border border-deep-purple/10 rounded-2xl p-6 hover:shadow-lg transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-deep-purple text-white flex items-center justify-center text-xl font-serif">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold">{user?.name}</h3>
                                    <p className="text-xs text-gray-400">{user?.role}</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-sm font-semibold text-deep-purple hover:text-primary-orange transition-colors w-full border-t border-gray-100 pt-4">
                                <Settings size={16} />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Your Workshops (Empty State) */}
                    <div className="md:col-span-2">
                        <div className="bg-white border border-deep-purple/10 rounded-2xl p-8 min-h-[400px] flex flex-col">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-primary-orange" />
                                Your Workshops
                            </h3>

                            {/* Empty State */}
                            <div className="flex-grow flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Home size={32} className="text-gray-300" />
                                </div>
                                <h4 className="font-bold text-gray-400 mb-2">No workshops yet</h4>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                    {isApproved
                                        ? "You haven't published any workshops yet. Click 'Create Workshop' to get started!"
                                        : "Once approved, your published workshops will appear here."}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HostDashboard;
