import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Home, Star, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPicker } from '../../../components/ui/MapPicker';
import { API_ENDPOINTS } from '../../../config/api';
import type { Venue } from '../../../types/host';

export const VenueManager: React.FC = () => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVenue, setNewVenue] = useState({
        name: '',
        address: '',
        latitude: 27.7172,
        longitude: 85.3240,
        description: '',
        isDefault: false
    });

    const fetchVenues = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.venues, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setVenues(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const handleAddVenue = async () => {
        if (!newVenue.name || !newVenue.address) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.venues, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newVenue)
            });

            if (res.ok) {
                setShowAddForm(false);
                setNewVenue({ name: '', address: '', latitude: 27.7172, longitude: 85.3240, description: '', isDefault: false });
                fetchVenues();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteVenue = async (id: number) => {
        if (!window.confirm('Are you sure? This will unlinked this venue from existing workshops.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ENDPOINTS.venues}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchVenues();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-bold text-deep-purple font-serif">Asset Management: Venues</h3>
                    <p className="text-sm text-gray-500 mt-1">Register and manage your hosting locations.</p>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-orange text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Add New Venue
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Venue Identity</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Thamel Pottery Studio"
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange outline-none transition-all"
                                        value={newVenue.name}
                                        onChange={e => setNewVenue({ ...newVenue, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                                    <input
                                        type="text"
                                        placeholder="Full address for participants"
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange outline-none transition-all"
                                        value={newVenue.address}
                                        onChange={e => setNewVenue({ ...newVenue, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Instruction Details</label>
                                    <textarea
                                        placeholder="e.g. 2nd building on the left, park at blue gate."
                                        rows={3}
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary-orange outline-none transition-all resize-none"
                                        value={newVenue.description}
                                        onChange={e => setNewVenue({ ...newVenue, description: e.target.value })}
                                    />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-gray-200 text-primary-orange focus:ring-primary-orange/20"
                                        checked={newVenue.isDefault}
                                        onChange={e => setNewVenue({ ...newVenue, isDefault: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-deep-purple transition-colors">Set as Primary Hosting Location</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Map Synchronization</label>
                                <MapPicker
                                    lat={newVenue.latitude}
                                    lng={newVenue.longitude}
                                    onChange={(lat: number, lng: number, address?: string) => {
                                        setNewVenue(prev => ({
                                            ...prev,
                                            latitude: lat,
                                            longitude: lng,
                                            address: address || prev.address
                                        }));
                                    }}
                                />
                                <div className="flex gap-4 px-2 text-[10px] text-gray-400 font-mono">
                                    <span>Lat: {newVenue.latitude.toFixed(5)}</span>
                                    <span>Lng: {newVenue.longitude.toFixed(5)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddVenue}
                                className="px-8 py-3 bg-deep-purple text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all"
                            >
                                Register Venue
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center animate-pulse text-gray-300 font-bold uppercase tracking-widest text-xs">Synchronizing Asset Buffer...</div>
                ) : venues.length === 0 ? (
                    <div className="col-span-full py-20 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                        <Home size={40} className="text-gray-200 mb-4" />
                        <h4 className="font-bold text-gray-400">No Venues Registered</h4>
                        <p className="text-xs text-gray-400 max-w-xs mt-1">Register your first venue to start hosting workshops.</p>
                    </div>
                ) : (venues as Venue[]).map((venue: Venue) => (
                    <div
                        key={venue.id}
                        className={`group relative bg-white p-6 rounded-[2.5rem] border transition-all ${venue.isDefault ? 'border-primary-orange shadow-lg shadow-orange-50' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${venue.isDefault ? 'bg-primary-orange text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-deep-purple group-hover:text-white'} transition-colors`}>
                                <Building2 size={24} />
                            </div>
                            <button
                                onClick={() => handleDeleteVenue(venue.id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <h4 className="font-bold text-deep-purple text-lg line-clamp-1">{venue.name}</h4>
                        <div className="flex items-start gap-2 mt-2 text-xs text-gray-500 min-h-[32px]">
                            <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{venue.address}</span>
                        </div>

                        {venue.isDefault && (
                            <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-primary-orange rounded-full w-fit">
                                <Star size={10} fill="currentColor" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Primary Location</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
