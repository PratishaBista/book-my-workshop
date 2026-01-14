import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Filter, MoreVertical,
    Edit, CheckCircle2,
    AlertCircle, Globe, Image as ImageIcon, Trash2
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';
import { WorkshopEditor } from '../components/WorkshopEditor';

interface Workshop {
    id: number;
    title: string;
    tagline: string;
    status: number; // 0=Draft, 1=PendingReview, 2=Published, 3=Rejected
    createdAt: string;
    categories: { id: number; name: string }[];
    maxCapacity: number;
    primaryImageUrl?: string;
}

export const MyWorkshops: React.FC = () => {
    const navigate = useNavigate();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | undefined>();

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.workshop.base}/my-workshops`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWorkshops(data);
            }
        } catch (error) {
            console.error('Error fetching workshops:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: number) => {
        switch (status) {
            case 2: return 'bg-green-100 text-green-700 border-green-200';
            case 1: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 3: return 'bg-red-100 text-red-700 border-red-200';
            case 0: return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 2: return 'Published';
            case 1: return 'Pending Review';
            case 3: return 'Rejected';
            case 0: return 'Draft';
            default: return 'Unknown';
        }
    };

    const getStatusIcon = (status: number) => {
        switch (status) {
            case 2: return <CheckCircle2 size={12} />;
            case 1: return <AlertCircle size={12} />;
            case 3: return <AlertCircle size={12} />;
            default: return <Edit size={12} />;
        }
    };

    const filteredWorkshops = workshops.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.categories?.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-deep-purple">My Workshops</h2>
                    <p className="text-gray-500 mt-1">Manage, edit, and track your creative offerings.</p>
                </div>
                <button
                    onClick={() => navigate('/host/workshop/create')}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-orange text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-primary-orange/90 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>Create New Workshop</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title or category..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-orange/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-deep-purple font-semibold hover:bg-gray-50 transition-all">
                        <Filter size={18} className="text-gray-400" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Workshops List */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
                </div>
            ) : filteredWorkshops.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 py-20 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 font-serif text-4xl">?</div>
                    <h3 className="text-2xl font-bold text-deep-purple mb-2">No workshops found</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                        Looks like you haven't created any workshops matching your search. Create one now to start hosting!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredWorkshops.map((workshop, idx) => (
                            <motion.div
                                key={workshop.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                            >
                                {/* Media Overlay */}
                                <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                                    {workshop.primaryImageUrl ? (
                                        <img
                                            src={workshop.primaryImageUrl}
                                            alt={workshop.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-deep-purple/10 to-primary-orange/10 flex items-center justify-center">
                                            <ImageIcon className="text-deep-purple/20" size={40} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    <div className="absolute top-4 right-4">
                                        <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md ${getStatusStyle(workshop.status)}`}>
                                            {getStatusIcon(workshop.status)}
                                            {getStatusLabel(workshop.status)}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold text-primary-orange uppercase tracking-[0.2em]">
                                                {workshop.categories?.map(c => c.name).join(', ') || 'Uncategorized'}
                                            </span>
                                            <h4 className="text-xl font-bold text-deep-purple mt-1 line-clamp-1">{workshop.title}</h4>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to delete this workshop?')) {
                                                    const token = localStorage.getItem('token');
                                                    const res = await fetch(`${API_ENDPOINTS.workshop.base}/${workshop.id}`, {
                                                        method: 'DELETE',
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    });
                                                    if (res.ok) fetchWorkshops();
                                                }
                                            }}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 border-t border-gray-50 pt-4">
                                        <div className="flex-1">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Bookings</p>
                                            <p className="text-lg font-bold text-deep-purple">0 / {workshop.maxCapacity}</p>
                                        </div>
                                        <div className="flex-1 border-l border-gray-50 pl-4">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Revenue</p>
                                            <p className="text-lg font-bold text-deep-purple">Rs. 0</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        {workshop.status === 0 ? (
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const res = await fetch(`${API_ENDPOINTS.workshop.base}/${workshop.id}/publish`, {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        if (res.ok) {
                                                            fetchWorkshops();
                                                            // Optional: show local notification
                                                        }
                                                    } catch (err) {
                                                        console.error('Error submitting workshop:', err);
                                                    }
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-orange text-white rounded-xl text-xs font-bold hover:bg-primary-orange/90 transition-all"
                                            >
                                                <Globe size={14} />
                                                Submit for Review
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/host/workshop/edit/${workshop.id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-deep-purple text-white rounded-xl text-xs font-bold hover:bg-deep-purple/90 transition-all"
                                            >
                                                <Edit size={14} />
                                                Manage
                                            </button>
                                        )}
                                        <button className="px-3 py-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-deep-purple/5 hover:text-deep-purple transition-all">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Workshop Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <WorkshopEditor
                        workshopId={selectedWorkshopId}
                        onClose={() => {
                            setShowCreateModal(false);
                            setSelectedWorkshopId(undefined);
                        }}
                        onSuccess={() => {
                            fetchWorkshops();
                            setShowCreateModal(false);
                            setSelectedWorkshopId(undefined);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
