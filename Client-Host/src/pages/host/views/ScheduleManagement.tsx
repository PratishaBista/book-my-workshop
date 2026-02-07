import React, { useState, useEffect, useMemo } from 'react';
import {
    Clock,
    Plus,
    Trash2,
    Filter,
    CheckSquare,
    Square,
    RefreshCw,
    X,
    CalendarDays,
    Settings,
    Users
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/api';
import Toast, { type ToastType } from '../../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Workshop {
    id: number;
    title: string;
    duration: string;
    maxCapacity: number;
    basePrice: number;
}

interface Schedule {
    id: number;
    workshopId: number;
    workshopTitle?: string; // Optional from backend
    basePrice?: number;     // Optional from backend
    startDateTime: string;
    endDateTime: string;
    availableSeats: number;
    maxCapacity: number;
    isSoldOut: boolean;
    status: number; // 0=Upcoming, 1=Completed, 2=Cancelled
}

interface ScheduleRow extends Schedule {
    workshopTitle: string;
    price: number;
}

interface PreviewSlot {
    workshopId: number;
    workshopTitle: string;
    startDateTime: string;
    endDateTime: string;
    availableSeats: number;
    maxCapacity: number;
}

const BulkGeneratorModal = ({
    workshops,
    onClose,
    onGenerate
}: {
    workshops: Workshop[];
    onClose: () => void;
    onGenerate: (slots: PreviewSlot[]) => Promise<void>;
}) => {
    const [step, setStep] = useState(1); // 1=Config, 2=Preview
    const [config, setConfig] = useState({
        workshopId: workshops[0]?.id || 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days: [0, 6], // Sun, Sat default
        times: ['10:00'],
        durationHours: 1,
        durationMinutes: 0,
        capacity: 10
    });
    const [previewSlots, setPreviewSlots] = useState<PreviewSlot[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const w = workshops.find(wk => wk.id === config.workshopId);
        if (w) {
            const [h, m] = w.duration.split(':').map(Number);
            setConfig(prev => ({
                ...prev,
                durationHours: h || 0,
                durationMinutes: m || 0,
                capacity: w.maxCapacity
            }));
        }
    }, [config.workshopId, workshops]);

    const DAYS = [
        { id: 0, label: 'Sun' }, { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' },
        { id: 3, label: 'Wed' }, { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' }
    ];

    const handleGeneratePreview = () => {
        const slots: PreviewSlot[] = [];
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);
        const workshop = workshops.find(w => w.id === config.workshopId);

        if (!workshop) return;

        // Custom duration
        const durationMs = (config.durationHours * 3600 + config.durationMinutes * 60) * 1000;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (config.days.includes(d.getDay())) {
                config.times.forEach(time => {
                    const [th, tm] = time.split(':').map(Number);
                    const slotStart = new Date(d);
                    slotStart.setHours(th, tm, 0, 0);

                    const slotEnd = new Date(slotStart.getTime() + durationMs);

                    slots.push({
                        workshopId: workshop.id,
                        workshopTitle: workshop.title,
                        startDateTime: slotStart.toISOString(),
                        endDateTime: slotEnd.toISOString(),
                        availableSeats: config.capacity,
                        maxCapacity: config.capacity
                    });
                });
            }
        }

        setPreviewSlots(slots);
        setStep(2);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans text-gray-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-gray-200"
            >
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Schedule Generation</h3>
                        <p className="text-gray-500 text-xs">Define patterns to bulk create availability slots.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-500"><X size={18} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    {step === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workshop</label>
                                    <select
                                        className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-deep-purple focus:border-deep-purple outline-none shadow-sm"
                                        value={config.workshopId}
                                        onChange={e => setConfig({ ...config, workshopId: Number(e.target.value) })}
                                    >
                                        {workshops.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</label>
                                        <input type="date" className="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-deep-purple"
                                            value={config.startDate} onChange={e => setConfig({ ...config, startDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</label>
                                        <input type="date" className="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-deep-purple"
                                            value={config.endDate} onChange={e => setConfig({ ...config, endDate: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Settings size={12} /> Duration Override</label>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="flex gap-1 items-center bg-gray-50 border border-gray-300 rounded-md px-2">
                                            <input type="number" min="0" className="w-12 p-1.5 bg-transparent outline-none text-sm text-center"
                                                value={config.durationHours} onChange={e => setConfig({ ...config, durationHours: Number(e.target.value) })} />
                                            <span className="text-xs text-gray-500 px-1">hrs</span>
                                        </div>
                                        <div className="flex gap-1 items-center bg-gray-50 border border-gray-300 rounded-md px-2">
                                            <input type="number" min="0" max="59" className="w-12 p-1.5 bg-transparent outline-none text-sm text-center"
                                                value={config.durationMinutes} onChange={e => setConfig({ ...config, durationMinutes: Number(e.target.value) })} />
                                            <span className="text-xs text-gray-500 px-1">mins</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Users size={12} /> Capacity Override</label>
                                    <input type="number" min="1" className="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-deep-purple"
                                        value={config.capacity} onChange={e => setConfig({ ...config, capacity: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Weekly Pattern</label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {DAYS.map(day => (
                                            <button
                                                key={day.id}
                                                onClick={() => {
                                                    if (config.days.includes(day.id)) setConfig({ ...config, days: config.days.filter(d => d !== day.id) });
                                                    else setConfig({ ...config, days: [...config.days, day.id].sort() });
                                                }}
                                                className={`w-9 h-9 rounded-md text-xs font-bold border transition-all ${config.days.includes(day.id)
                                                    ? 'bg-deep-purple border-deep-purple text-white'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                                                    }`}
                                            >
                                                {day.label[0]}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                                        Tip: Select Saturday (6) and Sunday (0) for peak demand.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Times</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[100px] content-start">
                                        {config.times.map((time, idx) => (
                                            <div key={idx} className="flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded text-sm font-medium shadow-sm">
                                                {time}
                                                <button onClick={() => setConfig({ ...config, times: config.times.filter((_, i) => i !== idx) })} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const t = prompt("Enter time (HH:MM) in 24h format", "09:00");
                                                if (t && /^\d{2}:\d{2}$/.test(t)) setConfig({ ...config, times: [...config.times, t].sort() });
                                            }}
                                            className="px-2 py-1 bg-white border border-dashed border-gray-400 text-gray-500 rounded text-sm hover:border-deep-purple hover:text-deep-purple transition-colors"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex gap-3 text-blue-800 text-sm items-center">
                                <CalendarDays size={18} />
                                <div>
                                    <p className="font-semibold">Ready to generate <span className="font-bold">{previewSlots.length} slots</span></p>
                                    <p className="text-xs opacity-80">Please verify the dates and times below.</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md shadow-inner bg-gray-50">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 text-gray-500 font-semibold sticky top-0 shadow-sm">
                                        <tr>
                                            <th className="p-3 border-b border-gray-200">Date</th>
                                            <th className="p-3 border-b border-gray-200">Time</th>
                                            <th className="p-3 border-b border-gray-200">Duration</th>
                                            <th className="p-3 border-b border-gray-200">Seats</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {previewSlots.map((slot, i) => {
                                            const start = new Date(slot.startDateTime);
                                            const end = new Date(slot.endDateTime);
                                            const diffMins = (end.getTime() - start.getTime()) / 60000;
                                            const durationStr = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;

                                            return (
                                                <tr key={i} className="hover:bg-blue-50/50">
                                                    <td className="p-3 text-gray-900 font-medium">{start.toLocaleDateString()}</td>
                                                    <td className="p-3 text-gray-600 font-mono">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                    <td className="p-3 text-gray-500 text-xs">{durationStr}</td>
                                                    <td className="p-3 text-gray-500 text-xs">{slot.maxCapacity}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    {step === 2 && <button onClick={() => setStep(1)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md border border-gray-300">Back</button>}

                    {step === 1 ? (
                        <button onClick={handleGeneratePreview} className="bg-deep-purple text-white px-5 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-deep-purple/90 transition-all">
                            Next: Preview
                        </button>
                    ) : (
                        <button
                            onClick={async () => {
                                setIsGenerating(true);
                                await onGenerate(previewSlots);
                                setIsGenerating(false);
                            }}
                            disabled={isGenerating}
                            className="bg-green-600 text-white px-5 py-2 rounded-md text-sm font-bold shadow-sm hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                            {isGenerating && <RefreshCw className="animate-spin" size={16} />}
                            Confirm Generation
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export const ScheduleManagement: React.FC = () => {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showGenerator, setShowGenerator] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const [toast, setToast] = useState({ message: '', type: 'success' as ToastType, isVisible: false });

    // Filter States
    const [filterWorkshop, setFilterWorkshop] = useState<number | 'all'>('all');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Parallel fetch
            const [wRes, sRes] = await Promise.all([
                fetch(`${API_ENDPOINTS.workshop.base}/my-workshops`, { headers }),
                fetch(API_ENDPOINTS.provider.schedule, { headers })
            ]);

            if (wRes.ok) {
                const wData = await wRes.json();
                setWorkshops(wData);

                if (sRes.ok) {
                    const sData: Schedule[] = await sRes.json();

                    const enriched = sData.map(s => {
                        // If backend already provided title/price, use them.
                        if (s.workshopTitle && s.basePrice !== undefined) {
                            return { ...s, workshopTitle: s.workshopTitle, price: s.basePrice };
                        }

                        // if API is cached
                        const w = wData.find((wk: Workshop) => wk.id === s.workshopId);
                        return {
                            ...s,
                            workshopTitle: w ? w.title : 'Unknown Workshop',
                            price: w ? w.basePrice : 0
                        };
                    });
                    setSchedules(enriched);
                }
            }
        } catch (err) {
            console.error(err);
            setToast({ message: 'Failed to load schedule data', type: 'error', isVisible: true });
        } finally {
            setLoading(false);
        }
    };

    const handleBulkGenerate = async (slots: PreviewSlot[]) => {
        try {
            const token = localStorage.getItem('token');
            const workshopId = slots[0].workshopId;

            const res = await fetch(`${API_ENDPOINTS.workshop.base}/${workshopId}/schedule/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(slots)
            });

            if (res.ok) {
                setToast({ message: `Successfully created ${slots.length} slots!`, type: 'success', isVisible: true });
                setShowGenerator(false);
                fetchInitialData(); // Refresh table
            } else {
                setToast({ message: 'Failed to create slots', type: 'error', isVisible: true });
            }
        } catch (err) {
            setToast({ message: 'Server error', type: 'error', isVisible: true });
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedSlots.length} slots?`)) return;

        try {
            const token = localStorage.getItem('token');
            let successCount = 0;

            for (const id of selectedSlots) {
                const slot = schedules.find(s => s.id === id);
                if (slot) {
                    const res = await fetch(`${API_ENDPOINTS.workshop.base}/${slot.workshopId}/schedule/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) successCount++;
                }
            }

            setToast({ message: `Deleted ${successCount} slots`, type: 'success', isVisible: true });
            setSelectedSlots([]);
            fetchInitialData();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredSchedules = useMemo(() => {
        let data = schedules;
        if (filterWorkshop !== 'all') {
            data = data.filter(s => s.workshopId === filterWorkshop);
        }
        if (filterDate) {
            data = data.filter(s => s.startDateTime.startsWith(filterDate));
        }
        return data.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
    }, [schedules, filterWorkshop, filterDate]);

    // Formatters
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="p-12 text-center text-gray-400">Loading schedules...</div>;

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Schedule Manager</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage time slots across all workshops.</p>
                </div>
                <div className="flex gap-3">
                    {selectedSlots.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-50 text-red-700 px-4 py-2 rounded-md font-semibold hover:bg-red-100 transition-all flex items-center gap-2 border border-red-200 text-sm"
                        >
                            <Trash2 size={16} />
                            Delete ({selectedSlots.length})
                        </button>
                    )}
                    <button
                        onClick={() => setShowGenerator(true)}
                        className="bg-deep-purple text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-deep-purple/90 transition-all flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        Add Slots
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 px-2">
                    <Filter size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
                </div>

                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                <select
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-deep-purple focus:border-deep-purple block p-2 outline-none"
                    value={filterWorkshop}
                    onChange={e => setFilterWorkshop(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                    <option value="all">All Workshops</option>
                    {workshops.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                </select>

                <input
                    type="date"
                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-deep-purple focus:border-deep-purple block p-2 outline-none"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                />

                {filterDate && (
                    <button onClick={() => setFilterDate('')} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-deep-purple border-gray-300 rounded focus:ring-deep-purple"
                                        checked={selectedSlots.length > 0 && selectedSlots.length === filteredSchedules.length}
                                        onChange={() => {
                                            if (selectedSlots.length === filteredSchedules.length) setSelectedSlots([]);
                                            else setSelectedSlots(filteredSchedules.map(s => s.id));
                                        }}
                                    />
                                </th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Workshop Items</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Revenue</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Utilization</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSchedules.map(slot => (
                                <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-deep-purple border-gray-300 rounded focus:ring-deep-purple"
                                            checked={selectedSlots.includes(slot.id)}
                                            onChange={() => {
                                                if (selectedSlots.includes(slot.id)) setSelectedSlots(prev => prev.filter(id => id !== slot.id));
                                                else setSelectedSlots(prev => [...prev, slot.id]);
                                            }}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 text-sm">{formatDate(slot.startDateTime)}</span>
                                            <span className="text-xs text-gray-500 font-mono mt-0.5">
                                                {formatTime(slot.startDateTime)} - {formatTime(slot.endDateTime)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-gray-700">{slot.workshopTitle}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-sm font-mono text-gray-600">Rs. {slot.price}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-32">
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="font-medium text-gray-700">{slot.maxCapacity - slot.availableSeats} Booked</span>
                                                <span className="text-gray-400">of {slot.maxCapacity}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                                <div
                                                    className={`h-full rounded-full ${slot.isSoldOut ? 'bg-red-500' : 'bg-green-500'}`}
                                                    style={{ width: `${((slot.maxCapacity - slot.availableSeats) / slot.maxCapacity) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {slot.isSoldOut ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Sold Out
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Available
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredSchedules.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                                        No schedules found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showGenerator && (
                    <BulkGeneratorModal
                        workshops={workshops}
                        onClose={() => setShowGenerator(false)}
                        onGenerate={handleBulkGenerate}
                    />
                )}
            </AnimatePresence>

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
};
