import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Trash2,
    Users,
    ArrowRight
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';
import Toast, { type ToastType } from '../../../components/ui/Toast';

interface Workshop {
    id: number;
    title: string;
    duration: string;
    maxCapacity: number;
    primaryImageUrl?: string;
}

interface Schedule {
    id: number;
    startDateTime: string;
    endDateTime: string;
    availableSeats: number;
    maxCapacity: number;
    isSoldOut: boolean;
}

export const ScheduleManagement: React.FC = () => {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | undefined>();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' as ToastType, isVisible: false });

    const [newSchedule, setNewSchedule] = useState<{
        date: string;
        startTime: string;
        capacity: number;
    }>({
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        capacity: 0
    });

    useEffect(() => {
        fetchWorkshops();
    }, []);

    useEffect(() => {
        if (selectedWorkshopId) {
            fetchSchedules(selectedWorkshopId);
            const workshop = workshops.find(w => w.id === selectedWorkshopId);
            if (workshop) {
                setNewSchedule(prev => ({ ...prev, capacity: workshop.maxCapacity }));
            }
        }
    }, [selectedWorkshopId]);

    const fetchWorkshops = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.workshop.base}/my-workshops`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWorkshops(data);
                if (data.length > 0 && !selectedWorkshopId) {
                    setSelectedWorkshopId(data[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch workshops:', err);
        }
    };

    const fetchSchedules = async (workshopId: number) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.workshop.base}/${workshopId}/schedule`);
            if (response.ok) {
                const data = await response.json();
                setSchedules(data);
            }
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedule = async () => {
        const workshop = workshops.find(w => w.id === selectedWorkshopId);
        if (!workshop || !newSchedule.date) return;

        const startDateTimeStr = `${newSchedule.date}T${newSchedule.startTime}:00`;
        const startDate = new Date(startDateTimeStr);

        const [h, m, s] = workshop.duration.split(':').map(Number);
        const endDate = new Date(startDate.getTime() + (h * 3600 + m * 60 + (s || 0)) * 1000);

        const finalStartDateTime = startDate.toISOString().split('.')[0].replace('Z', '');
        const endDateTime = endDate.toISOString().split('.')[0].replace('Z', '');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.workshop.base}/${selectedWorkshopId}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    startDateTime: finalStartDateTime,
                    endDateTime,
                    availableSeats: newSchedule.capacity
                })
            });

            if (response.ok) {
                setToast({ message: 'Schedule added successfully!', type: 'success', isVisible: true });
                if (selectedWorkshopId) fetchSchedules(selectedWorkshopId);
            } else {
                setToast({ message: 'Failed to add schedule', type: 'error', isVisible: true });
            }
        } catch (err) {
            setToast({ message: 'Error connecting to server', type: 'error', isVisible: true });
        }
    };

    const handleDeleteSchedule = async (scheduleId: number) => {
        if (!window.confirm('Are you sure you want to delete this session?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.workshop.base}/${selectedWorkshopId}/schedule/${scheduleId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setSchedules(prev => prev.filter(s => s.id !== scheduleId));
                setToast({ message: 'Session deleted', type: 'success', isVisible: true });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-deep-purple">Schedule Management</h2>
                    <p className="text-gray-500 mt-1">Add and manage slots for your workshops.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-orange/5 rounded-full blur-2xl -mr-12 -mt-12" />

                        <h3 className="text-xl font-bold text-deep-purple mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-primary-orange" />
                            Add Single Slot
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Workshop</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-primary-orange transition-all"
                                    value={selectedWorkshopId}
                                    onChange={(e) => setSelectedWorkshopId(Number(e.target.value))}
                                >
                                    {workshops.map(w => (
                                        <option key={w.id} value={w.id}>{w.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-primary-orange transition-all"
                                    value={newSchedule.date}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Starts At</label>
                                    <input
                                        type="time"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-primary-orange transition-all"
                                        value={newSchedule.startTime}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Duration</label>
                                    <div className="w-full bg-deep-purple/5 text-deep-purple/60 rounded-2xl p-4 text-sm font-medium border border-deep-purple/10 flex items-center gap-2">
                                        <Clock size={14} />
                                        {workshops.find(w => w.id === selectedWorkshopId)?.duration.split(':').slice(0, 2).map((v, i) => v + (i === 0 ? 'h ' : 'm')).join('')}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Capacity</label>
                                <input
                                    type="number"
                                    placeholder="Number of seats"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-primary-orange transition-all"
                                    value={newSchedule.capacity}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, capacity: Number(e.target.value) })}
                                />
                            </div>

                            <button
                                onClick={handleAddSchedule}
                                className="w-full bg-deep-purple text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-deep-purple/10 hover:bg-deep-purple/90 transition-all active:scale-95 mt-4"
                            >
                                <Plus size={18} />
                                Create Schedule
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-[500px]">
                                <div className="animate-spin h-8 w-8 border-4 border-primary-orange border-t-transparent rounded-full" />
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                                <CalendarIcon size={48} className="mb-4 opacity-20" />
                                <p>No sessions scheduled for this workshop.</p>
                            </div>
                        ) : (
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {schedules.map(schedule => (
                                        <div key={schedule.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col group hover:border-primary-orange/20 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-white rounded-2xl text-primary-orange shadow-sm">
                                                    <Clock size={20} />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatDate(schedule.startDateTime)}</p>
                                                <h4 className="text-xl font-bold text-deep-purple flex items-center gap-2">
                                                    {formatTime(schedule.startDateTime)}
                                                    <ArrowRight size={14} className="text-gray-300" />
                                                    {formatTime(schedule.endDateTime)}
                                                </h4>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-gray-200/50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-gray-400" />
                                                    <span className="text-sm font-bold text-deep-purple">
                                                        {schedule.availableSeats} / {schedule.maxCapacity}
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-1">Seats Available</span>
                                                    </span>
                                                </div>
                                                {schedule.isSoldOut && (
                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-red-50 rounded-lg">Sold Out</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
